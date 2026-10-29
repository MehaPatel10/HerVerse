const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { signup, login, adminLogin, getMe, updateProfile, changePassword, forgotPassword, verifyOtp, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));
router.post('/admin-login', asyncHandler(adminLogin));
router.get('/me', protect, asyncHandler(getMe));
router.put('/profile', protect, asyncHandler(updateProfile));
router.put('/change-password', protect, asyncHandler(changePassword));

// Forgot-password via email OTP - no auth required (that's the point)
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/verify-otp', asyncHandler(verifyOtp));
router.post('/reset-password', asyncHandler(resetPassword));

module.exports = router;
