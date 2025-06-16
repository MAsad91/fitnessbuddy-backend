const express = require('express');
const { logSleep, getSleepLogs } = require('../controllers/sleep.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/log', protect, logSleep);
router.get('/', protect, getSleepLogs);

module.exports = router;
