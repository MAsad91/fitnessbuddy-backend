const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  resetSettings,
  updateSpecificSetting,
  getSpecificSetting
} = require('../controllers/settings');

// All routes are protected
router.use(protect);

// @route   GET /api/users/settings
// @desc    Get user settings
// @access  Private
router.get('/', getSettings);

// @route   PUT /api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/', 
  [
    body('settings')
      .isObject()
      .withMessage('Settings must be an object')
      .notEmpty()
      .withMessage('Settings object cannot be empty')
  ],
  updateSettings
);

// @route   DELETE /api/users/settings
// @desc    Reset user settings to defaults
// @access  Private
router.delete('/', resetSettings);

// @route   GET /api/users/settings/:key
// @desc    Get specific setting by key
// @access  Private
router.get('/:key', getSpecificSetting);

// @route   PATCH /api/users/settings/:key
// @desc    Update specific setting by key
// @access  Private
router.patch('/:key',
  [
    body('value')
      .exists()
      .withMessage('Value is required')
  ],
  updateSpecificSetting
);

module.exports = router; 