const notificationService = require('../utils/simpleNotificationService');
const User = require('../models/User');

// Register device token
exports.registerToken = async (req, res) => {
  try {
    const { userId, token, platform, deviceInfo } = req.body;

    if (!userId || !token || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, token, platform'
      });
    }

    const result = await notificationService.registerToken(userId, token, platform, deviceInfo);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error registering token:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send notification to specific user
exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, body, data, options } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, title, body'
      });
    }

    const notification = {
      title,
      body,
      data: data || {},
      options: options || {}
    };

    const result = await notificationService.sendToUser(userId, notification);

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send notification to multiple users
exports.sendToUsers = async (req, res) => {
  try {
    const { userIds, title, body, data, options } = req.body;

    if (!userIds || !Array.isArray(userIds) || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userIds (array), title, body'
      });
    }

    const notification = {
      title,
      body,
      data: data || {},
      options: options || {}
    };

    const result = await notificationService.sendToUsers(userIds, notification);

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending notifications to users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send notification to all users
exports.sendToAll = async (req, res) => {
  try {
    const { title, body, data, options } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, body'
      });
    }

    const notification = {
      title,
      body,
      data: data || {},
      options: options || {}
    };

    const result = await notificationService.sendToAll(notification);

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending notifications to all users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Schedule notification
exports.scheduleNotification = async (req, res) => {
  try {
    const { userId, title, body, data, scheduledTime } = req.body;

    if (!userId || !title || !body || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, title, body, scheduledTime'
      });
    }

    const notification = {
      title,
      body,
      data: data || {}
    };

    const result = await notificationService.scheduleNotification(userId, notification, scheduledTime);

    res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('❌ Error scheduling notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get notification settings
exports.getSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const settings = await notificationService.getUserNotificationSettings(userId);

    if (settings) {
      res.status(200).json({
        success: true,
        data: settings
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Notification settings not found'
      });
    }
  } catch (error) {
    console.error('❌ Error getting notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update notification settings
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Missing settings data'
      });
    }

    const result = await notificationService.updateUserNotificationSettings(userId, settings);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send meal reminder
exports.sendMealReminder = async (req, res) => {
  try {
    const { userId, mealType } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId'
      });
    }

    const result = await notificationService.sendMealReminder(userId, mealType);

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending meal reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send water reminder
exports.sendWaterReminder = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId'
      });
    }

    const result = await notificationService.sendWaterReminder(userId);

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending water reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send workout reminder
exports.sendWorkoutReminder = async (req, res) => {
  try {
    const { userId, workoutType } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId'
      });
    }

    const result = await notificationService.sendWorkoutReminder(userId, workoutType);

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending workout reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send goal achievement notification
exports.sendGoalAchievement = async (req, res) => {
  try {
    const { userId, goalType, achievement } = req.body;

    if (!userId || !goalType || !achievement) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, goalType, achievement'
      });
    }

    const result = await notificationService.sendGoalAchievement(userId, goalType, achievement);

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending goal achievement notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Send weekly report
exports.sendWeeklyReport = async (req, res) => {
  try {
    const { userId, reportData } = req.body;

    if (!userId || !reportData) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, reportData'
      });
    }

    const result = await notificationService.sendWeeklyReport(userId, reportData);

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('❌ Error sending weekly report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Deactivate user tokens (for logout)
exports.deactivateTokens = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await notificationService.deactivateUserTokens(userId);

    res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('❌ Error deactivating tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 