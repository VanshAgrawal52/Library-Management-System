const User = require('../models/User');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('name email role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const checkAdmin = async (req, res) => {
  try {
    // verifyToken middleware should have set req.user from the JWT
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ isAdmin: false, message: 'Access denied' });
    }

    res.json({ isAdmin: true });
  } catch (error) {
    console.error('Error checking admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers , updateUserRole, checkAdmin };