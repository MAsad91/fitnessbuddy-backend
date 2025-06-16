const Weight = require('../models/Weight');
const WeightGoal = require('../models/WeightGoal');
const User = require('../models/User');
const healthCalc = require('../utils/healthCalculations');

// Helper Functions
function calculateStats(userId, entries, period) {
  if (!entries.length) return null;

  const user = User.findById(userId);
  const now = new Date();
  const startDate = new Date(0);

  switch (period) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
  }

  const periodEntries = entries.filter(function(entry) {
    return entry.date >= startDate;
  });

  const current = periodEntries[periodEntries.length - 1].weight;
  const start = periodEntries[0].weight;

  // Calculate measurements changes
  const measurementsStats = {};
  if (periodEntries[0].measurements && periodEntries[periodEntries.length - 1].measurements) {
    const startMeasurements = periodEntries[0].measurements;
    const currentMeasurements = periodEntries[periodEntries.length - 1].measurements;

    Object.keys(startMeasurements).forEach(function(key) {
      if (currentMeasurements[key]) {
        measurementsStats[key] = {
          start: startMeasurements[key],
          current: currentMeasurements[key],
          change: currentMeasurements[key] - startMeasurements[key]
        };
      }
    });
  }

  return {
    current: current,
    start: start,
    lowest: Math.min.apply(null, periodEntries.map(function(e) { return e.weight; })),
    highest: Math.max.apply(null, periodEntries.map(function(e) { return e.weight; })),
    average: periodEntries.reduce(function(sum, e) { return sum + e.weight; }, 0) / periodEntries.length,
    totalChange: current - start,
    changeRate: healthCalc.calculateWeightChangeRate(
      current,
      start,
      (periodEntries[periodEntries.length - 1].date - periodEntries[0].date) / (1000 * 60 * 60 * 24)
    ),
    bmi: healthCalc.calculateBMI(current, user.height),
    bmr: healthCalc.calculateBMR(current, user.height, user.age, user.gender),
    measurements: measurementsStats
  };
}

function generateMilestones(startWeight, targetWeight) {
  const totalChange = targetWeight - startWeight;
  const milestones = [];
  
  // Generate 4 evenly spaced milestones
  for (const i = 1; i <= 4; i++) {
    const milestone = {
      weight: parseFloat((startWeight + (totalChange * (i / 4))).toFixed(1)),
      achieved: false
    };
    milestones.push(milestone);
  }
  
  return milestones;
}

// Weight Entry Controllers
exports.logWeight = function(req, res) {
  try {
    var weightData = {
      user: req.user.id,
      weight: req.body.weight,
      date: req.body.date || new Date(),
      time: req.body.time,
      note: req.body.note,
      tags: req.body.tags || [],
      isPrimaryEntry: req.body.isPrimaryEntry || false,
      measurements: req.body.measurements
    };

    Weight.create(weightData)
      .then(function(weight) {
        res.status(201).json(weight);
      })
      .catch(function(error) {
        res.status(500).json({ message: 'Error logging weight', error: error.message });
      });
  } catch (error) {
    res.status(500).json({ message: 'Error logging weight', error: error.message });
  }
};

exports.getWeightEntries = function(req, res) {
  try {
    var period = req.query.period || 'all';
    var dateFilter = {};

    if (period !== 'all') {
      var today = new Date();
      var startDate = new Date();

      switch (period) {
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(today.getFullYear() - 1);
          break;
      }

      dateFilter = { date: { $gte: startDate } };
    }

    Weight.find({
      user: req.user.id,
      ...dateFilter
    })
    .sort({ date: -1 })
    .then(function(entries) {
      res.json(entries);
    })
    .catch(function(error) {
      res.status(500).json({ message: 'Error fetching weight entries', error: error.message });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weight entries', error: error.message });
  }
};

exports.updateWeight = function(req, res) {
  try {
    Weight.findOneAndUpdate(
      { _id: req.params.weightId, user: req.user.id },
      req.body,
      { new: true }
    )
    .then(function(weight) {
      if (!weight) {
        return res.status(404).json({ message: 'Weight entry not found' });
      }
      res.json(weight);
    })
    .catch(function(error) {
      res.status(500).json({ message: 'Error updating weight entry', error: error.message });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating weight entry', error: error.message });
  }
};

exports.deleteWeight = function(req, res) {
  try {
    Weight.findOneAndDelete({
      _id: req.params.weightId,
      user: req.user.id
    })
    .then(function(weight) {
      if (!weight) {
        return res.status(404).json({ message: 'Weight entry not found' });
      }
      res.json({ message: 'Weight entry deleted successfully' });
    })
    .catch(function(error) {
      res.status(500).json({ message: 'Error deleting weight entry', error: error.message });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting weight entry', error: error.message });
  }
};

exports.getWeightStats = function(req, res) {
  try {
    var period = req.query.period || 'all';
    var dateFilter = {};

    if (period !== 'all') {
      var today = new Date();
      var startDate = new Date();

      switch (period) {
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(today.getFullYear() - 1);
          break;
      }

      dateFilter = { date: { $gte: startDate } };
    }

    Weight.find({
      user: req.user.id,
      ...dateFilter,
      isPrimaryEntry: true
    })
    .sort({ date: 1 })
    .then(function(entries) {
      if (entries.length === 0) {
        return res.json({
          current: null,
          totalChange: 0,
          average: 0
        });
      }

      var stats = {
        current: entries[entries.length - 1].weight,
        totalChange: entries[entries.length - 1].weight - entries[0].weight,
        average: entries.reduce(function(sum, entry) { return sum + entry.weight; }, 0) / entries.length
      };

      res.json(stats);
    })
    .catch(function(error) {
      res.status(500).json({ message: 'Error calculating weight stats', error: error.message });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating weight stats', error: error.message });
  }
};

exports.getDailyAverages = function(req, res) {
  try {
    Weight.aggregate([
      {
        $match: {
          user: req.user.id,
          date: {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          averageWeight: { $avg: '$weight' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
    .then(function(entries) {
      res.json(entries);
    })
    .catch(function(error) {
      res.status(500).json({ message: 'Error calculating daily averages', error: error.message });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating daily averages', error: error.message });
  }
};

// Weight Goal Controllers
exports.setWeightGoal = function(req, res) {
  try {
    const goalData = {
      user: req.user.id,
      targetWeight: req.body.targetWeight,
      startWeight: req.body.startWeight,
      type: req.body.type,
      targetDate: req.body.targetDate,
      weeklyGoal: req.body.weeklyGoal
    };

    // Calculate milestones
    const totalChange = goalData.targetWeight - goalData.startWeight;
    const milestoneCount = 4;
    const milestoneStep = totalChange / milestoneCount;

    goalData.milestones = Array.from({ length: milestoneCount }, function(_, index) {
      return {
        weight: goalData.startWeight + (milestoneStep * (index + 1)),
        achieved: false
      };
    });

    WeightGoal.findOneAndUpdate(
      { user: req.user.id },
      goalData,
      { new: true, upsert: true }
    )
    .then(function(goal) {
      res.json(goal);
    })
    .catch(function(error) {
      res.status(500).json({ message: 'Error setting weight goal', error: error.message });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error setting weight goal', error: error.message });
  }
};

exports.getWeightGoal = async function(req, res) {
  try {
    const goal = await WeightGoal.findOne({
      user: req.user.id,
      status: 'active'
    });

    // Return null if no goal found (this is an expected state)
    res.json(goal || null);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching weight goal', 
      error: error.message 
    });
  }
};

exports.updateMilestone = function(req, res) {
  try {
    WeightGoal.findOne({ user: req.user.id })
      .then(function(goal) {
        if (!goal) {
          return res.status(404).json({ message: 'Weight goal not found' });
        }

        const milestone = goal.milestones.id(req.params.milestoneId);
        if (!milestone) {
          return res.status(404).json({ message: 'Milestone not found' });
        }

        milestone.achieved = req.body.achieved;
        if (req.body.achieved) {
          milestone.achievedDate = new Date();
        } else {
          milestone.achievedDate = null;
        }

        return goal.save();
      })
      .then(function(updatedGoal) {
        res.json(updatedGoal);
      })
      .catch(function(error) {
        res.status(500).json({ message: 'Error updating milestone', error: error.message });
      });
  } catch (error) {
    res.status(500).json({ message: 'Error updating milestone', error: error.message });
  }
};