const Reminder = require('../models/Reminder');

// GET /api/reminders
async function getReminders(req, res) {
  const reminders = await Reminder.find({ user: req.user._id }).sort({ time: 1 });
  res.json(reminders);
}

// POST /api/reminders   { type, label, time }
async function addReminder(req, res) {
  const { type, label, time } = req.body;
  if (!type || !label || !time) return res.status(400).json({ message: 'type, label and time are required' });

  const reminder = await Reminder.create({ user: req.user._id, type, label, time });
  res.status(201).json(reminder);
}

// PUT /api/reminders/:id/toggle
async function toggleReminder(req, res) {
  const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
  if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
  reminder.on = !reminder.on;
  await reminder.save();
  res.json(reminder);
}

// DELETE /api/reminders/:id
async function deleteReminder(req, res) {
  await Reminder.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
}

module.exports = { getReminders, addReminder, toggleReminder, deleteReminder };
