const express = require('express');
const { calculateBMR, getBMRLogs, calculateDailyNeeds, getBodyComposition } = require('../controllers/bmr.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create', protect, calculateBMR);
router.get('/', protect, getBMRLogs);
router.post('/daily-needs', protect, calculateDailyNeeds);
router.get('/body-composition', protect, getBodyComposition);

module.exports = router;
