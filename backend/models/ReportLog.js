const mongoose = require('mongoose');

// One row per daily-health-report download or email, shown on the admin side.
const reportLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, default: '' },
    userPhone: { type: String, default: '' },
    action: { type: String, enum: ['download', 'email'], required: true },
    reportDate: { type: String, required: true }, // the day the report covers, YYYY-MM-DD
    sentToEmail: { type: String, default: '' }, // only for action = 'email'
    success: { type: Boolean, default: true },
    errorMessage: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReportLog', reportLogSchema);
