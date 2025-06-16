const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  logWeight,
  getWeightEntries,
  getWeightStats,
  setWeightGoal,
  getWeightGoal,
  updateGoalStatus
} = require('../controllers/weightController');

// Weight entries routes
router.route('/log')
  .post(protect, logWeight);

router.route('/entries')
  .get(protect, getWeightEntries);

router.route('/stats')
  .get(protect, getWeightStats);

// Weight goal routes
router.route('/goal')
  .get(protect, getWeightGoal)
  .post(protect, setWeightGoal);

router.route('/goal/:id')
  .put(protect, updateGoalStatus);

module.exports = router; 