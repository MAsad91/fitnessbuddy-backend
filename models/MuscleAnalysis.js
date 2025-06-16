const mongoose = require('mongoose');

const muscleAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastUpdated: { type: Date, default: Date.now },
  
  // Analysis by muscle group
  muscleGroups: [{
    name: String,
    category: { 
      type: String, 
      enum: ['push', 'pull', 'legs', 'core'] 
    },
    metrics: {
      weeklyVolume: Number,
      monthlyVolume: Number,
      weeklyFrequency: Number,
      monthlyFrequency: Number,
      averageIntensity: Number, // Average weight relative to user's body weight
      volumeProgression: Number, // Percentage change in volume over time
      strengthProgression: Number, // Percentage change in average weight used
    },
    fatigue: {
      current: { 
        type: String,
        enum: ['low', 'moderate', 'high']
      },
      risk: { 
        type: String,
        enum: ['low', 'moderate', 'high']
      }
    },
    // Track synergist and antagonist balance
    muscleBalance: {
      synergists: [{
        muscle: String,
        ratio: Number // Volume ratio compared to primary muscle
      }],
      antagonists: [{
        muscle: String,
        ratio: Number // Volume ratio compared to primary muscle
      }]
    },
    // Recent PRs in exercises targeting this muscle
    recentPRs: [{
      exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
      type: String,
      value: Number,
      date: Date
    }],
    // Recovery and training readiness
    recovery: {
      status: { 
        type: String,
        enum: ['ready', 'caution', 'needs_rest']
      },
      lastTrained: Date,
      suggestedRestDays: Number
    }
  }],

  // Muscle development focus areas
  focusAreas: [{
    muscleGroup: String,
    priority: { type: Number, min: 1, max: 5 },
    reason: String,
    suggestedExercises: [{
      exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
      reason: String
    }]
  }],

  // Muscle group correlations
  correlations: [{
    muscleGroup1: String,
    muscleGroup2: String,
    correlationType: {
      type: String,
      enum: ['synergist', 'antagonist', 'independent']
    },
    balanceRatio: Number, // Actual ratio between muscle groups
    idealRatio: Number, // Target ratio for optimal balance
    recommendation: String
  }],

  // Overall muscle development insights
  developmentInsights: {
    // Muscle size potential based on genetics and training age
    potentialAnalysis: [{
      muscleGroup: String,
      currentDevelopment: { type: Number, min: 0, max: 100 }, // Estimated development percentage
      potentialRemaining: { type: Number, min: 0, max: 100 }, // Estimated room for growth
      limitingFactors: [String]
    }],
    // Symmetry analysis
    symmetry: {
      overallScore: { type: Number, min: 0, max: 100 },
      imbalances: [{
        description: String,
        severity: { type: Number, min: 1, max: 5 },
        correctionPlan: String
      }]
    },
    // Long-term progression tracking
    progressionTrends: [{
      muscleGroup: String,
      timeFrame: String, // e.g., '3_months', '6_months', '1_year'
      volumeChange: Number, // Percentage
      strengthChange: Number, // Percentage
      trend: {
        type: String,
        enum: ['improving', 'maintaining', 'declining']
      }
    }]
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
muscleAnalysisSchema.index({ userId: 1, lastUpdated: -1 });
muscleAnalysisSchema.index({ 'muscleGroups.name': 1, userId: 1 });

module.exports = mongoose.model('MuscleAnalysis', muscleAnalysisSchema); 