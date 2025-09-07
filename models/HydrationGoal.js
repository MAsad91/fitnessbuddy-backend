const mongoose = require('mongoose');

const hydrationGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 500,
    max: 5000,
    default: 2000 // ml
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reminders: {
    type: Boolean,
    default: true
  },
  achievedDays: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
hydrationGoalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update the updatedAt field before updating
hydrationGoalSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

const HydrationGoal = mongoose.model('HydrationGoal', hydrationGoalSchema);

module.exports = HydrationGoal; 