// Looks up nearby hospitals/doctors for ANY Indian pincode using free,
// no-API-key OpenStreetMap services:
//   1. Nominatim  -> turns a pincode into latitude/longitude
//   2. Overpass   -> finds hospitals/clinics/doctors near that point
//
// This replaces the old Ahmedabad-only static list so LUNA and the
// Doctors & Hospitals page work anywhere in India (or beyond).
const fetch = require('node-fetch');
const { careDirectory, findCareFor, isAhmedabadPincode } = require('../data/careDirectory');

const MAX_RADIUS_KM = 10; // only ever suggest care within 10 km of the pincode

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const APP_UA = 'HERVERSE-HealthApp/1.0 (contact: herverseofficial26@gmail.com)';

// Simple in-memory cache so repeated chats about the same pincode don't
// keep hammering the public APIs (Nominatim/Overpass ask for this).
const geocodeCache = new Map(); // pincode -> { lat, lon, ts }
const resultsCache = new Map(); // pincode -> { data, ts }
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchJson(url, opts) {
  const resp = await fetch(url, opts);
  if (!resp.ok) throw new Error(`${url.split('?')[0]} error ${resp.status}`);
  return resp.json();
}

// Nominatim's structured `postalcode=` param has patchy coverage for
// Indian PIN codes, so we try a plain free-text search first (which
// matches much more reliably in practice) and only fall back to the
// structured query if that comes up empty.
async function geocodePincode(pincode) {
  const cached = geocodeCache.get(pincode);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached;

  const headers = { 'User-Agent': APP_UA, Accept: 'application/json' };
  const attempts = [
    `${NOMINATIM_URL}?q=${encodeURIComponent(pincode + ', India')}&format=json&limit=1&countrycodes=in`,
    `${NOMINATIM_URL}?postalcode=${encodeURIComponent(pincode)}&country=India&format=json&limit=1`
  ];

  let lastErr = null;
  for (const url of attempts) {
    try {
      const data = await fetchJson(url, { headers, timeout: 10000 });
      if (data && data.length) {
        const point = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), ts: Date.now() };
        geocodeCache.set(pincode, point);
        return point;
      }
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Pincode not found');
}

// careType: 'hospital' | 'doctor' | 'both'
function buildOverpassQuery(lat, lon, radiusM, careType = 'both') {
  const parts = [];
  const add = (kind, filter) => parts.push(`${kind}${filter}(around:${radiusM},${lat},${lon});`);
  if (careType === 'hospital' || careType === 'both') {
    ['node', 'way'].forEach((k) => add(k, '["amenity"="hospital"]'));
  }
  if (careType === 'doctor' || careType === 'both') {
    ['node', 'way'].forEach((k) => {
      add(k, '["amenity"="clinic"]');
      add(k, '["amenity"="doctors"]');
      add(k, '["healthcare"="doctor"]');
    });
  }
  return `
    [out:json][timeout:25];
    (
      ${parts.join('\n      ')}
    );
    out center tags 150;
  `;
}

function elementCoords(el) {
  if (el.lat && el.lon) return { lat: el.lat, lon: el.lon };
  if (el.center) return { lat: el.center.lat, lon: el.center.lon };
  return null;
}

function humanAddress(tags = {}) {
  const parts = [tags['addr:housenumber'], tags['addr:street'] || tags['addr:place'], tags['addr:suburb'], tags['addr:city']].filter(Boolean);
  return parts.join(', ');
}

function guessDoctorName(tags = {}, isHospital) {
  if (!isHospital && tags.name && /\bdr\.?\s/i.test(tags.name)) return tags.name;
  if (tags['contact:person']) return tags['contact:person'];
  if (!isHospital && tags.operator && /\bdr\.?\s/i.test(tags.operator)) return tags.operator;
  return '';
}

// Rough keyword map so we can bias results toward the specialist a
// symptom actually needs, even though most OSM clinic entries don't
// carry a structured `healthcare:speciality` tag. Hospitals are always
// treated as broadly relevant since they cover every specialty anyway.
const SPECIALTY_KEYWORDS = {
  Gynaecologist: ['gynaec', 'gynec', 'obstetric', "women's", 'maternity'],
  'General Physician': ['general', 'physician', 'family medicine'],
  Orthopedician: ['ortho'],
  Dermatologist: ['dermat', 'skin'],
  Gastroenterologist: ['gastro'],
  'ENT Specialist': ['ent', 'otolaryngolog', 'ear nose throat'],
  Ophthalmologist: ['ophthalm', 'eye'],
  Pulmonologist: ['pulmonolog', 'chest', 'respiratory'],
  Urologist: ['urolog'],
  Dentist: ['dent'],
  Endocrinologist: ['endocrin'],
  'Psychologist / Counselor': ['psycholog', 'psychiatr', 'counsel', 'mental health'],
  'General Surgeon': ['surg'],
  Cardiologist: ['cardio', 'heart'],
  Pediatrician: ['pediatric', 'paediatric', 'child']
};

function specialtyMatchScore(tags, isHospital, specialists = []) {
  if (isHospital) return 2; // multi-specialty by nature - always relevant
  if (!specialists.length) return 1;
  const haystack = `${tags['healthcare:speciality'] || ''} ${tags.name || ''} ${tags.healthcare || ''}`.toLowerCase();
  const hit = specialists.some((s) => (SPECIALTY_KEYWORDS[s] || []).some((kw) => haystack.includes(kw)));
  return hit ? 3 : 1;
}

async function findNearbyHospitals(pincode, { radiusM = MAX_RADIUS_KM * 1000, limit = 10, specialists = [], careType = 'both' } = {}) {
  radiusM = Math.min(radiusM, MAX_RADIUS_KM * 1000);
  const cacheKey = `${pincode}:${radiusM}:${careType}`;
  let elements = resultsCache.get(cacheKey);
  if (!elements || Date.now() - elements.ts >= CACHE_TTL_MS) {
    const { lat, lon } = await geocodePincode(pincode);
    const query = buildOverpassQuery(lat, lon, radiusM, careType);
    const json = await fetchJson(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'User-Agent': APP_UA },
      body: query,
      timeout: 25000
    });
    elements = { data: { lat, lon, raw: json.elements || [] }, ts: Date.now() };
    resultsCache.set(cacheKey, elements);
  }

  const { lat, lon, raw } = elements.data;

  const results = raw
    .map((el) => {
      const coords = elementCoords(el);
      if (!coords || !el.tags || !el.tags.name) return null;
      const isHospital = el.tags.amenity === 'hospital';
      return {
        name: el.tags.name,
        type: isHospital ? 'hospital' : 'doctor',
        role: isHospital ? (el.tags.healthcare_speciality || 'Multispecialty Hospital') : (el.tags['healthcare:speciality'] || 'General Practice'),
        doctorName: guessDoctorName(el.tags, isHospital),
        area: humanAddress(el.tags) || el.tags['addr:suburb'] || '',
        phone: el.tags.phone || el.tags['contact:phone'] || '',
        distanceKm: Math.round(haversineKm(lat, lon, coords.lat, coords.lon) * 10) / 10,
        icon: isHospital ? '🏥' : '👩‍⚕️',
        _score: specialtyMatchScore(el.tags, isHospital, specialists)
      };
    })
    .filter(Boolean)
    .filter((r) => r.distanceKm <= MAX_RADIUS_KM)
    .filter((r) => careType === 'both' || r.type === careType)
    .sort((a, b) => (b._score - a._score) || (a.distanceKm - b.distanceKm))
    .slice(0, limit)
    .map(({ _score, ...rest }) => rest);

  return results;
}

// Falls back to the curated static directory if the live OSM lookup
// fails (offline sandbox, API downtime, unrecognised pincode, etc.), but
// still filters by specialist so different symptoms show different care
// instead of always the same top-rated list regardless of what's wrong.
function staticFallback(specialists = [], severity = 'moderate', limit = 8, careType = 'both') {
  const matched = findCareFor(specialists, severity);
  const seen = new Set(matched.map((c) => c.name));
  const filler = careDirectory.filter((c) => !seen.has(c.name)).sort((a, b) => b.rating - a.rating);
  const pool = [...matched, ...filler].filter((c) => careType === 'both' || c.type === careType).slice(0, limit);

  return pool.map((c) => ({
    name: c.name,
    type: c.type,
    role: c.role,
    doctorName: c.type === 'doctor' ? c.name : 'On-duty doctor (ask at reception)',
    area: c.area,
    pincode: c.pincode,
    distanceKm: parseFloat(c.distance) || null,
    distance: c.distance,
    rating: c.rating,
    reviews: c.reviews,
    icon: c.icon
  }));
}

// Public helper used by controllers. Returns up to 10 results within 10 km
// of the pincode, filtered by careType ('hospital' | 'doctor' | 'both').
// `source` is 'live' (map lookup), 'fallback' (curated Ahmedabad list, only
// used for Ahmedabad pincodes when the live lookup is down) or 'unavailable'.
async function getHospitalsByPincode(pincode, opts = {}) {
  const { specialists = [], severity = 'moderate', careType = 'both' } = opts;
  try {
    const live = await findNearbyHospitals(pincode, { ...opts, careType });
    return { results: live, source: 'live' };
  } catch (err) {
    if (isAhmedabadPincode(pincode)) {
      return { results: staticFallback(specialists, severity, 8, careType), source: 'fallback', error: err.message };
    }
    return { results: [], source: 'unavailable', error: err.message };
  }
}

module.exports = { getHospitalsByPincode, geocodePincode, findNearbyHospitals, MAX_RADIUS_KM };
