const mongoose = require('mongoose');

const periodLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    cycleLength: { type: Number, default: 28 },
    symptoms: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('PeriodLog', periodLogSchema);
