const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const foodNotificationController = require('../controllers/foodNotifications');

// Get user's food notification preferences
router.get('/preferences', protect, async (req, res) => {
  try {
    const preferences = await foodNotificationController.getUserNotificationPreferences(req.user.id);
    
    if (preferences) {
      res.json({
        success: true,
        data: preferences
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Notification preferences not found'
      });
    }
  } catch (error) {
    console.error('❌ Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences'
    });
  }
});

// Update user's food notification preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: 'Notification preferences are required'
      });
    }

    const result = await foodNotificationController.updateUserNotificationPreferences(
      req.user.id,
      preferences
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Notification preferences updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to update notification preferences'
      });
    }
  } catch (error) {
    console.error('❌ Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
});

// Check and send smart alerts for the current user
router.post('/check-smart-alerts', protect, async (req, res) => {
  try {
    const result = await foodNotificationController.checkAndSendSmartAlerts(req.user.id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Smart alerts check completed'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to check smart alerts'
      });
    }
  } catch (error) {
    console.error('❌ Error checking smart alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check smart alerts'
    });
  }
});

// Send meal reminder notification
router.post('/meal-reminder', protect, async (req, res) => {
  try {
    const { mealType } = req.body;
    
    if (!mealType) {
      return res.status(400).json({
        success: false,
        message: 'Meal type is required'
      });
    }

    const result = await foodNotificationController.sendMealReminder(req.user.id, mealType);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Meal reminder sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to send meal reminder'
      });
    }
  } catch (error) {
    console.error('❌ Error sending meal reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send meal reminder'
    });
  }
});

// Send achievement notification
router.post('/achievement', protect, async (req, res) => {
  try {
    const { achievementType, details } = req.body;
    
    if (!achievementType) {
      return res.status(400).json({
        success: false,
        message: 'Achievement type is required'
      });
    }

    const result = await foodNotificationController.sendAchievementNotification(
      req.user.id,
      achievementType,
      details || {}
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Achievement notification sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to send achievement notification'
      });
    }
  } catch (error) {
    console.error('❌ Error sending achievement notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send achievement notification'
    });
  }
});

// Check for daily goal achievement
router.post('/check-goal-achievement', protect, async (req, res) => {
  try {
    await foodNotificationController.checkDailyGoalAchievement(req.user.id);
    
    res.json({
      success: true,
      message: 'Goal achievement check completed'
    });
  } catch (error) {
    console.error('❌ Error checking goal achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check goal achievement'
    });
  }
});

// Check for logging streak achievement
router.post('/check-streak-achievement', protect, async (req, res) => {
  try {
    await foodNotificationController.checkLoggingStreakAchievement(req.user.id);
    
    res.json({
      success: true,
      message: 'Streak achievement check completed'
    });
  } catch (error) {
    console.error('❌ Error checking streak achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check streak achievement'
    });
  }
});

// Get user's notifications
router.get('/list', protect, async (req, res) => {
  try {
    const result = await foodNotificationController.getUserNotifications(req.user.id);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to get notifications'
      });
    }
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
});

// Mark notification as read
router.put('/mark-read/:notificationId', protect, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const result = await foodNotificationController.markNotificationAsRead(
      req.user.id,
      notificationId
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || 'Failed to mark notification as read'
      });
    }
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Test Firebase notification
router.post('/test-firebase', protect, async (req, res) => {
  try {
    const firebaseNotificationService = require('../utils/firebaseNotificationService');
    
    const result = await firebaseNotificationService.sendToUser(req.user.id, {
      title: '🧪 Firebase Test',
      body: 'This is a test notification from Firebase!',
      data: { type: 'test' }
    });
    
    res.json({
      success: true,
      message: 'Firebase test notification sent',
      result
    });
  } catch (error) {
    console.error('❌ Error sending Firebase test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Firebase test failed',
      error: error.message
    });
  }
});

// Test notification (for development)
router.post('/test', protect, async (req, res) => {
  try {
    const { type, message } = req.body;
    
    const testNotification = {
      title: '🧪 Test Notification',
      body: message || 'This is a test notification from the food notification system',
      data: {
        type: 'test',
        testType: type || 'general',
        screen: 'FoodView'
      }
    };

    await foodNotificationController.sendAchievementNotification(
      req.user.id,
      'test',
      { message: testNotification.body }
    );
    
    res.json({
      success: true,
      message: 'Test notification sent successfully'
    });
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

// Get notification statistics for the user
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's food entries
    const FoodEntry = require('../models/FoodEntry');
    const foodEntries = await FoodEntry.find({
      userId: req.user.id,
      createdAt: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Calculate statistics
    const totalCalories = foodEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
    const totalProtein = foodEntries.reduce((sum, entry) => sum + (entry.protein || 0), 0);
    const totalCarbs = foodEntries.reduce((sum, entry) => sum + (entry.carbs || 0), 0);
    const totalFat = foodEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0);

    const mealsByType = foodNotificationController.groupEntriesByMealType(foodEntries);
    const mealsLogged = Object.keys(mealsByType).filter(type => mealsByType[type].length > 0).length;

    const stats = {
      totalEntries: foodEntries.length,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      mealsLogged,
      mealsByType: {
        breakfast: mealsByType.breakfast.length,
        lunch: mealsByType.lunch.length,
        dinner: mealsByType.dinner.length,
        snack: mealsByType.snack.length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification statistics'
    });
  }
});

module.exports = router; 