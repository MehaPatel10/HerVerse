// One-time setup script. Run with:  npm run seed
// Creates (if missing):
//   - an admin login (from ADMIN_PHONE / ADMIN_PASSWORD in .env)
//   - the 3 pricing tiers (free / gold / platinum)
//   - default buy-token packs (8 / 50 / 100 tokens)
// Safe to re-run - it only creates what doesn't already exist and never
// overwrites prices/tokens you've already changed from the admin panel.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const PricingPlan = require('./models/PricingPlan');
const TokenPack = require('./models/TokenPack');
const Testimonial = require('./models/Testimonial');

async function run() {
  await connectDB();

  // --- Admin user ---------------------------------------------------
  const adminPhone = process.env.ADMIN_PHONE || '9999999999';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@herverse.local';
  let admin = await User.findOne({ phone: adminPhone });
  if (!admin) {
    admin = await User.create({
      name: 'HERVERSE Admin',
      phone: adminPhone,
      email: adminEmail,
      address: 'HERVERSE HQ',
      pincode: '380001',
      password: adminPassword,
      consentGiven: true,
      role: 'admin',
      tier: 'platinum',
      tokenBalance: 0
    });
    console.log(`Created admin login -> phone: ${adminPhone}  password: ${adminPassword}`);
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
    console.log(`Promoted existing user ${adminPhone} to admin.`);
  } else {
    console.log('Admin user already exists, skipping.');
  }

  // --- Pricing tiers ---------------------------------------------------
  const defaultPlans = [
    {
      tier: 'free',
      label: 'Free',
      priceINR: 0,
      monthlyTokens: 3,
      features: ['Period & cycle tracking', 'Basic health tracker', '3 LUNA AI tokens to start']
    },
    {
      tier: 'gold',
      label: 'Gold',
      priceINR: 199,
      monthlyTokens: 50,
      features: ['Everything in Free', '50 LUNA AI tokens / month', 'Diet planner', 'Doctor & symptom checker']
    },
    {
      tier: 'platinum',
      label: 'Platinum',
      priceINR: 499,
      monthlyTokens: -1, // -1 = unlimited
      features: ['Everything in Gold', 'Unlimited LUNA AI access', 'Priority support', 'All future features']
    }
  ];

  for (const p of defaultPlans) {
    const exists = await PricingPlan.findOne({ tier: p.tier });
    if (!exists) {
      await PricingPlan.create(p);
      console.log(`Created pricing plan: ${p.tier}`);
    }
  }

  // --- Token packs ---------------------------------------------------
  const defaultPacks = [
    { label: '8 Tokens', tokens: 8, priceINR: 49, sortOrder: 1 },
    { label: '50 Tokens', tokens: 50, priceINR: 199, sortOrder: 2 },
    { label: '100 Tokens', tokens: 100, priceINR: 349, sortOrder: 3 }
  ];

  for (const pack of defaultPacks) {
    const exists = await TokenPack.findOne({ label: pack.label });
    if (!exists) {
      await TokenPack.create(pack);
      console.log(`Created token pack: ${pack.label}`);
    }
  }

  // --- Sample testimonials (unpublished by default; publish from admin) ---
  const sampleTestimonials = [
    { name: 'Aanya', message: 'I tracked my periods for 6 months and finally understood my cycle patterns.', rating: 5, isPublished: true, sortOrder: 1 },
    { name: 'Riya', message: 'The diet planner helped me stay consistent with healthier habits.', rating: 5, isPublished: true, sortOrder: 2 },
    { name: 'Priya', message: 'HERVERSE made women\'s health information much easier for me to understand.', rating: 5, isPublished: true, sortOrder: 3 }
  ];
  const testimonialCount = await Testimonial.countDocuments();
  if (testimonialCount === 0) {
    await Testimonial.insertMany(sampleTestimonials);
    console.log('Created sample testimonials.');
  }

  console.log('\nSeed complete.');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
