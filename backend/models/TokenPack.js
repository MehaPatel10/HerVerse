const mongoose = require('mongoose');

const tokenPackSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "8 Tokens"
    tokens: { type: Number, required: true },
    priceINR: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TokenPack', tokenPackSchema);
