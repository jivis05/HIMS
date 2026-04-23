const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const User = require('./models/User.model');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const labReportRoutes = require('./routes/labReport.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const bedRoutes = require('./routes/bed.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const shiftRoutes = require('./routes/shift.routes');
const bloodBankRoutes = require('./routes/bloodbank.routes');
const superadminRoutes = require('./routes/superadmin.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const consentRoutes = require('./routes/consent.routes');
const orgRoutes = require('./routes/org.routes');
const labRoutes = require('./routes/lab.routes');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow the configured frontend origin
const allowedOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
app.use(cors({ 
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// HTTP request logging via winston (replace raw morgan console.log)
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Rate-limit auth endpoints (relaxed for development)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === 'development' ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lab-reports', labReportRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/inpatient', bedRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/bloodbank', bloodBankRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/org', orgRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HIMS API is running!', env: process.env.NODE_ENV });
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  logger.error(err.message, { stack: err.stack });
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      logger.info(`MongoDB connected successfully to host: ${mongoose.connection.host}, database: ${mongoose.connection.name}`);
      
      // Auto-run seed if DB empty
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        logger.info('Database empty. Running seed script...');
        try {
          const { seedFullFlow } = require('./scripts/seedFullFlow');
          await seedFullFlow();
          logger.info('Seeding completed successfully');
        } catch (seedError) {
          logger.error('Auto-seeding failed', { error: seedError.message });
        }
      }

      app.listen(PORT, () => logger.info(`HIMS server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
      logger.error('MongoDB connection failed', { error: err.message });
      process.exit(1);
    });
}

module.exports = app;
