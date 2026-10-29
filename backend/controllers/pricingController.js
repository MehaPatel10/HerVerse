const PricingPlan = require('../models/PricingPlan');

// GET /api/pricing  (public - homepage + subscription page)
async function listPricing(req, res) {
  const plans = await PricingPlan.find({ isActive: true }).sort({ priceINR: 1 });
  res.json(plans);
}

// GET /api/admin/pricing  (admin - includes inactive)
async function listPricingAdmin(req, res) {
  const plans = await PricingPlan.find().sort({ priceINR: 1 });
  res.json(plans);
}

// PUT /api/admin/pricing/:tier  { priceINR, monthlyTokens, label, features, isActive }
async function updatePricing(req, res) {
  const { tier } = req.params;
  const fields = ['priceINR', 'monthlyTokens', 'label', 'features', 'isActive'];
  const update = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  });

  const plan = await PricingPlan.findOneAndUpdate({ tier }, update, { new: true, upsert: false });
  if (!plan) return res.status(404).json({ message: `No pricing plan found for tier "${tier}"` });
  res.json(plan);
}

module.exports = { listPricing, listPricingAdmin, updatePricing };
