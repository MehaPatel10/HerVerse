const fetch = require('node-fetch');
const GroqKey = require('../models/GroqKey');
const GroqUsageLog = require('../models/GroqUsageLog');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const LUNA_SYSTEM_PROMPT = `You are LUNA, the AI wellness assistant inside HERVERSE, a women's health tracking app.

You can discuss and help with ANY health topic the user brings up - physical symptoms, injuries, chronic conditions, reproductive/menstrual health, mental health and emotional wellbeing (stress, anxiety, low mood, grief, etc.), sleep, nutrition, and general disease questions. Don't narrow yourself to only period/cycle topics - answer whatever the user actually asks about.

Rules you must always follow:
- You are not a doctor. Never diagnose a condition and never prescribe or name specific medication dosages.
- Give general, temporary self-care suggestions only (rest, hydration, warm compress, gentle movement, breathing exercises, etc.).
- For mental health topics, respond with warmth and without judgment. For anything suggesting a crisis (thoughts of self-harm or suicide), gently but clearly encourage the user to reach out to a crisis line, trusted person, or emergency services right away, and avoid any detail that could be unsafe.
- For anything that sounds physically severe (heavy bleeding, chest pain, difficulty breathing, fainting, severe pain, signs of stroke or heart attack), clearly tell the user to seek medical care or emergency services right away instead of self-treating.
- Never invent doctors, hospitals or addresses. Nearby doctor/hospital suggestions (within 10 km of the user's PIN code) are handled separately by the app, so don't list any yourself.
- Keep responses warm and easy to read (about 4-7 sentences, or a short list of tips when that is clearer). Cover the whole question the user asked, whatever the health topic.
- If the user is just chatting/greeting, respond warmly and briefly without forcing health advice.`;

const PUBLIC_DEMO_SYSTEM_PROMPT = `${LUNA_SYSTEM_PROMPT}

You are currently answering an ANONYMOUS visitor on the public homepage demo (limited to 3 free questions before they must sign up). Keep answers a little shorter and end by gently mentioning that creating a free HERVERSE account unlocks full personalized tracking, when it feels natural - don't force it into every reply.`;

// ---- Multi-key rotation -------------------------------------------------
// Keys are loaded once from env. Supports either:
//   GROQ_API_KEYS = "gsk_xxx,gsk_yyy,gsk_zzz"   (preferred, comma separated)
// or individual GROQ_API_KEY_1 .. GROQ_API_KEY_5, or a single GROQ_API_KEY.
function loadKeysFromEnv() {
  const keys = [];

  if (process.env.GROQ_API_KEYS) {
    process.env.GROQ_API_KEYS.split(',')
      .map((k) => k.trim())
      .filter(Boolean)
      .forEach((value, i) => keys.push({ label: `KEY ${i + 1}`, value }));
  }

  if (keys.length === 0) {
    for (let i = 1; i <= 10; i++) {
      const value = process.env[`GROQ_API_KEY_${i}`];
      if (value && value.trim()) keys.push({ label: `KEY ${i}`, value: value.trim() });
    }
  }

  if (keys.length === 0 && process.env.GROQ_API_KEY) {
    keys.push({ label: 'KEY 1', value: process.env.GROQ_API_KEY.trim() });
  }

  return keys;
}

const KEYS = loadKeysFromEnv();
let cursor = 0; // round-robin pointer, in-memory (per server process)

function maskKey(value) {
  if (!value || value.length < 8) return '****';
  return `****${value.slice(-4)}`;
}

// Make sure a GroqKey doc exists for every configured key so the admin
// dashboard has something to show even before any requests are made.
async function ensureKeyDocs() {
  for (const k of KEYS) {
    try {
      await GroqKey.findOneAndUpdate(
        { label: k.label },
        { $setOnInsert: { keyPreview: maskKey(k.value), isActive: true } },
        { upsert: true, new: true }
      );
    } catch (err) {
      // DB might not be connected yet at boot - safe to ignore, it'll
      // self-heal on the first real request.
    }
  }
}
ensureKeyDocs();

async function recordUsage({ label, success, errorMessage = '', rateLimited = false, source, userId, ip, latencyMs }) {
  try {
    const update = {
      $set: { lastUsedAt: new Date() },
      $inc: {}
    };
    if (success) update.$inc.successCount = 1;
    else {
      update.$inc.errorCount = 1;
      update.$set.lastError = errorMessage.slice(0, 300);
      update.$set.lastErrorAt = new Date();
    }
    if (rateLimited) {
      update.$inc.rateLimitCount = 1;
      update.$set.cooldownUntil = new Date(Date.now() + 60 * 1000); // 60s cooldown
    }
    await GroqKey.findOneAndUpdate({ label }, update, { upsert: true });
    await GroqUsageLog.create({
      keyLabel: label,
      source: source || 'authenticated',
      user: userId || null,
      ip: ip || '',
      success,
      errorMessage: errorMessage.slice(0, 300),
      latencyMs
    });
  } catch (err) {
    console.error('groqClient: failed to record usage', err.message);
  }
}

function nextKeyOrder() {
  // Returns keys starting from the current round-robin cursor, wrapping
  // around once, so every call tries every configured key at most once.
  const ordered = [];
  for (let i = 0; i < KEYS.length; i++) {
    ordered.push(KEYS[(cursor + i) % KEYS.length]);
  }
  cursor = (cursor + 1) % Math.max(KEYS.length, 1);
  return ordered;
}

/**
 * Calls Groq's OpenAI-compatible chat completion endpoint, rotating across
 * all configured keys and skipping any that are on cooldown or disabled.
 * @param {Array<{role, content}>} messages
 * @param {{ system?: string, source?: 'public_demo'|'authenticated', userId?: string, ip?: string }} opts
 */
async function askGroq(messages, opts = {}) {
  if (KEYS.length === 0) {
    throw new Error('No Groq API keys configured. Set GROQ_API_KEYS in backend/.env');
  }

  const dbKeys = await GroqKey.find({ label: { $in: KEYS.map((k) => k.label) } }).lean().catch(() => []);
  const stateByLabel = Object.fromEntries(dbKeys.map((k) => [k.label, k]));
  const now = Date.now();

  const candidates = nextKeyOrder().filter((k) => {
    const state = stateByLabel[k.label];
    if (!state) return true;
    if (state.isActive === false) return false;
    if (state.cooldownUntil && new Date(state.cooldownUntil).getTime() > now) return false;
    return true;
  });

  const tryOrder = candidates.length > 0 ? candidates : nextKeyOrder(); // fall back to trying everything anyway

  let lastErr;
  for (const k of tryOrder) {
    const started = Date.now();
    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${k.value}` },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
          messages: [{ role: 'system', content: opts.system || LUNA_SYSTEM_PROMPT }, ...messages],
          temperature: 0.6,
          max_tokens: 700
        })
      });

      if (response.status === 429) {
        const errText = await response.text();
        await recordUsage({ label: k.label, success: false, errorMessage: `429 rate limited: ${errText}`, rateLimited: true, source: opts.source, userId: opts.userId, ip: opts.ip, latencyMs: Date.now() - started });
        lastErr = new Error('Groq rate limit hit');
        continue; // try next key
      }

      if (!response.ok) {
        const errText = await response.text();
        await recordUsage({ label: k.label, success: false, errorMessage: `${response.status}: ${errText}`, source: opts.source, userId: opts.userId, ip: opts.ip, latencyMs: Date.now() - started });
        lastErr = new Error(`Groq API error (${response.status}): ${errText}`);
        continue; // try next key (bad/expired key etc.)
      }

      const data = await response.json();
      await recordUsage({ label: k.label, success: true, source: opts.source, userId: opts.userId, ip: opts.ip, latencyMs: Date.now() - started });
      return data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't come up with a response just now.";
    } catch (err) {
      await recordUsage({ label: k.label, success: false, errorMessage: err.message, source: opts.source, userId: opts.userId, ip: opts.ip, latencyMs: Date.now() - started });
      lastErr = err;
      continue;
    }
  }

  throw lastErr || new Error('All Groq keys failed');
}

function configuredKeyCount() {
  return KEYS.length;
}

module.exports = { askGroq, LUNA_SYSTEM_PROMPT, PUBLIC_DEMO_SYSTEM_PROMPT, configuredKeyCount };
