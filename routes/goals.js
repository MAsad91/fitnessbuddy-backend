const express = require('express');
const { createGoal, getGoals } = require('../controllers/goal.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create', protect, createGoal);
router.get('/', protect, getGoals);

module.exports = router;
