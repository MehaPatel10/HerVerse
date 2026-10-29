const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { recordVisit } = require('../controllers/trackController');

router.post('/visit', asyncHandler(recordVisit));

module.exports = router;
