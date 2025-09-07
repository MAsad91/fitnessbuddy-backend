const mongoose = require('mongoose');

const exerciseRecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastUpdated: { type: Date, default: Date.now },
  
  // Muscle group balance analysis
  muscleGroupBalance: [{
    muscleGroup: String,
    volume: Number, // Total volume in last 30 days
    frequency: Number, // Number of workouts in last 30 days
    status: { 
      type: String, 
      enum: ['underworked', 'balanced', 'overworked'] 
    },
    recommendation: String
  }],

  // Exercise-specific recommendations
  exerciseRecommendations: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    type: { 
      type: String, 
      enum: [
        'progression', // When consistent progress is made
        'plateau', // When progress has stalled
        'deload', // When performance is declining
        'frequency', // When exercise frequency could be adjusted
        'volume', // When volume adjustments are needed
        'alternative' // Suggestion for alternative exercises
      ]
    },
    status: String, // Current status description
    suggestion: String, // Specific recommendation
    reason: String, // Explanation for the recommendation
    priority: { type: Number, min: 1, max: 5 }, // Priority level of the recommendation
    relatedMetrics: {
      recentVolume: Number,
      progressRate: Number, // % change over time
      lastPR: Date,
      frequency: Number // Times performed in last 30 days
    }
  }],

  // Progressive overload suggestions
  progressionStrategies: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    currentMax: {
      weight: Number,
      reps: Number
    },
    suggestedProgression: {
      weight: Number,
      reps: Number,
      sets: Number
    },
    approach: { 
      type: String,
      enum: [
        'weight_increase',
        'rep_increase',
        'set_increase',
        'tempo_change',
        'rest_reduction'
      ]
    },
    notes: String
  }],

  // Overall training insights
  trainingInsights: {
    weakPoints: [String],
    strongPoints: [String],
    balanceScore: Number, // 0-100 score for overall training balance
    volumeDistribution: {
      push: Number,
      pull: Number,
      legs: Number,
      core: Number
    },
    recoveryStatus: {
      type: String,
      enum: ['good', 'moderate', 'needs_attention']
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
exerciseRecommendationSchema.index({ userId: 1, lastUpdated: -1 });

module.exports = mongoose.model('ExerciseRecommendation', exerciseRecommendationSchema); 