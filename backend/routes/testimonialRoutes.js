const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { listPublished } = require('../controllers/testimonialController');

router.get('/', asyncHandler(listPublished));

module.exports = router;
