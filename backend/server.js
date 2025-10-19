require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const requestRoutes = require('./routes/requestRoutes');
const analyticsRoutes = require('./routes/analytics');
const { verifyAccessToken } = require('./middlewares/auth');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Debug log incoming requests
app.use((req, res, next) => {
  // console.log(`Request URL: ${req.url}, Content-Type: ${req.get('Content-Type')}`);
  next();
});

app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Skip JSON body parsing for multipart requests
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    // console.log('⚠️ Skipping JSON body parsing for multipart request');
    return next();
  }

  // Only apply JSON parsing for normal JSON requests
  bodyParser.json({ limit: '10mb' })(req, res, (err) => {
    if (err) {
      console.error('JSON parse error:', err.message);
      return res.status(400).json({ message: 'Invalid JSON' });
    }
    next();
  });
});

// Handle URL-encoded forms (like login)
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Mount routes AFTER body parsers
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', analyticsRoutes);

// Example protected route
app.get('/api/protected', verifyAccessToken, (req, res) => {
  res.json({ message: 'You made it to the protected route', user: req.user });
});

// Connect DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});