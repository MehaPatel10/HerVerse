const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const { config, createOrder, verify } = require('../controllers/paymentController');

router.get('/config', asyncHandler(config));
router.post('/create-order', protect, asyncHandler(createOrder));
router.post('/verify', protect, asyncHandler(verify));

module.exports = router;
