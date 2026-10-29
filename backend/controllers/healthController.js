const HealthLog = require('../models/HealthLog');

const STEPS_GOAL = 10000;
const WATER_GOAL = 2.5;
const SLEEP_GOAL_MIN = 480;

function todayKey() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

// Finds today's log for the user, creating an empty one if the day just started.
// Because dateKey is unique per user+day, a new day automatically means a
// brand new (zeroed) document - that IS the daily reset, no cron job needed.
async function getOrCreateTodayLog(userId) {
  const key = todayKey();
  let log = await HealthLog.findOne({ user: userId, dateKey: key });
  if (!log) {
    log = await HealthLog.create({ user: userId, dateKey: key });
  }
  return log;
}

function computeHealthScore(log) {
  const stepsPct = Math.min(100, (log.steps / STEPS_GOAL) * 100);
  const waterPct = Math.min(100, (log.waterLitres / WATER_GOAL) * 100);
  const sleepPct = log.sleepLogged ? Math.min(100, (log.sleepMinutes / SLEEP_GOAL_MIN) * 100) : 0;
  const weightPct = log.weightLogged ? 100 : 70;
  const score = Math.round(stepsPct * 0.3 + waterPct * 0.25 + sleepPct * 0.35 + weightPct * 0.1);
  return Math.max(0, Math.min(100, score));
}

// GET /api/health/today
async function getToday(req, res) {
  const log = await getOrCreateTodayLog(req.user._id);
  res.json({ log, healthScore: computeHealthScore(log), goals: { STEPS_GOAL, WATER_GOAL, SLEEP_GOAL_MIN } });
}

// PUT /api/health/sleep   { hours, minutes }
async function logSleep(req, res) {
  const { hours = 0, minutes = 0 } = req.body;
  const log = await getOrCreateTodayLog(req.user._id);
  log.sleepMinutes = Math.min(hours * 60 + minutes, 900);
  log.sleepLogged = true;
  await log.save();
  res.json({ log, healthScore: computeHealthScore(log) });
}

// PUT /api/health/steps   { add }
async function addSteps(req, res) {
  const { add = 0 } = req.body;
  const log = await getOrCreateTodayLog(req.user._id);
  log.steps += Math.max(0, add); // keeps accumulating past the goal for the rest of the day
  await log.save();
  res.json({ log, healthScore: computeHealthScore(log) });
}

// PUT /api/health/water   (adds one 250ml glass)
async function addWaterGlass(req, res) {
  const log = await getOrCreateTodayLog(req.user._id);
  log.waterLitres = Math.round((log.waterLitres + 0.25) * 100) / 100;
  await log.save();
  res.json({ log, healthScore: computeHealthScore(log) });
}

// PUT /api/health/weight   { weightKg }
async function logWeight(req, res) {
  const { weightKg } = req.body;
  if (!weightKg || weightKg < 20 || weightKg > 200) {
    return res.status(400).json({ message: 'Enter a valid weight between 20 and 200 kg' });
  }
  const log = await getOrCreateTodayLog(req.user._id);

  // find the most recent previous weight reading for a trend comparison
  const prevLog = await HealthLog.findOne({
    user: req.user._id,
    weightLogged: true,
    dateKey: { $ne: log.dateKey }
  }).sort({ dateKey: -1 });

  log.weightKg = weightKg;
  log.weightLogged = true;
  await log.save();

  const diff = prevLog ? Math.round((weightKg - prevLog.weightKg) * 10) / 10 : 0;
  res.json({ log, healthScore: computeHealthScore(log), trendDiff: diff });
}

module.exports = { getToday, logSleep, addSteps, addWaterGlass, logWeight, computeHealthScore, getOrCreateTodayLog };
