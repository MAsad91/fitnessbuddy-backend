const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bedtime: { 
    type: Date, 
    required: true 
  },
  wakeTime: { 
    type: Date, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true,
    min: 0,
    max: 24 // in hours
  },
  quality: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5,
    default: 3 // 1-5 scale (1=poor, 5=excellent)
  },
  notes: {
    type: String,
    maxLength: 500,
    default: ''
  },
  mood: {
    type: String,
    enum: ['terrible', 'poor', 'neutral', 'good', 'excellent'],
    default: 'neutral'
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 5,
    default: 3 // 1=very low, 5=very high
  },
  // Lifestyle factors that can affect sleep
  caffeineIntake: {
    type: Number,
    default: 0,
    min: 0 // mg of caffeine consumed
  },
  alcoholIntake: {
    type: Number,
    default: 0,
    min: 0 // units of alcohol consumed
  },
  exerciseBefore: {
    type: Boolean,
    default: false // exercised within 4 hours of bedtime
  },
  screenTimeBefore: {
    type: Number,
    default: 0,
    min: 0 // minutes of screen time before bed
  },
  // Sleep environment
  environment: {
    temperature: {
      type: String,
      enum: ['too_cold', 'cold', 'comfortable', 'warm', 'too_warm'],
      default: 'comfortable'
    },
    noise: {
      type: String,
      enum: ['silent', 'quiet', 'moderate', 'noisy', 'very_noisy'],
      default: 'quiet'
    },
    light: {
      type: String,
      enum: ['dark', 'dim', 'moderate', 'bright', 'very_bright'],
      default: 'dark'
    }
  },
  // Sleep metrics
  efficiency: {
    type: Number,
    min: 0,
    max: 100,
    default: 85 // percentage of time in bed actually sleeping
  },
  timeToFallAsleep: {
    type: Number,
    min: 0,
    default: 15 // minutes to fall asleep
  },
  numberOfAwakenings: {
    type: Number,
    min: 0,
    default: 0 // number of times awakened during night
  },
  // Tracking metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Legacy fields for backward compatibility
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  date: { 
    type: Date
  }
});

// Index for efficient queries
sleepSchema.index({ userId: 1, createdAt: -1 });
sleepSchema.index({ userId: 1, bedtime: -1 });

// Virtual to get sleep date (bedtime date)
sleepSchema.virtual('sleepDate').get(function() {
  return this.bedtime ? new Date(this.bedtime.toDateString()) : null;
});

// Pre-save middleware for backward compatibility and validation
sleepSchema.pre('save', function(next) {
  // Update timestamp
  this.updatedAt = new Date();
  
  // Set legacy fields for backward compatibility
  if (this.userId && !this.user) {
    this.user = this.userId;
  }
  if (this.bedtime && !this.date) {
    this.date = this.bedtime;
  }
  
  // Validate duration makes sense
  if (this.bedtime && this.wakeTime) {
    const bedMoment = new Date(this.bedtime);
    const wakeMoment = new Date(this.wakeTime);
    
    // If wake time is earlier than bedtime, assume it's the next day
    if (wakeMoment < bedMoment) {
      wakeMoment.setDate(wakeMoment.getDate() + 1);
    }
    
    const calculatedDuration = (wakeMoment - bedMoment) / (1000 * 60 * 60);
    
    if (Math.abs(calculatedDuration - this.duration) > 0.1) {
      this.duration = Math.round(calculatedDuration * 100) / 100;
    }
  }
  
  next();
});

// Pre-update middleware
sleepSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Static method to get sleep insights
sleepSchema.statics.getSleepInsights = function(userId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        avgDuration: { $avg: '$duration' },
        avgQuality: { $avg: '$quality' },
        totalEntries: { $sum: 1 },
        avgEfficiency: { $avg: '$efficiency' },
        avgTimeToSleep: { $avg: '$timeToFallAsleep' }
      }
    }
  ]);
};

const Sleep = mongoose.model('Sleep', sleepSchema);

module.exports = Sleep;
