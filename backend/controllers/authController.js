const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendOtpEmail } = require('../utils/mailer');

const OTP_TTL_MINUTES = 10;

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    address: user.address,
    pincode: user.pincode,
    plan: user.plan,
    role: user.role,
    tier: user.tier,
    tokenBalance: user.tokenBalance,
    tierExpiresAt: user.tierExpiresAt,
    dob: user.dob,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    activityLevel: user.activityLevel,
    healthGoal: user.healthGoal,
    cycleLengthAvg: user.cycleLengthAvg,
    periodLengthAvg: user.periodLengthAvg,
    healthGoals: user.healthGoals,
    dietType: user.dietType,
    dietGoal: user.dietGoal,
    preferredCuisines: user.preferredCuisines,
    profileComplete: !!(user.dob && user.heightCm)
  };
}

// POST /api/auth/signup
async function signup(req, res) {
  const { name, phone, email, address, pincode, password, consentGiven } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ message: 'Name, phone and password are required' });
  }
  if (!email || !String(email).trim()) {
    return res.status(400).json({ message: 'Email address is required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return res.status(400).json({ message: 'Enter a valid email address' });
  }
  if (!address || !String(address).trim()) {
    return res.status(400).json({ message: 'Address is required' });
  }
  if (!pincode || !/^\d{6}$/.test(String(pincode).trim())) {
    return res.status(400).json({ message: 'A valid 6-digit pincode is required' });
  }
  if (!consentGiven) {
    return res.status(400).json({ message: 'Data consent is required to create an account' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) return res.status(400).json({ message: 'An account with this phone number already exists' });

  const existingEmail = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (existingEmail) return res.status(400).json({ message: 'An account with this email already exists' });

  const user = await User.create({
    name,
    phone,
    email: String(email).trim().toLowerCase(),
    address: String(address).trim(),
    pincode: String(pincode).trim(),
    password,
    consentGiven
  });

  res.status(201).json({ ...publicUser(user), token: generateToken(user._id) });
}

// POST /api/auth/login
async function login(req, res) {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'Phone and password are required' });

  const user = await User.findOne({ phone });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid phone number or password' });
  }

  res.json({ ...publicUser(user), token: generateToken(user._id) });
}

// POST /api/auth/admin-login - separate endpoint for the admin panel login
// screen. Same credential check as the regular login, but it also verifies
// the account actually has the admin role, and gives a distinct error
// message rather than silently falling through to a normal user session.
async function adminLogin(req, res) {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ message: 'Phone and password are required' });

  const user = await User.findOne({ phone });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid phone number or password' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'This account does not have admin access' });
  }

  res.json({ ...publicUser(user), token: generateToken(user._id) });
}

// GET /api/auth/me
async function getMe(req, res) {
  res.json(publicUser(req.user));
}

// PUT /api/auth/profile  (complete profile / update profile / subscription)
async function updateProfile(req, res) {
  const fields = ['name', 'address', 'pincode', 'heightCm', 'weightKg', 'activityLevel', 'healthGoal', 'cycleLengthAvg', 'periodLengthAvg', 'healthGoals', 'dietType', 'dietGoal', 'preferredCuisines', 'plan'];

  if (req.body.pincode !== undefined && req.body.pincode !== '' && !/^\d{6}$/.test(String(req.body.pincode).trim())) {
    return res.status(400).json({ message: 'A valid 6-digit pincode is required' });
  }
  if (req.body.email !== undefined && req.body.email !== req.user.email) {
    const email = String(req.body.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    const clash = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (clash) return res.status(400).json({ message: 'An account with this email already exists' });
    req.user.email = email;
  }

  fields.forEach((f) => {
    if (req.body[f] !== undefined) req.user[f] = req.body[f];
  });
  // Date of birth is captured once (Complete Profile) and then treated as
  // static/permanent - age shouldn't silently drift because of a later
  // edit, so we only ever accept it the first time it's set.
  if (req.body.dob !== undefined && !req.user.dob) {
    req.user.dob = req.body.dob;
  }
  await req.user.save();
  res.json(publicUser(req.user));
}

// PUT /api/auth/change-password  { currentPassword, newPassword }
async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  // BUGFIX: `req.user` comes from the `protect` middleware, which loads
  // the user with `.select('-password')` so the hash never sits on
  // req.user in memory longer than necessary. That meant
  // `req.user.matchPassword(...)` was always comparing against
  // `undefined` and change-password could never succeed. Re-fetch this
  // one user WITH the password field just for this comparison.
  const userWithPassword = await User.findById(req.user._id).select('+password');
  if (!userWithPassword) return res.status(404).json({ message: 'User not found' });

  const ok = await userWithPassword.matchPassword(currentPassword);
  if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

  userWithPassword.password = newPassword;
  await userWithPassword.save();
  res.json({ message: 'Password updated successfully' });
}

// ---------------------------------------------------------------------
// Forgot-password via email OTP:
//   1. POST /forgot-password  { email }            -> emails a 6-digit OTP
//   2. POST /verify-otp       { email, otp }        -> confirms the OTP is valid
//   3. POST /reset-password   { email, otp, newPassword } -> sets new password
// ---------------------------------------------------------------------

// POST /api/auth/forgot-password  { email }
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email || !String(email).trim()) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });

  // Always respond with the same generic message, whether or not the
  // email exists, so this endpoint can't be used to check which emails
  // are registered.
  const genericMsg = { message: 'If that email is registered, a verification code has been sent to it.' };

  if (!user) return res.json(genericMsg);

  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const salt = await bcrypt.genSalt(10);
  user.resetOtpHash = await bcrypt.hash(otp, salt);
  user.resetOtpExpires = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await user.save();

  try {
    await sendOtpEmail(user.email, otp, user.name);
  } catch (err) {
    console.error('Failed to send OTP email:', err.message);
    return res.status(500).json({ message: 'Could not send the verification email right now. Please try again shortly.' });
  }

  res.json(genericMsg);
}

// POST /api/auth/verify-otp  { email, otp }
async function verifyOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+resetOtpHash +resetOtpExpires');
  if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
    return res.status(400).json({ message: 'Invalid or expired code. Please request a new one.' });
  }
  if (user.resetOtpExpires.getTime() < Date.now()) {
    return res.status(400).json({ message: 'This code has expired. Please request a new one.' });
  }
  const ok = await bcrypt.compare(String(otp), user.resetOtpHash);
  if (!ok) return res.status(400).json({ message: 'Incorrect code. Please check and try again.' });

  res.json({ message: 'Code verified.' });
}

// POST /api/auth/reset-password  { email, otp, newPassword }
async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, code and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+resetOtpHash +resetOtpExpires');
  if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
    return res.status(400).json({ message: 'Invalid or expired code. Please request a new one.' });
  }
  if (user.resetOtpExpires.getTime() < Date.now()) {
    return res.status(400).json({ message: 'This code has expired. Please request a new one.' });
  }
  const ok = await bcrypt.compare(String(otp), user.resetOtpHash);
  if (!ok) return res.status(400).json({ message: 'Incorrect code. Please check and try again.' });

  user.password = newPassword;
  user.resetOtpHash = null;
  user.resetOtpExpires = null;
  await user.save();

  res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
}

module.exports = { signup, login, adminLogin, getMe, updateProfile, changePassword, forgotPassword, verifyOtp, resetPassword };
