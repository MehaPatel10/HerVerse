const PeriodLog = require('../models/PeriodLog');

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function buildPrediction(logs) {
  if (logs.length === 0) return null;

  const sorted = [...logs].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  const latest = sorted[0];
  const recent = sorted.slice(0, 6);
  const avgCycle = Math.round(recent.reduce((sum, l) => sum + (l.cycleLength || 28), 0) / recent.length);

  const nextPeriod = addDays(latest.startDate, avgCycle);
  const ovulation = addDays(nextPeriod, -14);
  const fertileStart = addDays(ovulation, -4);
  const fertileEnd = addDays(ovulation, 1);

  return {
    nextPeriod,
    fertileStart,
    fertileEnd,
    ovulation,
    avgCycleLength: avgCycle,
    basedOnCycles: recent.length
  };
}

// GET /api/period  -> list logs + prediction
async function getPeriodData(req, res) {
  const logs = await PeriodLog.find({ user: req.user._id }).sort({ startDate: -1 }).limit(12);
  res.json({ logs, prediction: buildPrediction(logs) });
}

// POST /api/period  -> add a period entry
async function addPeriodLog(req, res) {
  const { startDate, endDate, cycleLength, symptoms } = req.body;
  if (!startDate) return res.status(400).json({ message: 'startDate is required' });

  const log = await PeriodLog.create({
    user: req.user._id,
    startDate,
    endDate: endDate || addDays(startDate, 4),
    cycleLength: cycleLength || req.user.cycleLengthAvg || 28,
    symptoms: symptoms || []
  });

  const logs = await PeriodLog.find({ user: req.user._id }).sort({ startDate: -1 }).limit(12);
  res.status(201).json({ log, prediction: buildPrediction(logs) });
}

// PUT /api/period/:id/symptoms  -> update symptoms on a specific log
async function updateSymptoms(req, res) {
  const log = await PeriodLog.findOne({ _id: req.params.id, user: req.user._id });
  if (!log) return res.status(404).json({ message: 'Log not found' });
  log.symptoms = req.body.symptoms || [];
  await log.save();
  res.json(log);
}

// DELETE /api/period/:id
async function deletePeriodLog(req, res) {
  await PeriodLog.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
}

module.exports = { buildPrediction, getPeriodData, addPeriodLog, updateSymptoms, deletePeriodLog };
