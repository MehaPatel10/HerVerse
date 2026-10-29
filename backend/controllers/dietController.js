const FoodLog = require('../models/FoodLog');
const { foodDatabase, generatePlan, getGramTargets, matchesDiet, matchesCuisine, CUISINES } = require('../data/foodDatabase');

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function parseCuisines(q) {
  if (!q) return [];
  if (Array.isArray(q)) return q;
  return String(q).split(',').map((c) => c.trim()).filter(Boolean);
}

async function getCuisines(req, res) {
  res.json(CUISINES);
}

async function getPlan(req, res) {
  const dietType = req.query.dietType || req.user.dietType || 'Vegetarian';
  const goal = req.query.goal || req.user.dietGoal || 'General wellness';
  const cuisines = parseCuisines(req.query.cuisines);
  const { plan, targets } = generatePlan(dietType, goal, cuisines);
  res.json({ plan, targets, dietType, goal, cuisines });
}

async function getFoods(req, res) {
  const dietType = req.query.dietType || req.user.dietType || 'Vegetarian';
  const cuisines = parseCuisines(req.query.cuisines);
  // Strict match only - never fall back to other cuisines. If this
  // combination has no matches, the person sees an empty list and can
  // widen their cuisine selection, rather than getting dishes they didn't ask for.
  const foods = foodDatabase.filter((f) => matchesDiet(f, dietType) && matchesCuisine(f, cuisines));
  res.json(foods);
}

async function getTodayLog(req, res) {
  const logs = await FoodLog.find({ user: req.user._id, dateKey: todayKey() }).sort({ createdAt: 1 });
  const totals = logs.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const targets = getGramTargets(req.user.dietGoal || 'General wellness');
  res.json({ logs, totals, targets });
}

async function addFoodLog(req, res) {
  const { meal, name, qty = 1, calories, protein = 0, carbs = 0, fat = 0 } = req.body;
  if (!meal || !name || !calories) {
    return res.status(400).json({ message: 'meal, name and calories are required' });
  }
  const entry = await FoodLog.create({
    user: req.user._id,
    dateKey: todayKey(),
    meal,
    name,
    qty,
    calories: calories * qty,
    protein: protein * qty,
    carbs: carbs * qty,
    fat: fat * qty
  });
  res.status(201).json(entry);
}

async function deleteFoodLog(req, res) {
  await FoodLog.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
}

module.exports = { getPlan, getFoods, getTodayLog, addFoodLog, deleteFoodLog, getCuisines };
