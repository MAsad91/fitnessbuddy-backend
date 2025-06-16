// Structure: server/routes/users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getProfile,
  updateProfile
} = require('../controllers/users');

// GET /api/users/profile
router.get('/profile', protect, getProfile);

// PUT /api/users/profile
router.put('/profile', protect, updateProfile);

module.exports = router;