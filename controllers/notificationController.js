const User = require('../models/User');
const Notification = require('../models/Notification');

// Register FCM token
exports.registerToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    // Update user's FCM token
    await User.findByIdAndUpdate(userId, { fcmToken: token });

    res.json({
      success: true,
      message: 'FCM token registered successfully'
    });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register FCM token'
    });
  }
};

// Update notification settings
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const settings = req.body;

    // Update user's notification settings
    await User.findByIdAndUpdate(userId, { notificationSettings: settings });

    res.json({
      success: true,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings'
    });
  }
};

// Get notification settings
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationSettings');
    
    res.json({
      success: true,
      settings: user.notificationSettings || {}
    });
  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification settings'
    });
  }
};

// Send notification
exports.sendNotification = async (req, res) => {
  try {
    const { title, body, userId } = req.body;

    // Create notification record
    const notification = new Notification({
      userId,
      title,
      body,
      type: 'manual'
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
};

// Schedule notification
exports.scheduleNotification = async (req, res) => {
  try {
    const { title, body, scheduledTime } = req.body;
    const userId = req.user._id;

    // Create scheduled notification record
    const notification = new Notification({
      userId,
      title,
      body,
      type: 'scheduled',
      scheduledTime: new Date(scheduledTime)
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Notification scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule notification'
    });
  }
};
