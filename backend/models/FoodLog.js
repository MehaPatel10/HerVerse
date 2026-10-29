const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateKey: { type: String, required: true }, // 'YYYY-MM-DD'
    meal: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
    name: { type: String, required: true },
    qty: { type: Number, default: 1 },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodLog', foodLogSchema);
