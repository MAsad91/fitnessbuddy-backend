const express = require('express');
const { calculateBMR, getBMRLogs } = require('../controllers/bmr.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/create', protect, calculateBMR);
router.get('/', protect, getBMRLogs);

module.exports = router;
