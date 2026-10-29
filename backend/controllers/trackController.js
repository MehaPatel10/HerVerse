const SiteVisitLog = require('../models/SiteVisitLog');
const { dateKeyFor } = require('../utils/dateKey');

// POST /api/track/visit  (public) - { visitorId }
// Every call is one visit (the frontend sends one per browser session),
// so repeat visits by the same person are counted too.
async function recordVisit(req, res) {
  const visitorId = String((req.body && req.body.visitorId) || '').trim().slice(0, 64);
  await SiteVisitLog.create({ day: dateKeyFor(), visitorId });
  res.json({ ok: true });
}

module.exports = { recordVisit };
