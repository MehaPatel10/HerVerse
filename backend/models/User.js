const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    // NOTE: email/address/pincode are enforced as mandatory in the signup
    // controller (backend/controllers/authController.js), not here at the
    // schema level. Schema-level `required: true` would run on every
    // `.save()` of a document - including accounts created before these
    // fields existed - and throw a ValidationError the moment anything
    // else (token deduction, saving a pincode from a LUNA chat, etc.)
    // tried to save that older document. Keeping format validation only
    // (and controller-level "is it filled in" checks) avoids that trap.
    email: {
      type: String,
      unique: true,
      sparse: true, // allows multiple legacy accounts with no email yet
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address']
    },
    address: { type: String, trim: true },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, 'Pincode must be a 6-digit number']
    },
    password: { type: String, required: true },
    consentGiven: { type: Boolean, default: false },

    // password-reset-by-email-OTP flow (see authController.forgotPassword)
    resetOtpHash: { type: String, default: null, select: false },
    resetOtpExpires: { type: Date, default: null, select: false },

    // subscription (legacy label, kept for backward compatibility with existing UI copy)
    plan: { type: String, enum: ['Basic', 'Premium', 'Annual'], default: 'Basic' },

    // access control
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // LUNA AI tier + token economy
    tier: { type: String, enum: ['free', 'gold', 'platinum'], default: 'free' },
    tokenBalance: { type: Number, default: 3 }, // free tier starts with 3 tokens
    tierExpiresAt: { type: Date, default: null }, // null = no active paid cycle
    tierRenewsAt: { type: Date, default: null },

    // profile
    dob: { type: Date },
    heightCm: { type: Number },
    weightKg: { type: Number },
    activityLevel: { type: String, enum: ['Sedentary', 'Lightly active', 'Moderately active', 'Very active'], default: 'Moderately active' },
    healthGoal: { type: String, default: 'General wellness' },
    cycleLengthAvg: { type: Number, default: 28 },
    periodLengthAvg: { type: Number, default: 5 },
    healthGoals: [{ type: String }],
    dietType: { type: String, enum: ['Vegetarian', 'Vegan', 'Eggetarian', 'Non-vegetarian'], default: 'Vegetarian' },
    dietGoal: { type: String, enum: ['General wellness', 'Weight loss', 'Muscle gain', 'PCOS support'], default: 'General wellness' },
    preferredCuisines: [{ type: String }]
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
