// Structure: server/routes/auth.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  register, 
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  verifyEmail
} = require('../controllers/auth');

// Get current logged in user
router.get('/me', protect, getCurrentUser);

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', verifyEmail);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// PUT /api/auth/reset-password/:token
router.put('/reset-password/:token', resetPassword);

module.exports = router;