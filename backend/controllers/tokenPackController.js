const TokenPack = require('../models/TokenPack');

// GET /api/token-packs  (public)
async function listTokenPacks(req, res) {
  const packs = await TokenPack.find({ isActive: true }).sort({ sortOrder: 1, tokens: 1 });
  res.json(packs);
}

// GET /api/admin/token-packs (admin, includes inactive)
async function listTokenPacksAdmin(req, res) {
  const packs = await TokenPack.find().sort({ sortOrder: 1, tokens: 1 });
  res.json(packs);
}

// POST /api/admin/token-packs { label, tokens, priceINR, sortOrder }
async function createTokenPack(req, res) {
  const { label, tokens, priceINR, sortOrder } = req.body;
  if (!label || !tokens || priceINR === undefined) {
    return res.status(400).json({ message: 'label, tokens and priceINR are required' });
  }
  const pack = await TokenPack.create({ label, tokens, priceINR, sortOrder: sortOrder || 0 });
  res.status(201).json(pack);
}

// PUT /api/admin/token-packs/:id
async function updateTokenPack(req, res) {
  const fields = ['label', 'tokens', 'priceINR', 'isActive', 'sortOrder'];
  const update = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  });
  const pack = await TokenPack.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!pack) return res.status(404).json({ message: 'Token pack not found' });
  res.json(pack);
}

// DELETE /api/admin/token-packs/:id
async function deleteTokenPack(req, res) {
  const pack = await TokenPack.findByIdAndDelete(req.params.id);
  if (!pack) return res.status(404).json({ message: 'Token pack not found' });
  res.json({ message: 'Deleted' });
}

module.exports = { listTokenPacks, listTokenPacksAdmin, createTokenPack, updateTokenPack, deleteTokenPack };
