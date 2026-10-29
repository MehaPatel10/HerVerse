const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { listTokenPacks } = require('../controllers/tokenPackController');

router.get('/', asyncHandler(listTokenPacks));

module.exports = router;
