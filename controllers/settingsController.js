const User = require('../models/User');

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings notificationSettings foodNotificationPreferences');
    
    res.json({
      success: true,
      settings: user.settings || {},
      notificationSettings: user.notificationSettings || {},
      foodNotificationPreferences: user.foodNotificationPreferences || {}
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings'
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { settings, notificationSettings, foodNotificationPreferences } = req.body;

    const updateData = {};
    if (settings) updateData.settings = settings;
    if (notificationSettings) updateData.notificationSettings = notificationSettings;
    if (foodNotificationPreferences) updateData.foodNotificationPreferences = foodNotificationPreferences;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('settings notificationSettings foodNotificationPreferences');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings,
      notificationSettings: user.notificationSettings,
      foodNotificationPreferences: user.foodNotificationPreferences
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

// @desc    Get specific setting
// @route   GET /api/users/settings/:key
// @access  Private
exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const user = await User.findById(req.user._id).select('settings notificationSettings foodNotificationPreferences');
    
    let value = null;
    if (user.settings && user.settings[key]) {
      value = user.settings[key];
    } else if (user.notificationSettings && user.notificationSettings[key]) {
      value = user.notificationSettings[key];
    } else if (user.foodNotificationPreferences && user.foodNotificationPreferences[key]) {
      value = user.foodNotificationPreferences[key];
    }

    res.json({
      success: true,
      key,
      value
    });
  } catch (error) {
    console.error('Error getting setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get setting'
    });
  }
};

// @desc    Update specific setting
// @route   PUT /api/users/settings/:key
// @access  Private
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const userId = req.user._id;

    // Determine which settings object to update based on the key
    let updateData = {};
    if (['theme', 'preferences'].includes(key)) {
      updateData[`settings.${key}`] = value;
    } else if (['enabled', 'mealReminders', 'waterReminders', 'goalUpdates', 'weeklyReports', 'reminderTime'].includes(key)) {
      updateData[`notificationSettings.${key}`] = value;
    } else {
      updateData[`foodNotificationPreferences.${key}`] = value;
    }

    await User.findByIdAndUpdate(userId, updateData);

    res.json({
      success: true,
      message: 'Setting updated successfully',
      key,
      value
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting'
    });
  }
}; 