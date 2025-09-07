const Pusher = require('pusher');
const Notification = require('../models/Notification');
const User = require('../models/User');

class PusherNotificationService {
  constructor() {
    // Initialize Pusher
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || 'your-app-id',
      key: process.env.PUSHER_KEY || 'your-key',
      secret: process.env.PUSHER_SECRET || 'your-secret',
      cluster: process.env.PUSHER_CLUSTER || 'us2',
      useTLS: true
    });
  }

  // Register a device token for a user
  async registerToken(userId, token, platform, deviceInfo = {}) {
    try {
      // For Pusher, we'll use the token as a channel name
      // In a real implementation, you might want to use a different approach
      const channelName = `user-${userId}`;
      
      // Update or create notification record
      const notificationData = {
        userId,
        token: channelName, // Use channel name as token
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

      console.log(`✅ Pusher channel registered for user ${userId}: ${channelName}`);
      return { success: true, message: 'Channel registered successfully' };
    } catch (error) {
      console.error('❌ Error registering Pusher channel:', error);
      return { success: false, message: 'Failed to register channel' };
    }
  }

  // Send notification to a specific user
  async sendToUser(userId, notification) {
    try {
      // Check user's notification settings first
      const user = await User.findById(userId).select('settings.notifications');
      const userSettings = user?.settings?.notifications;
      
      // If notifications are disabled for this user, don't send
      if (!userSettings || !userSettings.enabled) {
        console.log(`⚠️ Notifications disabled for user ${userId}`);
        return { success: false, message: 'Notifications disabled for user' };
      }

      // Check quiet hours if enabled
      if (userSettings.quietHours && userSettings.quietHours.enabled) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        
        const [startHour, startMinute] = userSettings.quietHours.start.split(':').map(Number);
        const [endHour, endMinute] = userSettings.quietHours.end.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        // Check if current time is within quiet hours
        if (startTime <= endTime) {
          // Same day quiet hours (e.g., 22:00 to 08:00)
          if (currentTime >= startTime || currentTime <= endTime) {
            console.log(`⚠️ Quiet hours active for user ${userId}`);
            return { success: false, message: 'Quiet hours active' };
          }
        } else {
          // Overnight quiet hours (e.g., 22:00 to 08:00)
          if (currentTime >= startTime || currentTime <= endTime) {
            console.log(`⚠️ Quiet hours active for user ${userId}`);
            return { success: false, message: 'Quiet hours active' };
          }
        }
      }

      // Check specific notification type settings
      if (notification.data?.type) {
        const notificationType = notification.data.type;
        const typeSettings = {
          'meal_reminder': userSettings.mealReminders,
          'water_reminder': userSettings.waterReminders,
          'workout_reminder': userSettings.workoutReminders,
          'goal_achievement': userSettings.goalUpdates,
          'weekly_report': userSettings.weeklyReports
        };
        
        if (typeSettings[notificationType] === false) {
          console.log(`⚠️ ${notificationType} disabled for user ${userId}`);
          return { success: false, message: `${notificationType} disabled for user` };
        }
      }

      // Get user's notification channels
      const userTokens = await Notification.find({ 
        userId, 
        isActive: true 
      });

      if (userTokens.length === 0) {
        console.log(`⚠️ No active channels found for user ${userId}`);
        return { success: false, message: 'No active channels found' };
      }

      // Send to each channel
      const results = [];
      for (const userToken of userTokens) {
        try {
          const channelName = userToken.token;
          const result = await this.pusher.trigger(channelName, 'notification', {
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            timestamp: new Date().toISOString(),
            ...notification.options
          });
          
          results.push(result);
        } catch (error) {
          console.error(`❌ Error sending to channel ${userToken.token}:`, error);
        }
      }

      // Update last used timestamp for successful channels
      if (results.length > 0) {
        await Notification.updateMany(
          { userId, isActive: true },
          { lastUsed: new Date() }
        );
      }

      console.log(`✅ Sent ${results.length} Pusher notifications to user ${userId}`);
      return { 
        success: true, 
        message: `Sent ${results.length} notifications`,
        total: results.length
      };
    } catch (error) {
      console.error('❌ Error sending Pusher notification to user:', error);
      return { success: false, message: 'Failed to send notification' };
    }
  }

  // Send notification to multiple users
  async sendToUsers(userIds, notification) {
    try {
      // Get all channels for the specified users
      const userTokens = await Notification.find({ 
        userId: { $in: userIds }, 
        isActive: true 
      });

      if (userTokens.length === 0) {
        console.log('⚠️ No active channels found for specified users');
        return { success: false, message: 'No active channels found' };
      }

      // Send to each channel
      const results = [];
      for (const userToken of userTokens) {
        try {
          const channelName = userToken.token;
          const result = await this.pusher.trigger(channelName, 'notification', {
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            timestamp: new Date().toISOString(),
            ...notification.options
          });
          
          results.push(result);
        } catch (error) {
          console.error(`❌ Error sending to channel ${userToken.token}:`, error);
        }
      }

      // Update last used timestamp for successful channels
      if (results.length > 0) {
        await Notification.updateMany(
          { userId: { $in: userIds }, isActive: true },
          { lastUsed: new Date() }
        );
      }

      console.log(`✅ Sent ${results.length} Pusher notifications to users`);
      return { 
        success: true, 
        message: `Sent ${results.length} notifications`,
        total: results.length
      };
    } catch (error) {
      console.error('❌ Error sending Pusher notifications to users:', error);
      return { success: false, message: 'Failed to send notifications' };
    }
  }

  // Send notification to all users
  async sendToAll(notification) {
    try {
      // Get all active channels
      const allTokens = await Notification.find({ isActive: true });

      if (allTokens.length === 0) {
        console.log('⚠️ No active channels found');
        return { success: false, message: 'No active channels found' };
      }

      // Send to each channel
      const results = [];
      for (const userToken of allTokens) {
        try {
          const channelName = userToken.token;
          const result = await this.pusher.trigger(channelName, 'notification', {
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
            timestamp: new Date().toISOString(),
            ...notification.options
          });
          
          results.push(result);
        } catch (error) {
          console.error(`❌ Error sending to channel ${userToken.token}:`, error);
        }
      }

      // Update last used timestamp for successful channels
      if (results.length > 0) {
        await Notification.updateMany(
          { isActive: true },
          { lastUsed: new Date() }
        );
      }

      console.log(`✅ Sent ${results.length} Pusher notifications to all users`);
      return { 
        success: true, 
        message: `Sent ${results.length} notifications`,
        total: results.length
      };
    } catch (error) {
      console.error('❌ Error sending Pusher notifications to all users:', error);
      return { success: false, message: 'Failed to send notifications' };
    }
  }

  // Send meal reminder
  async sendMealReminder(userId, mealType = 'meal') {
    // Check if meal reminders are enabled for this user
    const user = await User.findById(userId).select('settings.notifications');
    const userSettings = user?.settings?.notifications;
    
    if (!userSettings?.mealReminders) {
      console.log(`⚠️ Meal reminders disabled for user ${userId}`);
      return { success: false, message: 'Meal reminders disabled for user' };
    }

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
    // Check if water reminders are enabled for this user
    const user = await User.findById(userId).select('settings.notifications');
    const userSettings = user?.settings?.notifications;
    
    if (!userSettings?.waterReminders) {
      console.log(`⚠️ Water reminders disabled for user ${userId}`);
      return { success: false, message: 'Water reminders disabled for user' };
    }

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
    // Check if workout reminders are enabled for this user
    const user = await User.findById(userId).select('settings.notifications');
    const userSettings = user?.settings?.notifications;
    
    if (!userSettings?.workoutReminders) {
      console.log(`⚠️ Workout reminders disabled for user ${userId}`);
      return { success: false, message: 'Workout reminders disabled for user' };
    }

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
    // Check if goal updates are enabled for this user
    const user = await User.findById(userId).select('settings.notifications');
    const userSettings = user?.settings?.notifications;
    
    if (!userSettings?.goalUpdates) {
      console.log(`⚠️ Goal updates disabled for user ${userId}`);
      return { success: false, message: 'Goal updates disabled for user' };
    }

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
    // Check if weekly reports are enabled for this user
    const user = await User.findById(userId).select('settings.notifications');
    const userSettings = user?.settings?.notifications;
    
    if (!userSettings?.weeklyReports) {
      console.log(`⚠️ Weekly reports disabled for user ${userId}`);
      return { success: false, message: 'Weekly reports disabled for user' };
    }

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
      console.log(`✅ Deactivated Pusher channels for user ${userId}`);
      return { success: true, message: 'Channels deactivated' };
    } catch (error) {
      console.error('❌ Error deactivating Pusher channels:', error);
      return { success: false, message: 'Failed to deactivate channels' };
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

  // Get Pusher client configuration for mobile app
  getClientConfig() {
    return {
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true
    };
  }
}

module.exports = new PusherNotificationService(); 