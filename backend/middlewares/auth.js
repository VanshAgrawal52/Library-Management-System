const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return res.status(401).json({ message: 'No access token provided' });

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    // attach user basic info to req.user
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    console.error('verifyAccessToken error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
};

module.exports = { verifyAccessToken };