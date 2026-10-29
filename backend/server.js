require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const { verifyMailerOnStartup } = require('./utils/mailer');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { globalLimiter, authLimiter } = require('./middleware/rateLimiters');

const authRoutes = require('./routes/authRoutes');
const periodRoutes = require('./routes/periodRoutes');
const healthRoutes = require('./routes/healthRoutes');
const dietRoutes = require('./routes/dietRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const lunaRoutes = require('./routes/lunaRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const tokenPackRoutes = require('./routes/tokenPackRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const trackRoutes = require('./routes/trackRoutes');
const contentRoutes = require('./routes/contentRoutes');

connectDB();
verifyMailerOnStartup();

// Safety net: log and keep running instead of hard-crashing the whole
// server on an unexpected rejected promise anywhere in the app.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

const app = express();

// Behind Vercel / any reverse proxy, this makes req.ip return the real
// client IP (needed for the anonymous Luna 3-question limit + rate limits).
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize()); // strips $ and . operators from user input to block NoSQL injection

app.use(globalLimiter);

app.get('/api/health-check', (req, res) => res.json({ status: 'ok', service: 'HERVERSE API' }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/period', periodRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/luna', lunaRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/token-packs', tokenPackRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/content', contentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`HERVERSE API running on port ${PORT}`));
