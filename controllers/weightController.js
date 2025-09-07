const Weight = require('../models/Weight');
const WeightGoal = require('../models/WeightGoal');
const User = require('../models/User');

// Utility functions
const calculateStats = (entries, period = 'month') => {
  if (!entries || entries.length === 0) return null;

  const now = new Date();
  let startDate;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const filteredEntries = entries.filter(entry => new Date(entry.date) >= startDate);
  if (filteredEntries.length === 0) return null;

  const weights = filteredEntries.map(entry => entry.weight);
  const current = filteredEntries[filteredEntries.length - 1].weight;
  const start = filteredEntries[0].weight;

  return {
    current,
    start,
    lowest: Math.min(...weights),
    highest: Math.max(...weights),
    average: weights.reduce((sum, weight) => sum + weight, 0) / weights.length,
    totalChange: current - start,
    entryCount: filteredEntries.length,
    period
  };
};

const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// @desc    Log weight entry
// @route   POST /api/weight/log
// @access  Private
const logWeight = async (req, res) => {
  try {
    const {
      weight,
      date,
      time,
      note,
      tags,
      isPrimaryEntry,
      measurements
    } = req.body;

    // Validation
    if (!weight || isNaN(weight)) {
      return res.status(400).json({
        success: false,
        message: 'Valid weight is required'
      });
    }

    // Create weight entry
    const weightEntry = new Weight({
      user: req.user.id,
      weight: parseFloat(weight),
      date: date ? new Date(date) : new Date(),
      time,
      note: note?.trim() || '',
      tags: tags || [],
      isPrimaryEntry: isPrimaryEntry || false,
      measurements: measurements || {}
    });

    await weightEntry.save();

    // Populate user info for response
    await weightEntry.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Weight logged successfully',
      data: weightEntry
    });

  } catch (error) {
    console.error('Log weight error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log weight',
      error: error.message
    });
  }
};

// @desc    Get weight entries
// @route   GET /api/weight/entries
// @access  Private
const getWeightEntries = async (req, res) => {
  try {
    const { period = 'month', limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Date filtering
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const query = {
      user: req.user.id,
      date: { $gte: startDate }
    };

    const entries = await Weight.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const totalEntries = await Weight.countDocuments(query);

    res.json({
      success: true,
      data: entries,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalEntries / limit),
        count: entries.length,
        totalEntries
      }
    });

  } catch (error) {
    console.error('Get weight entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weight entries',
      error: error.message
    });
  }
};

// @desc    Update weight entry
// @route   PUT /api/weight/entries/:id
// @access  Private
const updateWeightEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      weight,
      date,
      time,
      note,
      tags,
      isPrimaryEntry,
      measurements
    } = req.body;

    // Find entry
    const weightEntry = await Weight.findOne({
      _id: id,
      user: req.user.id
    });

    if (!weightEntry) {
      return res.status(404).json({
        success: false,
        message: 'Weight entry not found'
      });
    }

    // Update fields
    if (weight !== undefined && !isNaN(weight)) {
      weightEntry.weight = parseFloat(weight);
    }
    if (date) weightEntry.date = new Date(date);
    if (time) weightEntry.time = time;
    if (note !== undefined) weightEntry.note = note.trim();
    if (tags) weightEntry.tags = tags;
    if (isPrimaryEntry !== undefined) weightEntry.isPrimaryEntry = isPrimaryEntry;
    if (measurements) weightEntry.measurements = measurements;

    weightEntry.updatedAt = new Date();

    await weightEntry.save();
    await weightEntry.populate('user', 'name email');

    res.json({
      success: true,
      message: 'Weight entry updated successfully',
      data: weightEntry
    });

  } catch (error) {
    console.error('Update weight entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update weight entry',
      error: error.message
    });
  }
};

// @desc    Delete weight entry
// @route   DELETE /api/weight/entries/:id
// @access  Private
const deleteWeightEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const weightEntry = await Weight.findOne({
      _id: id,
      user: req.user.id
    });

    if (!weightEntry) {
      return res.status(404).json({
        success: false,
        message: 'Weight entry not found'
      });
    }

    await Weight.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Weight entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete weight entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete weight entry',
      error: error.message
    });
  }
};

// @desc    Get weight statistics
// @route   GET /api/weight/stats
// @access  Private
const getWeightStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Get all entries for the user
    const entries = await Weight.find({ user: req.user.id })
      .sort({ date: 1 })
      .lean();

    if (entries.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No weight data available'
      });
    }

    // Calculate stats for requested period
    const stats = calculateStats(entries, period);

    // Get user info for BMI calculation
    const user = await User.findById(req.user.id).select('height age gender');
    
    if (stats && user && user.height) {
      stats.bmi = calculateBMI(stats.current, user.height);
    }

    // Add trend data (last 7 entries for chart)
    const recentEntries = entries.slice(-7).map(entry => ({
      date: entry.date,
      weight: entry.weight
    }));

    res.json({
      success: true,
      data: {
        ...stats,
        trend: recentEntries,
        totalEntries: entries.length
      }
    });

  } catch (error) {
    console.error('Get weight stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weight statistics',
      error: error.message
    });
  }
};

// @desc    Get enhanced stats with body composition
// @route   GET /api/weight/enhanced-stats
// @access  Private
const getEnhancedStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Get entries with measurements
    const entries = await Weight.find({ 
      user: req.user.id,
      measurements: { $exists: true, $ne: {} }
    })
    .sort({ date: 1 })
    .lean();

    if (entries.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No measurement data available'
      });
    }

    // Calculate measurement changes
    const latest = entries[entries.length - 1];
    const oldest = entries[0];

    const measurementChanges = {};
    
    if (latest.measurements && oldest.measurements) {
      Object.keys(latest.measurements).forEach(key => {
        if (oldest.measurements[key] && latest.measurements[key]) {
          measurementChanges[key] = {
            current: latest.measurements[key],
            start: oldest.measurements[key],
            change: latest.measurements[key] - oldest.measurements[key]
          };
        }
      });
    }

    res.json({
      success: true,
      data: {
        measurements: measurementChanges,
        latestEntry: latest,
        oldestEntry: oldest,
        totalEntries: entries.length
      }
    });

  } catch (error) {
    console.error('Get enhanced stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enhanced statistics',
      error: error.message
    });
  }
};

// @desc    Get body composition data
// @route   GET /api/weight/body-composition
// @access  Private
const getBodyComposition = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const entries = await Weight.find({
      user: req.user.id,
      measurements: { $exists: true, $ne: {} }
    })
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .lean();

    res.json({
      success: true,
      data: entries
    });

  } catch (error) {
    console.error('Get body composition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch body composition data',
      error: error.message
    });
  }
};

// @desc    Set weight goal
// @route   POST /api/weight/goal
// @access  Private
const setWeightGoal = async (req, res) => {
  try {
    const {
      targetWeight,
      startWeight,
      targetDate,
      type, // 'lose', 'gain', 'maintain'
      weeklyGoal
    } = req.body;

    // Validation
    if (!targetWeight || isNaN(targetWeight)) {
      return res.status(400).json({
        success: false,
        message: 'Valid target weight is required'
      });
    }

    // Check if goal already exists
    let goal = await WeightGoal.findOne({ user: req.user.id });

    if (goal) {
      // Update existing goal
      goal.targetWeight = parseFloat(targetWeight);
      goal.startWeight = startWeight ? parseFloat(startWeight) : goal.startWeight;
      goal.targetDate = targetDate ? new Date(targetDate) : goal.targetDate;
      goal.type = type || goal.type;
      goal.weeklyGoal = weeklyGoal ? parseFloat(weeklyGoal) : goal.weeklyGoal;
      goal.isActive = true;
      goal.updatedAt = new Date();
    } else {
      // Create new goal
      goal = new WeightGoal({
        user: req.user.id,
        targetWeight: parseFloat(targetWeight),
        startWeight: startWeight ? parseFloat(startWeight) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        type: type || 'lose',
        weeklyGoal: weeklyGoal ? parseFloat(weeklyGoal) : 0.5,
        isActive: true
      });
    }

    await goal.save();
    await goal.populate('user', 'name email');

    res.json({
      success: true,
      message: goal.isNew ? 'Weight goal created successfully' : 'Weight goal updated successfully',
      data: goal
    });

  } catch (error) {
    console.error('Set weight goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set weight goal',
      error: error.message
    });
  }
};

// @desc    Get weight goal
// @route   GET /api/weight/goal
// @access  Private
const getWeightGoal = async (req, res) => {
  try {
    const goal = await WeightGoal.findOne({ 
      user: req.user.id,
      isActive: true 
    }).populate('user', 'name email');

    if (!goal) {
      return res.json({
        success: true,
        data: null,
        message: 'No active weight goal found'
      });
    }

    res.json({
      success: true,
      data: goal
    });

  } catch (error) {
    console.error('Get weight goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weight goal',
      error: error.message
    });
  }
};

// @desc    Update goal status
// @route   PUT /api/weight/goal/:id
// @access  Private
const updateGoalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isCompleted } = req.body;

    const goal = await WeightGoal.findOne({
      _id: id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Weight goal not found'
      });
    }

    if (isActive !== undefined) goal.isActive = isActive;
    if (isCompleted !== undefined) goal.isCompleted = isCompleted;
    
    goal.updatedAt = new Date();

    await goal.save();

    res.json({
      success: true,
      message: 'Goal status updated successfully',
      data: goal
    });

  } catch (error) {
    console.error('Update goal status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal status',
      error: error.message
    });
  }
};

module.exports = {
  logWeight,
  getWeightEntries,
  updateWeightEntry,
  deleteWeightEntry,
  getWeightStats,
  getEnhancedStats,
  getBodyComposition,
  setWeightGoal,
  getWeightGoal,
  updateGoalStatus
}; 