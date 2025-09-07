const express = require('express');
const { 
  logHydration, 
  getHydrationLogs,
  updateHydrationEntry,
  deleteHydrationEntry,
  getHydrationStats,
  setDailyGoal,
  getDailyGoal
} = require('../controllers/hydration.js');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Water intake logging
router.post('/log', protect, logHydration);

// Get hydration logs with filtering
router.get('/logs', protect, getHydrationLogs);

// Update specific hydration entry
router.put('/entry/:id', protect, updateHydrationEntry);

// Delete specific hydration entry
router.delete('/entry/:id', protect, deleteHydrationEntry);

// Get hydration statistics
router.get('/stats', protect, getHydrationStats);

// Daily goal management
router.post('/goal', protect, setDailyGoal);
router.get('/goal', protect, getDailyGoal);

// Legacy route for compatibility
router.get('/', protect, getHydrationLogs);

module.exports = router;
