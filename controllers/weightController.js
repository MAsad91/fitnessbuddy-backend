const Weight = require('../models/Weight');
const WeightGoal = require('../models/WeightGoal');
const { calculateBMI, calculateBMR } = require('../utils/healthCalculations');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// @desc    Log a new weight entry
// @route   POST /api/weight/log
// @access  Private
const logWeight = asyncHandler(async (req, res) => {
  const { weight, bodyFat, muscleMass, measurements, notes } = req.body;
  
  const weightEntry = await Weight.create({
    user: req.user._id,
    weight,
    bodyFat,
    muscleMass,
    measurements,
    notes
  });

  res.status(201).json(weightEntry);
});

// @desc    Get weight entries
// @route   GET /api/weight/entries
// @access  Private
const getWeightEntries = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;
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
      startDate = new Date(0); // Beginning of time
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  const entries = await Weight.find({
    user: new mongoose.Types.ObjectId(req.user._id),
    date: { $gte: startDate }
  }).sort({ date: -1 });

  res.json(entries);
});

// @desc    Get weight statistics
// @route   GET /api/weight/stats
// @access  Private
const getWeightStats = asyncHandler(async (req, res) => {
  const stats = await Weight.getStats(req.user._id);
  
  if (!stats) {
    return res.json({
      current: null,
      start: null,
      min: null,
      max: null,
      entries: 0
    });
  }

  // Calculate BMI if height is available
  if (req.user.height) {
    stats.bmi = calculateBMI(stats.current, req.user.height);
  }

  // Calculate BMR if necessary data is available
  if (req.user.height && req.user.age && req.user.gender) {
    stats.bmr = calculateBMR(
      stats.current,
      req.user.height,
      req.user.age,
      req.user.gender
    );
  }

  res.json(stats);
});

// @desc    Set weight goal
// @route   POST /api/weight/goal
// @access  Private
const setWeightGoal = asyncHandler(async (req, res) => {
  const {
    goalType,
    targetWeight,
    targetDate,
    weeklyGoal
  } = req.body;

  // Get current weight
  const latestWeight = await Weight.findOne({
    user: new mongoose.Types.ObjectId(req.user._id),
    isPrimaryEntry: true
  }).sort({ date: -1 });

  if (!latestWeight) {
    return res.status(400).json({ message: 'No weight entries found. Please add your current weight first.' });
  }

  // Mark any existing active goals as abandoned
  await WeightGoal.updateMany(
    { user: new mongoose.Types.ObjectId(req.user._id), status: 'active' },
    { status: 'abandoned' }
  );

  // Calculate milestones
  const totalChange = Math.abs(targetWeight - latestWeight.weight);
  const milestoneCount = 4; // Number of milestones
  const changePerMilestone = totalChange / milestoneCount;
  
  const milestones = Array.from({ length: milestoneCount }, (_, i) => {
    const milestoneWeight = goalType === 'lose'
      ? latestWeight.weight - (changePerMilestone * (i + 1))
      : latestWeight.weight + (changePerMilestone * (i + 1));
    
    return {
      weight: Number(milestoneWeight.toFixed(1)),
      date: new Date(Date.now() + (((i + 1) / milestoneCount) * (new Date(targetDate) - Date.now()))),
      achieved: false
    };
  });

  const weightGoal = new WeightGoal({
    user: req.user._id,
    goalType,
    startWeight: latestWeight.weight,
    targetWeight,
    startDate: new Date(),
    targetDate,
    weeklyGoal,
    milestones
  });

  await weightGoal.save();
  res.status(201).json(weightGoal);
});

// @desc    Get current weight goal
// @route   GET /api/weight/goal
// @access  Private
const getWeightGoal = asyncHandler(async (req, res) => {
  const goal = await WeightGoal.findOne({
    user: new mongoose.Types.ObjectId(req.user._id),
    status: 'active'
  });

  // Return null if no goal found (this is an expected state)
  res.json(goal || null);
});

// @desc    Update weight goal status
// @route   PUT /api/weight/goal/:id
// @access  Private
const updateGoalStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const goal = await WeightGoal.findOneAndUpdate(
    { _id: req.params.id, user: new mongoose.Types.ObjectId(req.user._id) },
    { status },
    { new: true }
  );

  if (!goal) {
    return res.status(404).json({ message: 'Weight goal not found' });
  }

  res.json(goal);
});

module.exports = {
  logWeight,
  getWeightEntries,
  getWeightStats,
  setWeightGoal,
  getWeightGoal,
  updateGoalStatus
}; 