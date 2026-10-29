const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { listPricing } = require('../controllers/pricingController');

router.get('/', asyncHandler(listPricing));

module.exports = router;
