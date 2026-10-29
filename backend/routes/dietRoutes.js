const express = require('express');
const router = express.Router();
const { getPlan, getFoods, getTodayLog, addFoodLog, deleteFoodLog, getCuisines } = require('../controllers/dietController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/cuisines', getCuisines);
router.get('/plan', getPlan);
router.get('/foods', getFoods);
router.get('/log/today', getTodayLog);
router.post('/log', addFoodLog);
router.delete('/log/:id', deleteFoodLog);

module.exports = router;
