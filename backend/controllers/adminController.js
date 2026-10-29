const User = require('../models/User');
const Payment = require('../models/Payment');
const PricingPlan = require('../models/PricingPlan');
const HealthLog = require('../models/HealthLog');
const FoodLog = require('../models/FoodLog');
const PeriodLog = require('../models/PeriodLog');
const Reminder = require('../models/Reminder');
const EmergencyContact = require('../models/EmergencyContact');
const GroqKey = require('../models/GroqKey');
const GroqUsageLog = require('../models/GroqUsageLog');
const { configuredKeyCount } = require('../utils/groqClient');
const ReportLog = require('../models/ReportLog');
const SiteVisitLog = require('../models/SiteVisitLog');
const { lastNDayKeys } = require('../utils/dateKey');

// GET /api/admin/dashboard
async function dashboardStats(req, res) {
  const [totalUsers, byTierAgg, pricingPlans, todayStart] = await Promise.all([
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$tier', count: { $sum: 1 } } }]),
    PricingPlan.find(),
    Promise.resolve(new Date(new Date().setHours(0, 0, 0, 0)))
  ]);

  const usersByTier = { free: 0, gold: 0, platinum: 0 };
  byTierAgg.forEach((row) => { usersByTier[row._id] = row.count; });

  // Revenue is derived from who's actually subscribed to what right now -
  // current headcount per tier x that tier's current price - rather than
  // summing every historical payment (which would keep counting money from
  // someone who has since downgraded, cancelled, or been removed, and would
  // double-count anyone who paid more than once).
  const priceByTier = { free: 0, gold: 0, platinum: 0 };
  pricingPlans.forEach((p) => { priceByTier[p.tier] = p.priceINR; });

  const revenueByTier = { free: 0, gold: 0, platinum: 0 };
  Object.keys(usersByTier).forEach((tier) => {
    revenueByTier[tier] = usersByTier[tier] * (priceByTier[tier] || 0);
  });
  const monthlyRevenueINR = Object.values(revenueByTier).reduce((sum, v) => sum + v, 0);

  const [messagesToday, messagesTotal, publicMessagesToday, failuresToday] = await Promise.all([
    GroqUsageLog.countDocuments({ createdAt: { $gte: todayStart }, source: 'authenticated' }),
    GroqUsageLog.countDocuments({}),
    GroqUsageLog.countDocuments({ createdAt: { $gte: todayStart }, source: 'public_demo' }),
    GroqUsageLog.countDocuments({ createdAt: { $gte: todayStart }, success: false })
  ]);

  // Total visits per day (repeat visits count): today + previous 10 days, zero-filled.
  const dayKeys = lastNDayKeys(11);
  const visitAgg = await SiteVisitLog.aggregate([
    { $match: { day: { $in: dayKeys } } },
    { $group: { _id: '$day', visits: { $sum: 1 } } }
  ]);
  const visitsByDay = Object.fromEntries(visitAgg.map((r) => [r._id, r.visits]));
  const visitsTrend = dayKeys.map((day) => ({ date: day, visits: visitsByDay[day] || 0 }));

  res.json({
    visitsTrend,
    totalUsers,
    usersByTier,
    monthlyRevenueINR,
    revenueByTier,
    groqKeysConfigured: configuredKeyCount(),
    aiMessages: {
      authenticatedToday: messagesToday,
      publicDemoToday: publicMessagesToday,
      failuresToday,
      allTime: messagesTotal
    }
  });
}

// GET /api/admin/groq-usage
async function groqUsage(req, res) {
  const keys = await GroqKey.find().sort({ label: 1 });

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dailyAgg = await GroqUsageLog.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, success: '$success' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.day': 1 } }
  ]);

  const recentFailures = await GroqUsageLog.find({ success: false }).sort({ createdAt: -1 }).limit(20);

  res.json({ keys, dailyAgg, recentFailures, configuredKeyCount: configuredKeyCount() });
}

// GET /api/admin/users?search=&tier=
// Escapes regex metacharacters so admin search input is treated as a
// literal substring match, not executed as an arbitrary (and potentially
// catastrophically slow) regular expression.
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listUsers(req, res) {
  const { search = '', tier } = req.query;
  const query = {};
  if (search) {
    const safe = escapeRegex(search).slice(0, 100);
    query.$or = [{ name: new RegExp(safe, 'i') }, { phone: new RegExp(safe, 'i') }];
  }
  if (tier) query.tier = tier;

  const users = await User.find(query).select('-password').sort({ createdAt: -1 }).limit(200);
  res.json(users);
}

// PUT /api/admin/users/:id  { role, tier, tokenBalance }
async function updateUser(req, res) {
  const fields = ['role', 'tier', 'tokenBalance'];
  const update = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  });
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}

// DELETE /api/admin/users/:id
// Cascade-deletes everything tied to this user (payment history, food/health/
// period logs, reminders, emergency contacts) so removing a user doesn't
// leave orphaned records lingering in other admin views like Payments.
async function deleteUser(req, res) {
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: "You can't remove your own admin account." });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  await Promise.all([
    Payment.deleteMany({ user: user._id }),
    HealthLog.deleteMany({ user: user._id }),
    FoodLog.deleteMany({ user: user._id }),
    PeriodLog.deleteMany({ user: user._id }),
    Reminder.deleteMany({ user: user._id }),
    EmergencyContact.deleteMany({ user: user._id })
  ]);

  res.json({ message: 'User and all associated data removed' });
}

// POST /api/admin/cleanup-orphaned-data
// One-time cleanup for records left behind by user deletions that happened
// before cascading delete was added above - removes payment history (and
// other user-linked records) whose referenced user no longer exists.
async function cleanupOrphanedData(req, res) {
  const existingUserIds = new Set((await User.find().select('_id')).map((u) => String(u._id)));
  const collections = [
    { name: 'payments', Model: Payment },
    { name: 'healthLogs', Model: HealthLog },
    { name: 'foodLogs', Model: FoodLog },
    { name: 'periodLogs', Model: PeriodLog },
    { name: 'reminders', Model: Reminder },
    { name: 'emergencyContacts', Model: EmergencyContact }
  ];

  const removed = {};
  for (const { name, Model } of collections) {
    const orphanIds = (await Model.find().select('user'))
      .filter((doc) => doc.user && !existingUserIds.has(String(doc.user)))
      .map((doc) => doc._id);
    if (orphanIds.length) {
      await Model.deleteMany({ _id: { $in: orphanIds } });
    }
    removed[name] = orphanIds.length;
  }

  res.json({ message: 'Orphaned records cleaned up', removed });
}

module.exports = { dashboardStats, groqUsage, listUsers, updateUser, deleteUser, cleanupOrphanedData };


// GET /api/admin/report-activity  -> who downloaded / emailed reports, and to which email
async function reportActivity(req, res) {
  const [logs, downloads, emails] = await Promise.all([
    ReportLog.find().sort({ createdAt: -1 }).limit(300).populate('user', 'name phone email'),
    ReportLog.countDocuments({ action: 'download' }),
    ReportLog.countDocuments({ action: 'email' })
  ]);
  res.json({ logs, totals: { downloads, emails } });
}

module.exports.reportActivity = reportActivity;
