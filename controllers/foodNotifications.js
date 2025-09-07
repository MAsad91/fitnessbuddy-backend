const FoodEntry = require('../models/FoodEntry');
const User = require('../models/User');
const Notification = require('../models/Notification');
const firebaseNotificationService = require('../utils/firebaseNotificationService');

class FoodNotificationController {
  // Check and send smart alerts for a user
  async checkAndSendSmartAlerts(userId) {
    try {
      console.log(`🔔 Checking smart alerts for user: ${userId}`);
      
      // Get today's food entries
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const foodEntries = await FoodEntry.find({
        userId,
        createdAt: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      // Calculate daily totals
      const dailyTotals = this.calculateDailyTotals(foodEntries);
      
      // Get user preferences
      const user = await User.findById(userId);
      const calorieGoal = user?.calorieGoal || 2000;
      
      // Check for various alerts
      await this.checkLowCalorieAlert(userId, dailyTotals.calories, calorieGoal);
      await this.checkOvereatingAlert(userId, dailyTotals.calories, calorieGoal);
      await this.checkMissingMealsAlert(userId, foodEntries);
      await this.checkMacroImbalanceAlert(userId, dailyTotals);
      
      console.log('✅ Smart alerts check completed');
      return { success: true };
    } catch (error) {
      console.error('❌ Error checking smart alerts:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculate daily nutrition totals
  calculateDailyTotals(foodEntries) {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };

    foodEntries.forEach(entry => {
      totals.calories += entry.calories || 0;
      totals.protein += entry.protein || 0;
      totals.carbs += entry.carbs || 0;
      totals.fat += entry.fat || 0;
      totals.fiber += entry.fiber || 0;
      totals.sugar += entry.sugar || 0;
      totals.sodium += entry.sodium || 0;
    });

    return totals;
  }

  // Check for low calorie alert
  async checkLowCalorieAlert(userId, currentCalories, calorieGoal) {
    const lowCalorieThreshold = Math.min(800, calorieGoal * 0.4);
    
    if (currentCalories < lowCalorieThreshold) {
      const notification = {
        title: '📊 Low Calorie Alert',
        body: `You've only logged ${currentCalories} calories today. Make sure to meet your daily nutrition needs!`,
        data: {
          type: 'low_calorie',
          calories: currentCalories,
          goal: calorieGoal,
          screen: 'FoodView'
        }
      };

      await firebaseNotificationService.sendToUser(userId, notification);
      console.log(`📊 Low calorie alert sent to user ${userId}`);
    }
  }

  // Check for overeating alert
  async checkOvereatingAlert(userId, currentCalories, calorieGoal) {
    const overeatingThreshold = calorieGoal + 300;
    
    if (currentCalories > overeatingThreshold) {
      const overage = currentCalories - calorieGoal;
      const notification = {
        title: '⚠️ Calorie Goal Exceeded',
        body: `You're ${overage} calories over your daily goal. Consider adjusting your next meal.`,
        data: {
          type: 'overeating',
          overage,
          currentCalories,
          goal: calorieGoal,
          screen: 'FoodView'
        }
      };

      await firebaseNotificationService.sendToUser(userId, notification);
      console.log(`⚠️ Overeating alert sent to user ${userId}`);
    }
  }

  // Check for missing meals alert
  async checkMissingMealsAlert(userId, foodEntries) {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Group entries by meal type
    const mealsByType = this.groupEntriesByMealType(foodEntries);
    
    const missingMeals = [];
    
    // Check for missing breakfast (before 10 AM)
    if (currentHour >= 10 && (!mealsByType.breakfast || mealsByType.breakfast.length === 0)) {
      missingMeals.push('breakfast');
    }
    
    // Check for missing lunch (before 2 PM)
    if (currentHour >= 14 && (!mealsByType.lunch || mealsByType.lunch.length === 0)) {
      missingMeals.push('lunch');
    }
    
    // Check for missing dinner (before 8 PM)
    if (currentHour >= 20 && (!mealsByType.dinner || mealsByType.dinner.length === 0)) {
      missingMeals.push('dinner');
    }

    // Send alert for the first missing meal
    if (missingMeals.length > 0) {
      const mealNames = {
        breakfast: 'breakfast',
        lunch: 'lunch',
        dinner: 'dinner'
      };

      const missingMeal = missingMeals[0];
      const notification = {
        title: `🌅 Missing ${mealNames[missingMeal]}?`,
        body: `You haven't logged your ${mealNames[missingMeal]} yet. Don't forget to track your nutrition!`,
        data: {
          type: 'missing_meal',
          meal: missingMeal,
          screen: 'FoodView'
        }
      };

      await firebaseNotificationService.sendToUser(userId, notification);
      console.log(`🌅 Missing meal alert sent to user ${userId}: ${missingMeal}`);
    }
  }

  // Group food entries by meal type
  groupEntriesByMealType(foodEntries) {
    const meals = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };

    foodEntries.forEach(entry => {
      const mealType = entry.mealType || 'snack';
      if (meals[mealType]) {
        meals[mealType].push(entry);
      }
    });

    return meals;
  }

  // Check for macro imbalance alert
  async checkMacroImbalanceAlert(userId, dailyTotals) {
    const totalCalories = dailyTotals.calories;
    if (totalCalories === 0) return;

    // Calculate macro percentages
    const proteinCalories = dailyTotals.protein * 4;
    const carbsCalories = dailyTotals.carbs * 4;
    const fatCalories = dailyTotals.fat * 9;

    const proteinPercentage = (proteinCalories / totalCalories) * 100;
    const carbsPercentage = (carbsCalories / totalCalories) * 100;
    const fatPercentage = (fatCalories / totalCalories) * 100;

    // Check for imbalances
    if (proteinPercentage < 10) {
      const notification = {
        title: '⚖️ Low Protein Alert',
        body: 'Your protein intake is low today. Consider adding protein-rich foods to your next meal.',
        data: {
          type: 'macro_imbalance',
          macro: 'protein',
          percentage: proteinPercentage,
          screen: 'FoodView'
        }
      };

      await firebaseNotificationService.sendToUser(userId, notification);
      console.log(`⚖️ Low protein alert sent to user ${userId}`);
    }

    if (carbsPercentage > 70) {
      const notification = {
        title: '⚖️ High Carb Alert',
        body: 'Your carb intake is quite high today. Consider balancing with more protein and healthy fats.',
        data: {
          type: 'macro_imbalance',
          macro: 'carbs',
          percentage: carbsPercentage,
          screen: 'FoodView'
        }
      };

      await firebaseNotificationService.sendToUser(userId, notification);
      console.log(`⚖️ High carb alert sent to user ${userId}`);
    }
  }



  // Send achievement notification
  async sendAchievementNotification(userId, achievementType, details) {
    try {
      const notifications = {
        goal_achieved: {
          title: '🎉 Goal Achieved!',
          body: `Congratulations! You've reached your ${details.goal} goal.`,
          data: {
            type: 'goal_achievement',
            goal: details.goal,
            screen: 'ProgressView'
          }
        },
        streak_bonus: {
          title: '🔥 Streak Bonus!',
          body: `You've logged meals for ${details.days} days straight!`,
          data: {
            type: 'streak_achievement',
            days: details.days,
            screen: 'ProgressView'
          }
        },
        weight_loss: {
          title: '📉 Weight Loss Milestone!',
          body: `Great progress! You've lost ${details.weight}kg this month.`,
          data: {
            type: 'weight_achievement',
            weight: details.weight,
            screen: 'ProgressView'
          }
        },
        macro_balance: {
          title: '⚖️ Perfect Macro Balance!',
          body: 'Excellent! Your macros are perfectly balanced today.',
          data: {
            type: 'macro_achievement',
            screen: 'FoodView'
          }
        },
        calorie_goal: {
          title: '🎯 Calorie Goal Hit!',
          body: `Perfect! You've reached your daily calorie goal of ${details.goal} calories.`,
          data: {
            type: 'calorie_achievement',
            goal: details.goal,
            screen: 'FoodView'
          }
        }
      };

      const notification = notifications[achievementType];
      if (notification) {
              await firebaseNotificationService.sendToUser(userId, notification);
      console.log(`🎉 Achievement notification sent to user ${userId}: ${achievementType}`);
        return { success: true };
      }

      return { success: false, error: 'Unknown achievement type' };
    } catch (error) {
      console.error('❌ Error sending achievement notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Check for daily goal achievement
  async checkDailyGoalAchievement(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.calorieGoal) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const foodEntries = await FoodEntry.find({
        userId,
        createdAt: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      const totalCalories = foodEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
      
      // Check if user has reached their calorie goal (within 50 calories)
      if (Math.abs(totalCalories - user.calorieGoal) <= 50) {
        await this.sendAchievementNotification(userId, 'calorie_goal', {
          goal: user.calorieGoal,
          actual: totalCalories
        });
      }
    } catch (error) {
      console.error('❌ Error checking daily goal achievement:', error);
    }
  }

  // Check for logging streak achievement
  async checkLoggingStreakAchievement(userId) {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Check if user has logged food for the past 7 days
      const foodEntries = await FoodEntry.find({
        userId,
        createdAt: { $gte: sevenDaysAgo }
      });

      // Group by date
      const entriesByDate = {};
      foodEntries.forEach(entry => {
        const date = entry.createdAt.toDateString();
        if (!entriesByDate[date]) {
          entriesByDate[date] = [];
        }
        entriesByDate[date].push(entry);
      });

      const uniqueDays = Object.keys(entriesByDate).length;
      
      if (uniqueDays >= 7) {
        await this.sendAchievementNotification(userId, 'streak_bonus', {
          days: uniqueDays
        });
      }
    } catch (error) {
      console.error('❌ Error checking logging streak achievement:', error);
    }
  }

  // Send meal reminder notification
  async sendMealReminder(userId, mealType) {
    try {
      const mealMessages = {
        breakfast: {
          title: '🌅 Breakfast Time!',
          body: 'Start your day with a healthy breakfast. Log your morning meal to stay on track.',
          data: { type: 'meal_reminder', meal: 'breakfast', screen: 'FoodView' }
        },
        lunch: {
          title: '🌞 Lunch Break!',
          body: "Time for lunch! Don't forget to log your midday meal for better nutrition tracking.",
          data: { type: 'meal_reminder', meal: 'lunch', screen: 'FoodView' }
        },
        dinner: {
          title: '🌙 Dinner Time!',
          body: 'Log your dinner to complete your daily nutrition tracking. How was your day?',
          data: { type: 'meal_reminder', meal: 'dinner', screen: 'FoodView' }
        },
        snack: {
          title: '🍎 Healthy Snack Time!',
          body: 'Time for a nutritious snack! Choose something healthy to keep your energy up.',
          data: { type: 'meal_reminder', meal: 'snack', screen: 'FoodView' }
        }
      };

      const notification = mealMessages[mealType];
      if (notification) {
              await firebaseNotificationService.sendToUser(userId, notification);
      console.log(`🍽️ Meal reminder sent to user ${userId}: ${mealType}`);
        return { success: true };
      }

      return { success: false, error: 'Unknown meal type' };
    } catch (error) {
      console.error('❌ Error sending meal reminder:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's notification preferences
  async getUserNotificationPreferences(userId) {
    try {
      const user = await User.findById(userId);
      return user?.notificationPreferences || {
        mealReminders: true,
        smartAlerts: true,
        achievementNotifications: true,
        mealSchedule: {
          breakfast: '08:00',
          lunch: '12:30',
          dinner: '19:00',
          snacks: ['15:00', '21:00']
        },
        calorieGoal: 2000,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      };
    } catch (error) {
      console.error('❌ Error getting user notification preferences:', error);
      return null;
    }
  }

  // Update user's notification preferences
  async updateUserNotificationPreferences(userId, preferences) {
    try {
      await User.findByIdAndUpdate(userId, {
        notificationPreferences: preferences
      });

      console.log(`✅ Notification preferences updated for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating notification preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's notifications
  async getUserNotifications(userId) {
    try {
      const notifications = await Notification.find({
        userId,
        isRead: false
      }).sort({ createdAt: -1 });

      return { success: true, data: notifications };
    } catch (error) {
      console.error('❌ Error getting user notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark notification as read
  async markNotificationAsRead(userId, notificationId) {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true }
      );

      console.log(`✅ Notification marked as read: ${notificationId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new FoodNotificationController(); 