const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { chat, publicChat } = require('../controllers/lunaController');
const { protect } = require('../middleware/authMiddleware');
const { checkAnonymousLimit } = require('../middleware/anonymousLimiter');
const { publicLunaLimiter } = require('../middleware/rateLimiters');

// Public homepage demo - no login required, capped at 3 messages per IP.
router.post('/public-chat', publicLunaLimiter, asyncHandler(checkAnonymousLimit), asyncHandler(publicChat));

// Authenticated - token/tier based.
router.post('/chat', protect, asyncHandler(chat));

module.exports = router;
