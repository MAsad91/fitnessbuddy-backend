const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboard');

// Calories routes
router.get('/calories/today', protect, dashboardController.todayCalories);
router.get('/calories/weekly', protect, dashboardController.weeklyCalories);

// Water intake routes
router.get('/water/today', protect, dashboardController.todayWaterIntake);

// Goals routes
router.get('/goals', protect, dashboardController.getDashboardGoals);

module.exports = router;