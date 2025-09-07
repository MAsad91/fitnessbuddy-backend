const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  logWeight,
  getWeightEntries,
  updateWeightEntry,
  deleteWeightEntry,
  getWeightStats,
  setWeightGoal,
  getWeightGoal,
  updateGoalStatus,
  getBodyComposition,
  getEnhancedStats
} = require('../controllers/weightController');

// Weight entries routes
router.route('/log')
  .post(protect, logWeight);

router.route('/entries')
  .get(protect, getWeightEntries);

router.route('/entries/:id')
  .put(protect, updateWeightEntry)
  .delete(protect, deleteWeightEntry);

router.route('/stats')
  .get(protect, getWeightStats);

router.route('/enhanced-stats')
  .get(protect, getEnhancedStats);

// Body composition routes
router.route('/body-composition')
  .get(protect, getBodyComposition);

// Weight goal routes
router.route('/goal')
  .get(protect, getWeightGoal)
  .post(protect, setWeightGoal);

router.route('/goal/:id')
  .put(protect, updateGoalStatus);

module.exports = router; 