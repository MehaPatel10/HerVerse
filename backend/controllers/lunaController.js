const { askGroq, PUBLIC_DEMO_SYSTEM_PROMPT } = require('../utils/groqClient');
const { analyzeSymptoms, isSmallTalk } = require('../data/symptomLibrary');
const { areaForPincode } = require('../data/careDirectory');
const { getHospitalsByPincode, MAX_RADIUS_KM } = require('../utils/mapService');
const { hasTokens, deductToken, COST_PER_MESSAGE } = require('../utils/tokenPolicy');
const { incrementAnonymousUsage, countFor, FREE_LIMIT } = require('../middleware/anonymousLimiter');

const PINCODE_RE = /\b(\d{6})\b/;
const CARE_OFFER_MARKER = 'suggest nearby doctors or hospitals';
const CARE_CHOOSE_MARKER = 'doctors or hospitals?';
const HOSPITAL_RE = /\bhospitals?\b/i;
const DOCTOR_RE = /\b(doctors?|clinics?|specialists?|physicians?|dr)\b/i;
const BOTH_RE = /^\s*(both|either|any)\b/i;
const AFFIRMATIVE_RE = /^(yes|yeah|yep|yup|sure|ok(ay)?|please( do)?|haan|yaa|y)[\s!.,]*$/i;
const NEGATIVE_RE = /^(no|nope|nah|not now|no thanks?)[\s!.,]*$/i;

function extractPincode(text) {
  const match = (text || '').match(PINCODE_RE);
  return match ? match[1] : null;
}

// Which kind of care is being asked for? 'hospital', 'doctor', 'both' or null.
function detectCareType(text, botAskedCare) {
  const wantsHospital = HOSPITAL_RE.test(text || '');
  const wantsDoctor = DOCTOR_RE.test(text || '');
  if (wantsHospital && wantsDoctor) return 'both';
  if (wantsHospital) return 'hospital';
  if (wantsDoctor) return 'doctor';
  if (botAskedCare && BOTH_RE.test(text || '')) return 'both';
  return null;
}

// Did LUNA's last message offer / ask about nearby care?
function lastBotAskedCare(history = []) {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role !== 'user') {
      const c = (history[i].content || '').toLowerCase();
      return c.includes(CARE_OFFER_MARKER) || c.includes(CARE_CHOOSE_MARKER);
    }
  }
  return false;
}

// Most recent user message that actually described a health concern (skips
// "doctors", "yes", bare PIN codes etc.), so the care search still knows what
// the person needs help with.
function findLastSymptom(history = []) {
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    if (h.role !== 'user') continue;
    const t = (h.content || '').trim();
    if (!t || /^\d{6}$/.test(t) || AFFIRMATIVE_RE.test(t) || NEGATIVE_RE.test(t) || isSmallTalk(t)) continue;
    if ((HOSPITAL_RE.test(t) || DOCTOR_RE.test(t)) && t.split(/\s+/).length <= 6) continue;
    return t;
  }
  return '';
}

const CARE_OFFER_TEXT = `If you'd like, I can ${CARE_OFFER_MARKER} within ${MAX_RADIUS_KM} km of your PIN code - just type "doctors" or "hospitals".`;

function formatCareText(results) {
  return results
    .map((c, i) => `${i + 1}. ${c.type === 'doctor' && c.doctorName && /dr/i.test(c.doctorName) && c.doctorName !== c.name ? c.doctorName + ' - ' : ''}${c.name} (${c.role})${c.area ? ', ' + c.area : ''}${c.distanceKm != null ? ' - ' + c.distanceKm + ' km' : ''}${c.phone ? ' - ' + c.phone : ''}`)
    .join('\n');
}

// Builds the "here's what's nearby" reply for the chosen care type, or asks
// for what's missing (care type / PIN code).
async function buildCareReply(symptomText, suppliedPincode, user, careType, { listInReply = false } = {}) {
  if (!careType) {
    return { reply: 'Would you like me to look for doctors or hospitals?', suggestedCare: [] };
  }
  const label = careType === 'hospital' ? 'hospitals' : careType === 'doctor' ? 'doctors' : 'doctors and hospitals';
  const singular = { hospital: 'hospital', doctor: 'doctor' }[careType] || 'place';
  const effectivePincode = suppliedPincode || (user && user.pincode) || null;

  if (!effectivePincode) {
    return { reply: `Sure! Please share your 6-digit PIN code and I'll find ${label} within ${MAX_RADIUS_KM} km.`, needPincode: true, careType, suggestedCare: [] };
  }
  if (!/^\d{6}$/.test(effectivePincode)) {
    return { reply: "That doesn't look like a valid 6-digit PIN code - please double check it and send it again.", needPincode: true, careType, suggestedCare: [] };
  }

  const localMatch = analyzeSymptoms(symptomText || '');
  const { results, source } = await getHospitalsByPincode(effectivePincode, { specialists: localMatch.specialists, severity: localMatch.severity, careType, radiusM: MAX_RADIUS_KM * 1000 });

  const area = areaForPincode(effectivePincode);
  let reply;
  if (!results.length) {
    reply = source === 'unavailable'
      ? `I couldn't reach the map service just now to look up ${label} near PIN ${effectivePincode}. Please try again in a moment.`
      : `I couldn't find any ${label} within ${MAX_RADIUS_KM} km of PIN ${effectivePincode}. You could try a nearby PIN code, or use a local directory or emergency number if it's urgent.`;
  } else {
    reply = `Here ${results.length === 1 ? 'is' : 'are'} ${results.length} ${results.length === 1 ? singular : label} within ${MAX_RADIUS_KM} km of PIN ${effectivePincode}${area ? ` (${area})` : ''}:`;
    if (source === 'fallback') reply += " (live map lookup wasn't reachable just now, so these are our best local matches)";
    if (listInReply) reply += '\n' + formatCareText(results);
  }

  return { reply, suggestedCare: results, savePincode: suppliedPincode || null };
}

// Decides whether this message is part of the doctor/hospital flow. Returns a
// result object to send back, or null to continue with a normal AI answer.
async function handleCareFlow({ trimmed, history, suppliedPincode, user, listInReply }) {
  const botAsked = lastBotAskedCare(history);

  if (botAsked && NEGATIVE_RE.test(trimmed)) {
    return { reply: "No worries — I'm here if you need anything else. 🌙", suggestedCare: [], free: true };
  }

  let careType = detectCareType(trimmed, botAsked);

  // A bare PIN code right after LUNA asked for one: reuse the care type they asked for earlier.
  if (!careType && /^\d{6}$/.test(trimmed)) {
    const lastBot = [...history].reverse().find((h) => h.role !== 'user');
    if (lastBot && /6-digit pin code/i.test(lastBot.content || '')) {
      const prevCare = [...history].reverse().find((h) => h.role === 'user' && detectCareType(h.content, false));
      careType = prevCare ? detectCareType(prevCare.content, false) : 'both';
    }
  }
  const isYes = botAsked && AFFIRMATIVE_RE.test(trimmed);
  if (!careType && !isYes) return null;

  // A bare "yes" doesn't say which kind of care - ask (no buttons, they just type it).
  if (!careType) {
    return { reply: 'Would you like me to look for doctors or hospitals?', suggestedCare: [], free: true };
  }

  const symptomText = findLastSymptom(history) || trimmed;
  const result = await buildCareReply(symptomText, suppliedPincode, user, careType, { listInReply });
  return result;
}

// POST /api/luna/chat  (authenticated) - { message, history, pincode? }
async function chat(req, res) {
  const { message, history = [], pincode } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required' });

  const user = req.user;
  if (!hasTokens(user)) {
    return res.status(402).json({
      message: 'You are out of AI tokens for your current plan.',
      outOfTokens: true,
      tier: user.tier,
      tokenBalance: user.tokenBalance
    });
  }

  const trimmed = message.trim();
  const suppliedPincode = (pincode && String(pincode).trim()) || extractPincode(message);
  const base = { tier: user.tier, tokenBalance: user.tokenBalance };

  const care = await handleCareFlow({ trimmed, history, suppliedPincode, user, listInReply: true });
  if (care) {
    if (care.savePincode && !user.pincode) {
      user.pincode = care.savePincode;
      await user.save();
    }
    const { free, savePincode, ...payload } = care;
    return res.json({ ...payload, ...base });
  }

  const chatHistory = history.slice(-8).map((h) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content }));

  // Small talk - normal friendly reply, no symptom/care logic.
  if (isSmallTalk(trimmed)) {
    try {
      const reply = await askGroq([...chatHistory, { role: 'user', content: message }], { source: 'authenticated', userId: user._id, ip: req.ip });
      await deductToken(user);
      return res.json({ reply, suggestedCare: [], tier: user.tier, tokenBalance: user.tokenBalance });
    } catch (err) {
      return res.json({ reply: 'Hi! How are you feeling today? 🌙', suggestedCare: [], ...base });
    }
  }

  // Any health / body / mind question: answer it, then mention (as plain text,
  // no buttons) that they can ask for nearby doctors or hospitals.
  const localMatch = analyzeSymptoms(message);
  const groundingNote = `\n\n(For your reference, our internal symptom checker flagged this as "${localMatch.severity}" severity, commonly seen by a ${localMatch.specialists.join(' / ')}. Answer the question fully. For symptoms, share general, temporary self-care guidance only - don't list nearby doctors/hospitals yourself, that's handled separately.)`;

  try {
    let reply = await askGroq([...chatHistory, { role: 'user', content: message + groundingNote }], { source: 'authenticated', userId: user._id, ip: req.ip });
    await deductToken(user);
    reply += `\n\n${CARE_OFFER_TEXT}`;
    res.json({ reply, severity: localMatch.severity, suggestedCare: [], tier: user.tier, tokenBalance: user.tokenBalance });
  } catch (err) {
    // All Groq keys failed / not configured - local rule-based fallback, no token charged.
    const fallback = `${localMatch.causes} For now, this might help: ${localMatch.relief}\n\n${CARE_OFFER_TEXT}`;
    res.json({ reply: fallback, severity: localMatch.severity, suggestedCare: [], ...base, note: 'Groq API unavailable right now - using local fallback.' });
  }
}

// POST /api/luna/public-chat  (anonymous, homepage demo) - { message, history }
// Gated by checkAnonymousLimit middleware (3 free messages per IP, lifetime).
// The demo has no PIN field, so results are listed inside the reply text.
async function publicChat(req, res) {
  const { message, history = [], pincode } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required' });

  const trimmed = message.trim();
  const suppliedPincode = (pincode && String(pincode).trim()) || extractPincode(message);
  const remaining = async () => Math.max(0, FREE_LIMIT - (await incrementAnonymousUsage(req.anonIp)).count);
  const remainingNoCharge = () => Math.max(0, FREE_LIMIT - countFor(req.anonUsage));

  const care = await handleCareFlow({ trimmed, history, suppliedPincode, user: null, listInReply: true });
  if (care) {
    const { free, savePincode, suggestedCare, needPincode, ...payload } = care;
    if (needPincode) payload.reply = payload.reply.replace(/^Sure! Please share/, 'Sure! Please type');
    // Doctor/hospital lookups don't use the AI, so they don't use up a free question.
    return res.json({ ...payload, suggestedCare: [], remaining: remainingNoCharge() });
  }

  const chatHistory = history.slice(-6).map((h) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content }));
  const opts = { system: PUBLIC_DEMO_SYSTEM_PROMPT, source: 'public_demo', ip: req.anonIp };

  if (isSmallTalk(trimmed)) {
    try {
      const reply = await askGroq([...chatHistory, { role: 'user', content: message }], opts);
      return res.json({ reply, suggestedCare: [], remaining: await remaining() });
    } catch (err) {
      return res.json({ reply: 'Hi! How are you feeling today? 🌙', suggestedCare: [], remaining: await remaining() });
    }
  }

  const localMatch = analyzeSymptoms(message);
  const groundingNote = `\n\n(For your reference, our internal symptom checker flagged this as "${localMatch.severity}" severity, commonly seen by a ${localMatch.specialists.join(' / ')}. Answer the question fully. For symptoms, share general, temporary self-care guidance only - don't list nearby doctors/hospitals yourself, that's handled separately.)`;

  try {
    let reply = await askGroq([...chatHistory, { role: 'user', content: message + groundingNote }], opts);
    reply += `\n\n${CARE_OFFER_TEXT}`;
    res.json({ reply, suggestedCare: [], remaining: await remaining() });
  } catch (err) {
    const fallback = `${localMatch.causes} For now, this might help: ${localMatch.relief}\n\n${CARE_OFFER_TEXT}`;
    res.json({ reply: fallback, suggestedCare: [], remaining: await remaining(), note: 'Groq API unavailable right now - using local fallback.' });
  }
}

module.exports = { chat, publicChat };
