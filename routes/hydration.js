const express = require('express');
const { logHydration, getHydrationLogs } = require('../controllers/hydration.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/log', protect, logHydration);
router.get('/', protect, getHydrationLogs);

module.exports = router;
