const mongoose = require('mongoose');

// One document per user per calendar day. dateKey is a 'YYYY-MM-DD' string
// so it's easy to query "today" and to detect when a new day has started.
const healthLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateKey: { type: String, required: true }, // e.g. '2026-07-24'
    sleepMinutes: { type: Number, default: 0 },
    sleepLogged: { type: Boolean, default: false },
    steps: { type: Number, default: 0 },
    waterLitres: { type: Number, default: 0 },
    weightKg: { type: Number },
    weightLogged: { type: Boolean, default: false }
  },
  { timestamps: true }
);

healthLogSchema.index({ user: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('HealthLog', healthLogSchema);
