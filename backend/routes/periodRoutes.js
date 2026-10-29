const express = require('express');
const router = express.Router();
const { getPeriodData, addPeriodLog, updateSymptoms, deletePeriodLog } = require('../controllers/periodController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getPeriodData);
router.post('/', addPeriodLog);
router.put('/:id/symptoms', updateSymptoms);
router.delete('/:id', deletePeriodLog);

module.exports = router;
