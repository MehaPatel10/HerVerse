const express = require('express');
const router = express.Router();
const { getReminders, addReminder, toggleReminder, deleteReminder } = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getReminders);
router.post('/', addReminder);
router.put('/:id/toggle', toggleReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
