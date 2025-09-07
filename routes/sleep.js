const express = require('express');
const { 
  logSleep, 
  getSleepLogs,
  updateSleepEntry,
  deleteSleepEntry,
  getSleepStats,
  getSleepAnalysis,
  getSleepTrends,
  getSleepRecommendations
} = require('../controllers/sleep.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Sleep entry logging
router.post('/log', protect, logSleep);

// Get sleep logs with filtering
router.get('/logs', protect, getSleepLogs);

// Update specific sleep entry
router.put('/entry/:id', protect, updateSleepEntry);

// Delete specific sleep entry
router.delete('/entry/:id', protect, deleteSleepEntry);

// Get sleep statistics
router.get('/stats', protect, getSleepStats);

// Get sleep analysis and insights
router.get('/analysis', protect, getSleepAnalysis);

// Get sleep trends and patterns
router.get('/trends', protect, getSleepTrends);

// Get personalized sleep recommendations
router.get('/recommendations', protect, getSleepRecommendations);

// Legacy route for compatibility
router.get('/', protect, getSleepLogs);

module.exports = router;
