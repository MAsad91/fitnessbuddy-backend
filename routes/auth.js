// Structure: server/routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { protect } = require('../middleware/auth');
const { 
  register, 
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  enableBiometric,
  disableBiometric,
  getBiometricStatus,
  updateSettings,
  getSettings,
  googleCallback
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

// PUT /api/auth/change-password
router.put('/change-password', protect, changePassword);

// POST /api/auth/logout
router.get('/logout', logout);

// Settings routes
router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);

// Biometric routes
router.post('/biometric/enable', protect, enableBiometric);
router.post('/biometric/disable', protect, disableBiometric);
router.get('/biometric/status', protect, getBiometricStatus);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID) {
    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleCallback);
} else {
    router.get('/google', (req, res) => {
        res.status(400).json({ 
            success: false, 
            message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID environment variable.' 
        });
    });
}

module.exports = router;