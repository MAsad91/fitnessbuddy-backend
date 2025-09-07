const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return settings or default empty object
    const settings = user.settings || {};

    res.status(200).json({
      success: true,
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('Error getting user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Settings object is required'
      });
    }

    // Find user and update settings
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          settings: settings,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('settings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reset user settings to defaults
// @route   DELETE /api/users/settings
// @access  Private
const resetSettings = async (req, res) => {
  try {
    // Find user and reset settings
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $unset: { settings: 1 },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).select('settings');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Settings reset to defaults successfully',
      data: {
        settings: {}
      }
    });
  } catch (error) {
    console.error('Error resetting user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update specific setting
// @route   PATCH /api/users/settings/:key
// @access  Private
const updateSpecificSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Setting key is required'
      });
    }

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Setting value is required'
      });
    }

    // Validate key format (prevent prototype pollution)
    if (key.includes('__proto__') || key.includes('constructor') || key.includes('prototype')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid setting key'
      });
    }

    const user = await User.findById(req.user.id).select('settings');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize settings if not exists
    if (!user.settings) {
      user.settings = {};
    }

    // Update specific setting
    user.settings[key] = value;
    user.updatedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: `Setting '${key}' updated successfully`,
      data: {
        key,
        value: user.settings[key],
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Error updating specific setting:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get specific setting
// @route   GET /api/users/settings/:key
// @access  Private
const getSpecificSetting = async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Setting key is required'
      });
    }

    const user = await User.findById(req.user.id).select('settings');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const value = user.settings?.[key];

    res.status(200).json({
      success: true,
      data: {
        key,
        value,
        exists: value !== undefined
      }
    });
  } catch (error) {
    console.error('Error getting specific setting:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
  updateSpecificSetting,
  getSpecificSetting
}; 