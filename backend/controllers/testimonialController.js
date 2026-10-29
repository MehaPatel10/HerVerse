const Testimonial = require('../models/Testimonial');

// GET /api/testimonials  (public - published only)
async function listPublished(req, res) {
  const items = await Testimonial.find({ isPublished: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(20);
  res.json(items);
}

// GET /api/admin/testimonials (admin - all)
async function listAllAdmin(req, res) {
  const items = await Testimonial.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json(items);
}

// POST /api/admin/testimonials
async function createTestimonial(req, res) {
  const { name, message, rating, isPublished, sortOrder } = req.body;
  if (!name || !message) return res.status(400).json({ message: 'name and message are required' });
  const item = await Testimonial.create({ name, message, rating, isPublished: !!isPublished, sortOrder: sortOrder || 0 });
  res.status(201).json(item);
}

// PUT /api/admin/testimonials/:id
async function updateTestimonial(req, res) {
  const fields = ['name', 'message', 'rating', 'isPublished', 'sortOrder'];
  const update = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  });
  const item = await Testimonial.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!item) return res.status(404).json({ message: 'Testimonial not found' });
  res.json(item);
}

// DELETE /api/admin/testimonials/:id
async function deleteTestimonial(req, res) {
  const item = await Testimonial.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Testimonial not found' });
  res.json({ message: 'Deleted' });
}

module.exports = { listPublished, listAllAdmin, createTestimonial, updateTestimonial, deleteTestimonial };
