const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const { downloadDayReport, emailDayReport } = require('../controllers/reportController');

router.use(protect);
router.get('/day/:date', asyncHandler(downloadDayReport));
router.post('/day/:date/email', asyncHandler(emailDayReport));

module.exports = router;
