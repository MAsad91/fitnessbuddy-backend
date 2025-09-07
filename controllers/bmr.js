const BMR = require('../models/BMR'); 
const Weight = require('../models/Weight');
const { calculateBMI, calculateBMR, calculateBodyFat, calculateCaloriesForGoal } = require('../utils/healthCalculations');

exports.calculateBMR = async (req, res) => {
  const { weight, height, age, gender } = req.body;
  
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5; // Harris-Benedict equation for male
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161; // Harris-Benedict equation for female
  }

  try {
    const bmrRecord = new BMR({ user: req.user._id, weight, height, age, gender, bmr, date: new Date() });
    await bmrRecord.save();
    res.status(201).json(bmrRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate BMR' });
  }
};

exports.getBMRLogs = async (req, res) => {
  try {
    const logs = await BMR.find({ user: req.user._id });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BMR logs' });
  }
};

// @desc    Calculate daily calorie needs based on goals
// @route   POST /api/bmr/daily-needs
// @access  Private
exports.calculateDailyNeeds = async (req, res) => {
  try {
    const { activityLevel, weightGoal, weeklyGoal } = req.body;
    
    // Get user's latest weight and BMR data
    const latestWeight = await Weight.findOne({ 
      user: req.user._id, 
      isPrimaryEntry: true 
    }).sort({ date: -1 });
    
    if (!latestWeight) {
      return res.status(400).json({ 
        message: 'No weight data found. Please add your current weight first.' 
      });
    }
    
    // Calculate BMR
    const bmr = calculateBMR(
      latestWeight.weight,
      req.user.height,
      req.user.age,
      req.user.gender
    );
    
    if (!bmr) {
      return res.status(400).json({ 
        message: 'Unable to calculate BMR. Please ensure your height, age, and gender are set.' 
      });
    }
    
    // Calculate daily needs
    const dailyNeeds = {
      maintenance: calculateCaloriesForGoal(bmr, activityLevel, 'maintain'),
      weightLoss: calculateCaloriesForGoal(bmr, activityLevel, 'lose', weeklyGoal || 0.5),
      weightGain: calculateCaloriesForGoal(bmr, activityLevel, 'gain', weeklyGoal || 0.5),
      bmr: bmr,
      activityLevel: activityLevel
    };
    
    res.json(dailyNeeds);
  } catch (error) {
    console.error('Daily needs calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate daily needs' });
  }
};

// @desc    Get body composition data
// @route   GET /api/bmr/body-composition
// @access  Private
exports.getBodyComposition = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    // Get weight entries with body composition data
    const entries = await Weight.find({
      user: req.user._id,
      date: { $gte: startDate },
      $or: [
        { bodyFat: { $exists: true, $ne: null } },
        { muscleMass: { $exists: true, $ne: null } },
        { 'measurements.chest': { $exists: true, $ne: null } }
      ]
    }).sort({ date: -1 });
    
    // Calculate body composition trends
    const bodyComposition = {
      entries: entries,
      trends: {
        bodyFat: entries.length > 1 ? {
          current: entries[0].bodyFat,
          start: entries[entries.length - 1].bodyFat,
          change: entries[0].bodyFat - entries[entries.length - 1].bodyFat,
          average: entries.reduce((sum, entry) => sum + (entry.bodyFat || 0), 0) / entries.length
        } : null,
        muscleMass: entries.length > 1 ? {
          current: entries[0].muscleMass,
          start: entries[entries.length - 1].muscleMass,
          change: entries[0].muscleMass - entries[entries.length - 1].muscleMass,
          average: entries.reduce((sum, entry) => sum + (entry.muscleMass || 0), 0) / entries.length
        } : null,
        measurements: {}
      }
    };
    
    // Calculate measurement trends
    if (entries.length > 1) {
      const measurementKeys = ['chest', 'waist', 'hips', 'biceps', 'thighs', 'neck', 'shoulders', 'forearms', 'calves'];
      measurementKeys.forEach(key => {
        const validEntries = entries.filter(entry => entry.measurements && entry.measurements[key]);
        if (validEntries.length > 1) {
          bodyComposition.trends.measurements[key] = {
            current: validEntries[0].measurements[key],
            start: validEntries[validEntries.length - 1].measurements[key],
            change: validEntries[0].measurements[key] - validEntries[validEntries.length - 1].measurements[key],
            average: validEntries.reduce((sum, entry) => sum + entry.measurements[key], 0) / validEntries.length
          };
        }
      });
    }
    
    // Calculate BMI if height is available
    if (req.user.height && entries.length > 0) {
      bodyComposition.bmi = {
        current: calculateBMI(entries[0].weight, req.user.height),
        category: getBMICategory(calculateBMI(entries[0].weight, req.user.height))
      };
    }
    
    res.json(bodyComposition);
  } catch (error) {
    console.error('Body composition error:', error);
    res.status(500).json({ error: 'Failed to fetch body composition data' });
  }
};

// Helper function to get BMI category
const getBMICategory = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};
