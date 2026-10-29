const express = require('express');
const router = express.Router();
const { getContacts, addContact, deleteContact } = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/contacts', getContacts);
router.post('/contacts', addContact);
router.delete('/contacts/:id', deleteContact);

module.exports = router;
