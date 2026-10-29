const express = require('express');
const router = express.Router();
const { getToday, logSleep, addSteps, addWaterGlass, logWeight } = require('../controllers/healthController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/today', getToday);
router.put('/sleep', logSleep);
router.put('/steps', addSteps);
router.put('/water', addWaterGlass);
router.put('/weight', logWeight);

module.exports = router;
