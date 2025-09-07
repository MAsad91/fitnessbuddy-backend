const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  updatePreferences,
  checkSmartAlerts,
  sendMealReminder,
  sendAchievement,
  checkGoalAchievement,
  checkStreakAchievement,
  testNotification,
  testFirebase,
  getStats,
  getNotifications,
  markAsRead
} = require('../controllers/foodNotifications');

// Update food notification preferences
router.put('/preferences', protect, updatePreferences);

// Check smart alerts
router.post('/check-smart-alerts', protect, checkSmartAlerts);

// Send meal reminder
router.post('/meal-reminder', protect, sendMealReminder);

// Send achievement notification
router.post('/achievement', protect, sendAchievement);

// Check goal achievement
router.post('/check-goal-achievement', protect, checkGoalAchievement);

// Check streak achievement
router.post('/check-streak-achievement', protect, checkStreakAchievement);

// Test notification
router.post('/test', protect, testNotification);

// Test Firebase
router.post('/test-firebase', protect, testFirebase);

// Get notification stats
router.get('/stats', protect, getStats);

// Get notifications list
router.get('/list', protect, getNotifications);

// Mark notification as read
router.put('/mark-read/:notificationId', protect, markAsRead);

module.exports = router;
