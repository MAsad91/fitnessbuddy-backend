const mongoose = require('mongoose');

const weightGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalType: {
    type: String,
    enum: ['lose', 'gain', 'maintain'],
    required: true
  },
  startWeight: {
    type: Number,
    required: true
  },
  targetWeight: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  weeklyGoal: {
    type: Number,
    required: true
  },
  milestones: [{
    weight: Number,
    date: Date,
    achieved: {
      type: Boolean,
      default: false
    }
  }],
  notes: String
}, {
  timestamps: true
});

// Add indexes
weightGoalSchema.index({ user: 1, status: 1 });

// Method to calculate progress
weightGoalSchema.methods.calculateProgress = function(currentWeight) {
  const totalChange = Math.abs(this.targetWeight - this.startWeight);
  const currentChange = Math.abs(currentWeight - this.startWeight);
  return Math.min(100, (currentChange / totalChange) * 100);
};

// Method to update milestone status
weightGoalSchema.methods.updateMilestones = function(currentWeight) {
  this.milestones.forEach(milestone => {
    if (!milestone.achieved) {
      if (this.goalType === 'lose' && currentWeight <= milestone.weight) {
        milestone.achieved = true;
      } else if (this.goalType === 'gain' && currentWeight >= milestone.weight) {
        milestone.achieved = true;
      }
    }
  });
};

const WeightGoal = mongoose.model('WeightGoal', weightGoalSchema);

module.exports = WeightGoal; 