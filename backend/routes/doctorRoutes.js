const express = require('express');
const router = express.Router();
const { checkSymptoms, listCare, byPincode } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

router.use(protect);
router.post('/check-symptoms', asyncHandler(checkSymptoms));
router.get('/', listCare);
router.get('/by-pincode/:pincode', asyncHandler(byPincode));

module.exports = router;
