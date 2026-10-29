const Maintenance = require('../models/Maintenance');

async function getSingleton() {
  let doc = await Maintenance.findOne();
  if (!doc) doc = await Maintenance.create({});
  return doc;
}

function computeIsActive(doc) {
  if (!doc.enabled || !doc.startAt || !doc.endAt) return false;
  const now = Date.now();
  return now >= new Date(doc.startAt).getTime() && now <= new Date(doc.endAt).getTime();
}

// GET /api/maintenance  (public, no auth) - used by the client app to
// decide whether to show the countdown screen instead of the app.
async function getPublicStatus(req, res) {
  const doc = await getSingleton();
  res.json({
    enabled: doc.enabled,
    isActive: computeIsActive(doc),
    startAt: doc.startAt,
    endAt: doc.endAt,
    message: doc.message
  });
}

// GET /api/admin/maintenance
async function getAdminStatus(req, res) {
  const doc = await getSingleton();
  res.json({ ...doc.toObject(), isActive: computeIsActive(doc) });
}

// PUT /api/admin/maintenance  { enabled, startAt, endAt, message }
async function updateMaintenance(req, res) {
  const doc = await getSingleton();
  const fields = ['enabled', 'startAt', 'endAt', 'message'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) doc[f] = req.body[f];
  });
  await doc.save();
  res.json({ ...doc.toObject(), isActive: computeIsActive(doc) });
}

module.exports = { getPublicStatus, getAdminStatus, updateMaintenance };
