const rateLimit = require('express-rate-limit');

// Generous global limiter - mainly to blunt scripted abuse, not real users.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down and try again shortly.' }
});

// Tighter limiter on auth endpoints to slow down credential-stuffing / brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' }
});

// Slightly tighter limiter for the public (anonymous) Luna demo endpoint,
// on top of the hard 3-question-per-IP cap enforced separately.
const publicLunaLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again in a few minutes.' }
});

module.exports = { globalLimiter, authLimiter, publicLunaLimiter };
