const mongoose = require('mongoose');

const groqUsageLogSchema = new mongoose.Schema(
  {
    keyLabel: { type: String, required: true },
    source: { type: String, enum: ['public_demo', 'authenticated'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ip: { type: String, default: '' },
    success: { type: Boolean, required: true },
    errorMessage: { type: String, default: '' },
    latencyMs: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Auto-expire logs after 30 days so this collection never grows unbounded.
groqUsageLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('GroqUsageLog', groqUsageLogSchema);
