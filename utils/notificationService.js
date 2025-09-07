const { Expo } = require('expo-server-sdk');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create a new Expo SDK instance
const expo = new Expo();

class NotificationService {
  constructor() {
    this.expo = expo;
  }

  // Register a device token for a user
  async registerToken(userId, token, platform, deviceInfo = {}) {
    try {
      // Validate the token
      if (!Expo.isExpoPushToken(token)) {
        console.log(`❌ Invalid Expo push token: ${token}`);
        return { success: false, message: 'Invalid push token' };
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

  // Core method to send notifications using Expo
  async sendNotifications(messages) {
    try {
      // Filter out invalid tokens
      const validMessages = messages.filter(message => {
        if (!Expo.isExpoPushToken(message.to)) {
          console.log(`❌ Invalid token: ${message.to}`);
          return false;
        }
        return true;
      });

      if (validMessages.length === 0) {
        console.log('❌ No valid messages to send');
        return { success: false, message: 'No valid messages to send' };
      }

      // Send notifications in chunks (Expo recommends max 100 per request)
      const chunks = expo.chunkPushNotifications(validMessages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('❌ Error sending chunk:', error);
        }
      }

      // Check for errors
      const errors = [];
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          errors.push({
            token: ticket.message?.to,
            error: ticket.details?.error
          });
        }
      }

      if (errors.length > 0) {
        console.log('⚠️ Some notifications failed:', errors);
        
        // Deactivate tokens that failed
        for (const error of errors) {
          if (error.token) {
            await Notification.updateOne(
              { token: error.token },
              { isActive: false }
            );
          }
        }
      }

      console.log(`✅ Sent ${tickets.length - errors.length} notifications successfully`);
      return { 
        success: true, 
        message: `Sent ${tickets.length - errors.length} notifications`,
        total: tickets.length,
        errors: errors.length
      };
    } catch (error) {
      console.error('❌ Error sending notifications:', error);
      return { success: false, message: 'Failed to send notifications' };
    }
  }

  // Schedule a notification for later
  async scheduleNotification(userId, notification, scheduledTime) {
    try {
      // Store the scheduled notification in the database
      // This is a simplified version - in production you'd want a proper job queue
      const scheduledNotification = {
        userId,
        notification,
        scheduledTime,
        status: 'pending'
      };

      // For now, we'll just log it
      console.log('📅 Scheduled notification:', scheduledNotification);
      
      // In a real implementation, you'd store this in a database
      // and have a cron job or similar to process scheduled notifications
      
      return { success: true, message: 'Notification scheduled' };
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return { success: false, message: 'Failed to schedule notification' };
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

module.exports = new NotificationService(); 