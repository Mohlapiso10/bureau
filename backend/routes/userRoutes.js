const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware'); // ✅ Use destructuring for clarity

// 🔐 Middleware to ensure admin access
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// ✅ GET all users (admin only)
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Hide passwords
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// ✅ POST add new user (admin only)
router.post('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = new User({ fullName, email, password, role });
    await newUser.save();

    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// ✅ DELETE user by ID (admin only)
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
