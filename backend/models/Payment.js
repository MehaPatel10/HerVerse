const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['subscription', 'token_pack'], required: true },
    refLabel: { type: String, required: true }, // tier name or token pack label at time of purchase
    amountINR: { type: Number, required: true },
    tokensGranted: { type: Number, default: 0 },
    tierGranted: { type: String, default: null },

    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },

    isDemo: { type: Boolean, default: true }, // true while Razorpay is running in test/demo mode
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
