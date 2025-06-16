const Settings = require('../models/Settings');
const asyncHandler = require('express-async-handler');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
const getUserSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne({ userId: req.user._id });

  if (!settings) {
    // Create default settings if none exist
    const defaultSettings = await Settings.create({
      userId: req.user._id,
    });
    res.json(defaultSettings);
  } else {
    res.json(settings);
  }
});

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = asyncHandler(async (req, res) => {
  const {
    theme,
    notifications,
    preferences,
  } = req.body;

  const settings = await Settings.findOne({ userId: req.user._id });

  if (!settings) {
    res.status(404);
    throw new Error('Settings not found');
  }

  // Update only the fields that are provided
  if (theme) settings.theme = { ...settings.theme, ...theme };
  if (notifications) settings.notifications = { ...settings.notifications, ...notifications };
  if (preferences) settings.preferences = { ...settings.preferences, ...preferences };

  settings.lastUpdated = Date.now();
  const updatedSettings = await settings.save();

  res.json(updatedSettings);
});

// @desc    Reset user settings to default
// @route   POST /api/settings/reset
// @access  Private
const resetSettings = asyncHandler(async (req, res) => {
  await Settings.findOneAndDelete({ userId: req.user._id });

  const defaultSettings = await Settings.create({
    userId: req.user._id,
  });

  res.json(defaultSettings);
});

// @desc    Update specific setting
// @route   PATCH /api/settings/:setting
// @access  Private
const updateSpecificSetting = asyncHandler(async (req, res) => {
  const { setting } = req.params;
  const { value } = req.body;

  const settings = await Settings.findOne({ userId: req.user._id });

  if (!settings) {
    res.status(404);
    throw new Error('Settings not found');
  }

  // Handle nested settings using dot notation
  const updateQuery = {};
  updateQuery[setting] = value;

  const updatedSettings = await Settings.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updateQuery },
    { new: true }
  );

  res.json(updatedSettings);
});

module.exports = {
  getUserSettings,
  updateSettings,
  resetSettings,
  updateSpecificSetting,
}; 