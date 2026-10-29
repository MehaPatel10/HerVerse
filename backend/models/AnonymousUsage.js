const mongoose = require('mongoose');

const anonymousUsageSchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnonymousUsage', anonymousUsageSchema);
