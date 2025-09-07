const express = require('express');
const { logProgress, getProgressLogs } = require('../controllers/progress.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/log', protect, logProgress);
router.get('/', protect, getProgressLogs);

module.exports = router;
