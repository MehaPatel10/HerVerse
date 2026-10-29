const crypto = require('crypto');
const Payment = require('../models/Payment');
const PricingPlan = require('../models/PricingPlan');
const TokenPack = require('../models/TokenPack');
const { buildInvoicePdf } = require('../utils/pdfBuilder');
const { sendInvoiceEmail } = require('../utils/mailer');

// Fire-and-forget invoice email so a slow/broken mail server never delays
// or breaks the payment-verification response the user is waiting on.
function emailInvoiceAsync(user, payment) {
  const invoiceNumber = `HV-${payment._id.toString().slice(-8).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  buildInvoicePdf({ invoiceNumber, dateStr, user, payment })
    .then((pdfBuffer) => sendInvoiceEmail(user.email, { invoiceNumber, dateStr, label: payment.refLabel, amountINR: payment.amountINR, name: user.name }, pdfBuffer))
    .catch((err) => console.error('Invoice email failed:', err.message));
}

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const DEMO_MODE = !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET;

let razorpayInstance = null;
function getRazorpay() {
  if (DEMO_MODE) return null;
  if (!razorpayInstance) {
    // Lazy-require so the app still boots fine if the package isn't
    // installed and the site is only ever run in demo mode.
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  }
  return razorpayInstance;
}

// GET /api/payments/config -> tells the frontend whether it's demo or live, and the public key
async function config(req, res) {
  res.json({ demoMode: DEMO_MODE, keyId: DEMO_MODE ? '' : RAZORPAY_KEY_ID });
}

// POST /api/payments/create-order  { type: 'subscription'|'token_pack', refId }
async function createOrder(req, res) {
  const { type, refId } = req.body;
  if (!['subscription', 'token_pack'].includes(type) || !refId) {
    return res.status(400).json({ message: 'type ("subscription" or "token_pack") and refId are required' });
  }

  let amountINR, label, tokensGranted = 0, tierGranted = null;

  if (type === 'subscription') {
    const plan = await PricingPlan.findOne({ tier: refId, isActive: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    amountINR = plan.priceINR;
    label = plan.label;
    tokensGranted = plan.monthlyTokens;
    tierGranted = plan.tier;
  } else {
    const pack = await TokenPack.findById(refId).catch(() => null);
    if (!pack || !pack.isActive) return res.status(404).json({ message: 'Token pack not found' });
    amountINR = pack.priceINR;
    label = pack.label;
    tokensGranted = pack.tokens;
  }

  if (amountINR <= 0) {
    return res.status(400).json({ message: 'This plan is free and does not require payment.' });
  }

  const payment = await Payment.create({
    user: req.user._id,
    type,
    refLabel: label,
    amountINR,
    tokensGranted,
    tierGranted,
    isDemo: DEMO_MODE,
    status: 'created'
  });

  if (DEMO_MODE) {
    // No real Razorpay keys configured - this is a demo/test site, so we
    // hand back a fake order id the frontend recognizes and skips the
    // real Razorpay checkout widget for.
    return res.json({
      demoMode: true,
      paymentId: payment._id,
      amountINR,
      label,
      message: 'Running in demo mode (no live Razorpay keys configured). Payment will be simulated.'
    });
  }

  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(amountINR * 100), // paise
      currency: 'INR',
      receipt: String(payment._id)
    });
    payment.razorpayOrderId = order.id;
    await payment.save();

    res.json({ demoMode: false, orderId: order.id, amountINR, label, paymentId: payment._id, keyId: RAZORPAY_KEY_ID });
  } catch (err) {
    payment.status = 'failed';
    await payment.save();
    res.status(500).json({ message: 'Could not create Razorpay order', error: err.message });
  }
}

async function grantToUser(user, payment) {
  if (payment.tierGranted) {
    user.tier = payment.tierGranted;
    user.tierExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    user.tierRenewsAt = user.tierExpiresAt;
  }
  if (payment.tokensGranted && payment.tokensGranted > 0) {
    user.tokenBalance += payment.tokensGranted;
  } else if (payment.tokensGranted === -1) {
    // unlimited tier - token balance becomes irrelevant, leave as-is
  }
  await user.save();
}

// POST /api/payments/verify
// Demo mode:  { paymentId }
// Live mode:  { paymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
async function verify(req, res) {
  const { paymentId } = req.body;
  const payment = await Payment.findOne({ _id: paymentId, user: req.user._id });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  if (payment.status === 'paid') return res.json({ message: 'Already verified', payment });

  if (payment.isDemo) {
    payment.status = 'paid';
    await payment.save();
    await grantToUser(req.user, payment);
    emailInvoiceAsync(req.user, payment);
    return res.json({ message: 'Demo payment simulated successfully', payment, user: req.user });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  // Constant-time comparison to avoid leaking signature-match info via
  // response timing.
  const signaturesMatch =
    typeof razorpay_signature === 'string' &&
    razorpay_signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));

  if (!signaturesMatch) {
    payment.status = 'failed';
    await payment.save();
    return res.status(400).json({ message: 'Payment signature verification failed' });
  }

  payment.status = 'paid';
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  await payment.save();
  await grantToUser(req.user, payment);
  emailInvoiceAsync(req.user, payment);

  res.json({ message: 'Payment verified', payment, user: req.user });
}

// GET /api/admin/payments
async function listPayments(req, res) {
  const payments = await Payment.find().populate('user', 'name phone').sort({ createdAt: -1 }).limit(200);
  // Defensive filter: a payment whose user was deleted (and predates the
  // cascading-delete fix, or wasn't cleaned up yet) shouldn't show up here.
  res.json(payments.filter((p) => p.user));
}

module.exports = { config, createOrder, verify, listPayments, DEMO_MODE };
