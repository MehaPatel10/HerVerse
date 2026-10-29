const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    startAt: { type: Date },
    endAt: { type: Date },
    message: { type: String, default: "We're making some improvements. HERVERSE will be back shortly." }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
