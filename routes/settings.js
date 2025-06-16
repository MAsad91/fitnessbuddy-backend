const express = require('express');
const router = express.Router();
const {
  getUserSettings,
  updateSettings,
  resetSettings,
  updateSpecificSetting,
} = require('../controllers/settings');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getUserSettings)
  .put(updateSettings);

router.post('/reset', resetSettings);
router.patch('/:setting', updateSpecificSetting);

module.exports = router; 