const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  theme: {
    isDarkMode: {
      type: Boolean,
      default: false,
    },
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true,
    },
    waterReminders: {
      type: Boolean,
      default: true,
    },
    workoutReminders: {
      type: Boolean,
      default: true,
    },
    mealReminders: {
      type: Boolean,
      default: true,
    },
  },
  preferences: {
    useBiometrics: {
      type: Boolean,
      default: false,
    },
    useMetricSystem: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Create a unique compound index on userId
settingsSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Settings', settingsSchema); 