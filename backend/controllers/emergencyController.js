const EmergencyContact = require('../models/EmergencyContact');

// GET /api/emergency/contacts
async function getContacts(req, res) {
  const contacts = await EmergencyContact.find({ user: req.user._id }).sort({ createdAt: 1 });
  res.json(contacts);
}

// POST /api/emergency/contacts   { name, relation, phone }
async function addContact(req, res) {
  const { name, relation, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ message: 'Name and phone number are required' });

  const contact = await EmergencyContact.create({ user: req.user._id, name, relation, phone });
  res.status(201).json(contact);
}

// DELETE /api/emergency/contacts/:id
async function deleteContact(req, res) {
  await EmergencyContact.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
}

module.exports = { getContacts, addContact, deleteContact };
