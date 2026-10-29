const mongoose = require('mongoose');

// One document per tier (free / gold / platinum). Admin can edit price,
// monthly token allowance and feature list at any time from the admin panel.
const pricingPlanSchema = new mongoose.Schema(
  {
    tier: { type: String, enum: ['free', 'gold', 'platinum'], required: true, unique: true },
    label: { type: String, required: true },
    priceINR: { type: Number, required: true, default: 0 }, // per month, in rupees
    monthlyTokens: { type: Number, required: true, default: 0 }, // 0 = n/a, -1 = unlimited
    features: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingPlan', pricingPlanSchema);
