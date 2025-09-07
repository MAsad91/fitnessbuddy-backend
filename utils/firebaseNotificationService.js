const { initializeFirebase, getMessaging } = require('../config/firebase');
const Notification = require('../models/Notification');
const User = require('../models/User');

class FirebaseNotificationService {
  constructor() {
    // Initialize Firebase Admin SDK
    try {
      initializeFirebase();
      this.messaging = getMessaging();
      console.log('✅ Firebase Notification Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Notification Service:', error);
      this.messaging = null;
      console.log('⚠️ Push notifications will be disabled until Firebase is configured');
    }
  }

  // Register a device token for a user
  async registerToken(userId, token, platform, deviceInfo = {}) {
    try {
      // Basic token validation for FCM
      if (!token || token.length < 100) {
        console.log(`❌ Invalid FCM token format: ${token}`);
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

      console.log(`✅ FCM Token registered for user ${userId} on ${platform}`);
      return { success: true, message: 'Token registered successfully' };
    } catch (error) {
      console.error('❌ Error registering FCM token:', error);
      return { success: false, message: 'Failed to register token' };
    }
  }

  // Send notification to a specific user
  async sendToUser(userId, notification) {
    try {
      // Check if Firebase is initialized
      if (!this.messaging) {
        console.log('⚠️ Firebase not initialized, skipping push notification');
        return { success: false, message: 'Firebase not configured' };
      }

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
        token: userToken.token,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        android: {
          priority: notification.options?.priority || 'normal',
          notification: {
            sound: 'default',
            channelId: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        }
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
      console.error('❌ Error sending FCM notification to user:', error);
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
        token: userToken.token,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        android: {
          priority: notification.options?.priority || 'normal',
          notification: {
            sound: 'default',
            channelId: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        }
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
      console.error('❌ Error sending FCM notifications to users:', error);
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
        token: userToken.token,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        android: {
          priority: notification.options?.priority || 'normal',
          notification: {
            sound: 'default',
            channelId: 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        }
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
      console.error('❌ Error sending FCM notifications to all users:', error);
      return { success: false, message: 'Failed to send notifications' };
    }
  }

  // Core method to send notifications using Firebase
  async sendNotifications(messages) {
    try {
      // Filter out invalid tokens
      const validMessages = messages.filter(message => {
        if (!message.token || message.token.length < 100) {
          console.log(`❌ Invalid FCM token: ${message.token}`);
          return false;
        }
        return true;
      });

      if (validMessages.length === 0) {
        console.log('❌ No valid messages to send');
        return { success: false, message: 'No valid messages to send' };
      }

      // Send notifications in chunks (FCM allows up to 500 per request)
      const chunkSize = 500;
      const chunks = [];
      for (let i = 0; i < validMessages.length; i += chunkSize) {
        chunks.push(validMessages.slice(i, i + chunkSize));
      }

      const results = [];
      const errors = [];

      for (const chunk of chunks) {
        try {
          const response = await this.messaging.sendAll(chunk);

          // Process results
          response.responses.forEach((result, index) => {
            if (result.success) {
              results.push(result);
            } else {
              errors.push({
                token: chunk[index].token,
                error: result.error?.message || 'Unknown error'
              });
            }
          });
        } catch (error) {
          console.error('❌ Error sending FCM chunk:', error.message);
          errors.push({
            error: error.message
          });
        }
      }

      // Deactivate tokens that failed
      if (errors.length > 0) {
        console.log('⚠️ Some FCM notifications failed:', errors);
        
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

      console.log(`✅ Sent ${successCount} FCM notifications successfully`);
      return { 
        success: true, 
        message: `Sent ${successCount} notifications`,
        total: successCount + errorCount,
        errors: errorCount
      };
    } catch (error) {
      console.error('❌ Error sending FCM notifications:', error);
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
      console.log(`✅ Deactivated FCM tokens for user ${userId}`);
      return { success: true, message: 'Tokens deactivated' };
    } catch (error) {
      console.error('❌ Error deactivating FCM tokens:', error);
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

module.exports = new FirebaseNotificationService(); 