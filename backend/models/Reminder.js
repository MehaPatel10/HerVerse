const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['Water', 'Steps', 'Sleep', 'Medication', 'Appointment', 'Custom'], required: true },
    label: { type: String, required: true },
    time: { type: String, required: true }, // 'HH:MM'
    on: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', reminderSchema);
