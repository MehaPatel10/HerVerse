const mongoose = require('mongoose');

// One row per website visit (a new browser session). The same person
// visiting several times in a day creates several rows.
const siteVisitLogSchema = new mongoose.Schema(
  {
    day: { type: String, required: true, index: true }, // YYYY-MM-DD (server local date)
    visitorId: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteVisitLog', siteVisitLogSchema);
