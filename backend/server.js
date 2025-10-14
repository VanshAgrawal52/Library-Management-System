require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requestRoutes');
const { verifyAccessToken } = require('./middlewares/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS - allow your frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true // allow cookies
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

// Example protected route
app.get('/api/protected', verifyAccessToken, (req, res) => {
  // req.user set by middleware
  res.json({ message: 'You made it to the protected route', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});