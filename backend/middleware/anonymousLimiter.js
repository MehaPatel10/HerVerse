const AnonymousUsage = require('../models/AnonymousUsage');

const FREE_LIMIT = 3;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// The free count belongs to one calendar day: a stale count from an earlier day is ignored.
function countFor(usage) {
  if (!usage) return 0;
  if (!usage.lastMessageAt || usage.lastMessageAt < startOfToday()) return 0;
  return usage.count || 0;
}

function getClientIp(req) {
  // req.ip already respects `app.set('trust proxy', ...)` in server.js,
  // which matters when deployed behind Vercel/a reverse proxy.
  return (req.ip || req.connection?.remoteAddress || 'unknown').replace('::ffff:', '');
}

// Attaches req.anonIp and req.anonUsage (current doc, may be null = 0 used).
// Blocks with 403 once the IP has used its 3 free questions.
async function checkAnonymousLimit(req, res, next) {
  try {
    const ip = getClientIp(req);
    req.anonIp = ip;

    const usage = await AnonymousUsage.findOne({ ip });
    const used = countFor(usage);

    if (used >= FREE_LIMIT) {
      return res.status(403).json({
        message: "You've used your 3 free Luna questions.",
        limitReached: true,
        used,
        limit: FREE_LIMIT
      });
    }

    req.anonUsage = usage;
    next();
  } catch (err) {
    next(err);
  }
}

// Call after a successful reply to increment the counter.
async function incrementAnonymousUsage(ip) {
  const existing = await AnonymousUsage.findOne({ ip });
  const next = countFor(existing) + 1;
  return AnonymousUsage.findOneAndUpdate(
    { ip },
    { $set: { count: next, lastMessageAt: new Date() } },
    { upsert: true, new: true }
  );
}

module.exports = { checkAnonymousLimit, incrementAnonymousUsage, countFor, getClientIp, FREE_LIMIT };
