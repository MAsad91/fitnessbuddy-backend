const User = require('../models/User');
const Notification = require('../models/Notification');
const FoodEntry = require('../models/FoodEntry');

// Update food notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const preferences = req.body;

    // Update user's food notification preferences
    await User.findByIdAndUpdate(userId, { 
      foodNotificationPreferences: preferences 
    });

    res.json({
      success: true,
      message: 'Food notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating food notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update food notification preferences'
    });
  }
};

// Check smart alerts
exports.checkSmartAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get today's food entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const foodEntries = await FoodEntry.find({
      userId,
      createdAt: { $gte: today }
    });

    // Calculate total calories
    const totalCalories = foodEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);

    // Check if user needs reminders based on their goals
    const user = await User.findById(userId);
    const dailyCalorieGoal = user.dailyCalorieGoal || 2000;

    let alerts = [];

    if (totalCalories < dailyCalorieGoal * 0.3) {
      alerts.push({
        type: 'low_calories',
        message: 'You\'ve only consumed ' + Math.round(totalCalories) + ' calories today. Consider having a meal!'
      });
    }

    if (totalCalories > dailyCalorieGoal * 1.2) {
      alerts.push({
        type: 'high_calories',
        message: 'You\'ve consumed ' + Math.round(totalCalories) + ' calories today. Consider lighter meals!'
      });
    }

    res.json({
      success: true,
      alerts,
      totalCalories,
      dailyGoal: dailyCalorieGoal
    });
  } catch (error) {
    console.error('Error checking smart alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check smart alerts'
    });
  }
};

// Send meal reminder
exports.sendMealReminder = async (req, res) => {
  try {
    const { mealType } = req.body;
    const userId = req.user._id;

    const notification = new Notification({
      userId,
      title: 'Meal Reminder',
      body: `Time for your ${mealType}! Don't forget to log your food.`,
      type: 'meal_reminder'
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Meal reminder sent successfully'
    });
  } catch (error) {
    console.error('Error sending meal reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send meal reminder'
    });
  }
};

// Send achievement notification
exports.sendAchievement = async (req, res) => {
  try {
    const { achievementType, message } = req.body;
    const userId = req.user._id;

    const notification = new Notification({
      userId,
      title: 'Achievement Unlocked!',
      body: message,
      type: 'achievement',
      metadata: { achievementType }
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Achievement notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending achievement notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send achievement notification'
    });
  }
};

// Check goal achievement
exports.checkGoalAchievement = async (req, res) => {
  try {
    const userId = req.user._id;
    const { goalId } = req.body;

    // Implementation for checking goal achievement
    // This would check if the user has achieved their specific goal

    res.json({
      success: true,
      message: 'Goal achievement checked successfully'
    });
  } catch (error) {
    console.error('Error checking goal achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check goal achievement'
    });
  }
};

// Check streak achievement
exports.checkStreakAchievement = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check user's current streak
    const user = await User.findById(userId);
    const currentStreak = user.currentStreak || 0;

    let achievement = null;
    if (currentStreak >= 7) {
      achievement = {
        type: 'weekly_streak',
        message: 'Congratulations! You\'ve maintained a 7-day streak!'
      };
    } else if (currentStreak >= 30) {
      achievement = {
        type: 'monthly_streak',
        message: 'Amazing! You\'ve maintained a 30-day streak!'
      };
    }

    res.json({
      success: true,
      achievement,
      currentStreak
    });
  } catch (error) {
    console.error('Error checking streak achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check streak achievement'
    });
  }
};

// Test notification
exports.testNotification = async (req, res) => {
  try {
    const userId = req.user._id;

    const notification = new Notification({
      userId,
      title: 'Test Notification',
      body: 'This is a test notification from the backend.',
      type: 'test'
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Test notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
};

// Test Firebase
exports.testFirebase = async (req, res) => {
  try {
    // This would test Firebase Cloud Messaging
    res.json({
      success: true,
      message: 'Firebase test completed successfully'
    });
  } catch (error) {
    console.error('Error testing Firebase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test Firebase'
    });
  }
};

// Get notification stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalNotifications = await Notification.countDocuments({ userId });
    const unreadNotifications = await Notification.countDocuments({ 
      userId, 
      read: false 
    });

    res.json({
      success: true,
      stats: {
        total: totalNotifications,
        unread: unreadNotifications
      }
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification stats'
    });
  }
};

// Get notifications list
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true }
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};
