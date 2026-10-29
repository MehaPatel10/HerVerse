const HealthLog = require('../models/HealthLog');
const FoodLog = require('../models/FoodLog');
const PeriodLog = require('../models/PeriodLog');
const { buildPrediction } = require('./periodController');
const { buildDayReportPdf } = require('../utils/pdfBuilder');
const { sendReportEmail } = require('../utils/mailer');
const ReportLog = require('../models/ReportLog');

async function logReport(user, fields) {
  try {
    await ReportLog.create({ user: user._id, userName: user.name || '', userPhone: user.phone || '', ...fields });
  } catch (err) {
    console.error('ReportLog write failed:', err.message); // never block the report itself
  }
}

function isValidDateKey(dateKey) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey || '');
}

function dateLabelFor(dateKey) {
  const d = new Date(`${dateKey}T00:00:00`);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function gatherDayData(userId, dateKey) {
  // Period prediction is the same one shown in the Period Tracker (all logs, not only
  // those overlapping this day), so the report always matches the tracker.
  const [healthLog, foodLogs, allPeriodLogs] = await Promise.all([
    HealthLog.findOne({ user: userId, dateKey }),
    FoodLog.find({ user: userId, dateKey }).sort({ createdAt: 1 }),
    PeriodLog.find({ user: userId }).sort({ startDate: -1 }).limit(12)
  ]);

  const periodPrediction = buildPrediction(allPeriodLogs);
  return { healthLog, foodLogs, periodPrediction };
}

// GET /api/reports/day/:date  -> streams a PDF for direct download
async function downloadDayReport(req, res) {
  const { date } = req.params;
  if (!isValidDateKey(date)) return res.status(400).json({ message: 'date must be in YYYY-MM-DD format' });

  const { healthLog, foodLogs, periodPrediction } = await gatherDayData(req.user._id, date);
  const dateLabel = dateLabelFor(date);
  const pdfBuffer = await buildDayReportPdf({ dateLabel, user: req.user, healthLog, foodLogs, periodPrediction });

  await logReport(req.user, { action: 'download', reportDate: date });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="HERVERSE-Report-${date}.pdf"`);
  res.send(pdfBuffer);
}

// POST /api/reports/day/:date/email  -> emails the same PDF to the user
async function emailDayReport(req, res) {
  const { date } = req.params;
  if (!isValidDateKey(date)) return res.status(400).json({ message: 'date must be in YYYY-MM-DD format' });
  if (!req.user.email) return res.status(400).json({ message: 'No email address on file for this account.' });

  const { healthLog, foodLogs, periodPrediction } = await gatherDayData(req.user._id, date);
  const dateLabel = dateLabelFor(date);
  const pdfBuffer = await buildDayReportPdf({ dateLabel, user: req.user, healthLog, foodLogs, periodPrediction });

  try {
    await sendReportEmail(req.user.email, { dateLabel, name: req.user.name }, pdfBuffer);
  } catch (err) {
    await logReport(req.user, { action: 'email', reportDate: date, sentToEmail: req.user.email, success: false, errorMessage: String(err.message || err).slice(0, 300) });
    throw err;
  }
  await logReport(req.user, { action: 'email', reportDate: date, sentToEmail: req.user.email });
  res.json({ message: `Report for ${dateLabel} emailed to ${req.user.email}.` });
}

module.exports = { downloadDayReport, emailDayReport };
