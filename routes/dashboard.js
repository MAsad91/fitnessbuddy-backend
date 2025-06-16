const express = require('express');
const router = express.Router();
const { todayCalories, WeeklyCalories, todayWaterIntake } = require('../controllers/dashboard.js');
const { protect } = require('../middleware/auth');

router.get('/todayCalories', protect, todayCalories);
router.get('/weeklyCalories', protect, WeeklyCalories);
router.get('/todayWaterIntake', protect, todayWaterIntake);

module.exports = router;