const { analyzeSymptoms } = require('../data/symptomLibrary');
const { findCareFor, careDirectory, areaForPincode } = require('../data/careDirectory');
const { getHospitalsByPincode } = require('../utils/mapService');

// POST /api/doctors/check-symptoms   { text, pincode? }
async function checkSymptoms(req, res) {
  const { text, pincode } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: 'Describe your symptoms to run the check' });

  const result = analyzeSymptoms(text);

  // Specialist-matched static list (Ahmedabad-only by construction) as the
  // default / fallback - never the same list regardless of symptom.
  let care = findCareFor(result.specialists, result.severity);
  let locationNote = null;
  let areaName = null;
  let careSource = 'static';

  const effectivePincode = (pincode && String(pincode).trim()) || (req.user && req.user.pincode) || null;

  if (effectivePincode) {
    const clean = String(effectivePincode).trim();
    if (!/^\d{6}$/.test(clean)) {
      locationNote = 'That doesn\u2019t look like a valid 6-digit PIN code - please double check it.';
    } else {
      areaName = areaForPincode(clean);
      const careType = ['hospital', 'doctor'].includes(req.body.careType) ? req.body.careType : 'both';
      const { results, source } = await getHospitalsByPincode(clean, { specialists: result.specialists, severity: result.severity, careType });
      careSource = source;
      care = results; // live results within 10 km of the pincode
      if (source === 'fallback') {
        locationNote = "We couldn't reach the live map service just now, so here are our best local matches instead.";
      } else if (source === 'unavailable') {
        locationNote = "We couldn't reach the live map service just now - please try again in a moment.";
      } else if (!results.length) {
        locationNote = 'No matching places found within 10 km of this PIN code.';
      }
    }
  }

  res.json({ ...result, care, careSource, locationNote, areaName });
}

// GET /api/doctors  -> full static directory (browsable fallback list, Ahmedabad only)
async function listCare(req, res) {
  res.json(careDirectory);
}

// GET /api/doctors/by-pincode/:pincode  -> 5-10 live hospitals/doctors near an Ahmedabad pincode
async function byPincode(req, res) {
  const { pincode } = req.params;
  const clean = String(pincode || '').trim();
  if (!/^\d{6}$/.test(clean)) {
    return res.status(400).json({ message: 'A valid 6-digit pincode is required' });
  }
  const careType = ['hospital', 'doctor'].includes(req.query.type) ? req.query.type : 'both';
  const { results, source, error } = await getHospitalsByPincode(clean, { careType });
  res.json({ pincode: clean, area: areaForPincode(clean), results, source, error: error || undefined });
}

module.exports = { checkSymptoms, listCare, byPincode };
