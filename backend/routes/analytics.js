const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust path to your User model
const { verifyAccessToken } = require('../middlewares/auth'); // Assuming you have authentication middleware
const { analytics } = require('../controllers/analyticsController');

// GET user analytics
router.get('/analytics', verifyAccessToken, analytics);

module.exports = router;