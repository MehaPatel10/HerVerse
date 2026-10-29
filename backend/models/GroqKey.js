const mongoose = require('mongoose');

// One document per Groq API key configured in GROQ_API_KEYS.
// We never store the raw key value here - only a label (KEY 1, KEY 2, ...)
// and usage/health stats, so the admin dashboard can show rotation status
// without exposing secrets in the database.
const groqKeySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true }, // e.g. "KEY 1"
    keyPreview: { type: String, default: '' }, // last 4 chars only, for identification
    isActive: { type: Boolean, default: true }, // admin can disable a key
    successCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    rateLimitCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: null },
    lastError: { type: String, default: '' },
    lastErrorAt: { type: Date, default: null },
    cooldownUntil: { type: Date, default: null } // temporarily skipped until this time
  },
  { timestamps: true }
);

module.exports = mongoose.model('GroqKey', groqKeySchema);
