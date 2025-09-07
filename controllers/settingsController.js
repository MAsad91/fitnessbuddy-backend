const Settings = require('../models/Settings');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user settings
// @route   GET /api/v1/settings
// @access  Private
exports.getSettings = asyncHandler(async (req, res, next) => {
  const settings = await Settings.findOne({ userId: req.user.id });
  
  if (!settings) {
    // Create default settings if none exist
    const defaultSettings = await Settings.create({
      userId: req.user.id
    });
    return res.status(200).json(defaultSettings);
  }

  res.status(200).json(settings);
});

// @desc    Update user settings
// @route   PUT /api/v1/settings
// @access  Private
exports.updateSettings = asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne({ userId: req.user.id });
  
  if (!settings) {
    settings = await Settings.create({
      userId: req.user.id,
      ...req.body
    });
  } else {
    settings = await Settings.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
  }

  res.status(200).json(settings);
});

// @desc    Update biometric settings
// @route   PUT /api/v1/settings/biometrics
// @access  Private
exports.updateBiometricSettings = asyncHandler(async (req, res, next) => {
  const { useBiometrics } = req.body;

  if (typeof useBiometrics !== 'boolean') {
    return next(new ErrorResponse('Invalid biometric setting value', 400));
  }

  let settings = await Settings.findOne({ userId: req.user.id });
  
  if (!settings) {
    settings = await Settings.create({
      userId: req.user.id,
      preferences: { useBiometrics }
    });
  } else {
    settings = await Settings.findOneAndUpdate(
      { userId: req.user.id },
      { 'preferences.useBiometrics': useBiometrics },
      {
        new: true,
        runValidators: true
      }
    );
  }

  res.status(200).json(settings);
}); 