const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  updateSetting,
  getSetting
} = require('../controllers/settingsController');

// Get all user settings
router.get('/', protect, getSettings);

// Update all settings
router.put('/', protect, updateSettings);

// Get specific setting
router.get('/:key', protect, getSetting);

// Update specific setting
router.put('/:key', protect, updateSetting);

module.exports = router;
