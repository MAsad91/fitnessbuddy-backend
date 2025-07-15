// Structure: server/routes/auth.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  register, 
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  enableBiometric,
  disableBiometric,
  getBiometricStatus,
  updateSettings,
  getSettings
} = require('../controllers/auth');

// Get current logged in user
router.get('/me', protect, getMe);

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

// POST /api/auth/logout
router.get('/logout', logout);

// Settings routes
router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);

// Biometric routes
router.post('/biometric/enable', protect, enableBiometric);
router.post('/biometric/disable', protect, disableBiometric);
router.get('/biometric/status', protect, getBiometricStatus);

module.exports = router;