const axios = require('axios');
const Notification = require('../models/Notification');
const User = require('../models/User');

class SimpleNotificationService {
  constructor() {
    this.expoApiUrl = 'https://exp.host/--/api/v2/push/send';
  }

  // Register a device token for a user
  async registerToken(userId, token, platform, deviceInfo = {}) {
    try {
      // Basic token validation (Expo tokens start with ExponentPushToken)
      if (!token.startsWith('ExponentPushToken[')) {
        console.log(`❌ Invalid token format: ${token}`);
        return { success: false, message: 'Invalid token format' };
      }

      // Update or create notification record
      const notificationData = {
        userId,
        token,
        platform,
        deviceInfo,
        lastUsed: new Date(),
        isActive: true
      };

      await Notification.findOneAndUpdate(
        { userId, platform },
        notificationData,
        { upsert: true, new: true }
      );

      console.log(`✅ Token registered for user ${userId} on ${platform}`);
      return { success: true, message: 'Token registered successfully' };
    } catch (error) {
      console.error('❌ Error registering token:', error);
      return { success: false, message: 'Failed to register token' };
    }
  }

  // Send notification to a specific user
  async sendToUser(userId, notification) {
    try {
      // Get user's notification tokens
      const userTokens = await Notification.find({ 
        userId, 
        isActive: true 
      });

      if (userTokens.length === 0) {
        console.log(`⚠️ No active tokens found for user ${userId}`);
        return { success: false, message: 'No active tokens found' };
      }

      // Prepare messages for each token
      const messages = userTokens.map(userToken => ({
        to: userToken.token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        ...notification.options
      }));

      // Send notifications
      const result = await this.sendNotifications(messages);
      
      // Update last used timestamp for successful tokens
      if (result.success) {
        await Notification.updateMany(
          { userId, isActive: true },
          { lastUsed: new Date() }
        );
      }

      return result;
    } catch (error) {
      console.error('❌ Error sending notification to user:', error);
      return { success: false, message: 'Failed to send notification' };
    }
  }

  // Send notification to multiple users
  async sendToUsers(userIds, notification) {
    try {
      // Get all tokens for the specified users
      const userTokens = await Notification.find({ 
        userId: { $in: userIds }, 
        isActive: true 
      });

      if (userTokens.length === 0) {
        console.log('⚠️ No active tokens found for specified users');
        return { success: false, message: 'No active tokens found' };
      }

      // Prepare messages
      const messages = userTokens.map(userToken => ({
        to: userToken.token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        ...notification.options
      }));

      // Send notifications
      const result = await this.sendNotifications(messages);
      
      // Update last used timestamp for successful tokens
      if (result.success) {
        await Notification.updateMany(
          { userId: { $in: userIds }, isActive: true },
          { lastUsed: new Date() }
        );
      }

      return result;
    } catch (error) {
      console.error('❌ Error sending notification to users:', error);
      return { success: false, message: 'Failed to send notifications' };
    }
  }

  // Send notification to all users
  async sendToAll(notification) {
    try {
      // Get all active tokens
      const allTokens = await Notification.find({ isActive: true });

      if (allTokens.length === 0) {
        console.log('⚠️ No active tokens found');
        return { success: false, message: 'No active tokens found' };
      }

      // Prepare messages
      const messages = allTokens.map(userToken => ({
        to: userToken.token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        ...notification.options
      }));

      // Send notifications
      const result = await this.sendNotifications(messages);
      
      // Update last used timestamp for successful tokens
      if (result.success) {
        await Notification.updateMany(
          { isActive: true },
          { lastUsed: new Date() }
        );
      }

      return result;
    } catch (error) {
      console.error('❌ Error sending notification to all users:', error);
      return { success: false, message: 'Failed to send notifications' };
    }
  }

  // Core method to send notifications using HTTP requests
  async sendNotifications(messages) {
    try {
      // Filter out invalid tokens
      const validMessages = messages.filter(message => {
        if (!message.to.startsWith('ExponentPushToken[')) {
          console.log(`❌ Invalid token: ${message.to}`);
          return false;
        }
        return true;
      });

      if (validMessages.length === 0) {
        console.log('❌ No valid messages to send');
        return { success: false, message: 'No valid messages to send' };
      }

      // Send notifications in chunks (max 100 per request)
      const chunkSize = 100;
      const chunks = [];
      for (let i = 0; i < validMessages.length; i += chunkSize) {
        chunks.push(validMessages.slice(i, i + chunkSize));
      }

      const results = [];
      const errors = [];

      for (const chunk of chunks) {
        try {
          const response = await axios.post(this.expoApiUrl, chunk, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Accept-encoding': 'gzip, deflate'
            },
            timeout: 10000 // 10 second timeout
          });

          if (response.data && response.data.data) {
            // Check for errors in the response
            response.data.data.forEach((result, index) => {
              if (result.status === 'error') {
                errors.push({
                  token: chunk[index].to,
                  error: result.message || 'Unknown error'
                });
              } else {
                results.push(result);
              }
            });
          }
        } catch (error) {
          console.error('❌ Error sending chunk:', error.message);
          errors.push({
            error: error.message
          });
        }
      }

      // Deactivate tokens that failed
      if (errors.length > 0) {
        console.log('⚠️ Some notifications failed:', errors);
        
        for (const error of errors) {
          if (error.token) {
            await Notification.updateOne(
              { token: error.token },
              { isActive: false }
            );
          }
        }
      }

      const successCount = results.length;
      const errorCount = errors.length;

      console.log(`✅ Sent ${successCount} notifications successfully`);
      return { 
        success: true, 
        message: `Sent ${successCount} notifications`,
        total: successCount + errorCount,
        errors: errorCount
      };
    } catch (error) {
      console.error('❌ Error sending notifications:', error);
      return { success: false, message: 'Failed to send notifications' };
    }
  }

  // Send meal reminder
  async sendMealReminder(userId, mealType = 'meal') {
    const notification = {
      title: '🍽️ Time to log your meal!',
      body: `Don't forget to track your ${mealType} for better health.`,
      data: { type: 'meal_reminder', mealType },
      options: {
        priority: 'high'
      }
    };

    return await this.sendToUser(userId, notification);
  }

  // Send water reminder
  async sendWaterReminder(userId) {
    const notification = {
      title: '💧 Stay hydrated!',
      body: 'Time to drink some water and track your hydration.',
      data: { type: 'water_reminder' },
      options: {
        priority: 'normal'
      }
    };

    return await this.sendToUser(userId, notification);
  }

  // Send workout reminder
  async sendWorkoutReminder(userId, workoutType = 'workout') {
    const notification = {
      title: '💪 Workout time!',
      body: `Time for your scheduled ${workoutType}. Let's get moving!`,
      data: { type: 'workout_reminder', workoutType },
      options: {
        priority: 'high'
      }
    };

    return await this.sendToUser(userId, notification);
  }

  // Send goal achievement notification
  async sendGoalAchievement(userId, goalType, achievement) {
    const notification = {
      title: '🎉 Goal Achieved!',
      body: `Congratulations! You've reached your ${goalType} goal: ${achievement}`,
      data: { type: 'goal_achievement', goalType, achievement },
      options: {
        priority: 'high',
        sound: 'default'
      }
    };

    return await this.sendToUser(userId, notification);
  }

  // Send weekly report
  async sendWeeklyReport(userId, reportData) {
    const notification = {
      title: '📊 Your Weekly Progress Report',
      body: `Check out your progress this week: ${reportData.summary}`,
      data: { type: 'weekly_report', reportData },
      options: {
        priority: 'normal'
      }
    };

    return await this.sendToUser(userId, notification);
  }

  // Deactivate a user's tokens
  async deactivateUserTokens(userId) {
    try {
      await Notification.updateMany(
        { userId },
        { isActive: false }
      );
      console.log(`✅ Deactivated tokens for user ${userId}`);
      return { success: true, message: 'Tokens deactivated' };
    } catch (error) {
      console.error('❌ Error deactivating tokens:', error);
      return { success: false, message: 'Failed to deactivate tokens' };
    }
  }

  // Get user's notification settings
  async getUserNotificationSettings(userId) {
    try {
      const user = await User.findById(userId).select('settings.notifications');
      return user?.settings?.notifications || null;
    } catch (error) {
      console.error('❌ Error getting notification settings:', error);
      return null;
    }
  }

  // Update user's notification settings
  async updateUserNotificationSettings(userId, settings) {
    try {
      await User.findByIdAndUpdate(userId, {
        'settings.notifications': settings
      });
      console.log(`✅ Updated notification settings for user ${userId}`);
      return { success: true, message: 'Settings updated' };
    } catch (error) {
      console.error('❌ Error updating notification settings:', error);
      return { success: false, message: 'Failed to update settings' };
    }
  }
}

module.exports = new SimpleNotificationService(); 