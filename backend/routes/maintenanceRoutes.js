const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { getPublicStatus } = require('../controllers/maintenanceController');

router.get('/', asyncHandler(getPublicStatus));

module.exports = router;
