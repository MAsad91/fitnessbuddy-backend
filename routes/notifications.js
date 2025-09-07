const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  registerToken,
  updateSettings,
  sendNotification,
  scheduleNotification,
  getSettings
} = require('../controllers/notificationController');

// Register FCM token
router.post('/register-token', protect, registerToken);

// Update notification settings
router.put('/settings', protect, updateSettings);

// Get notification settings
router.get('/settings', protect, getSettings);

// Send notification (admin only)
router.post('/send', protect, sendNotification);

// Schedule notification
router.post('/schedule', protect, scheduleNotification);

module.exports = router;
