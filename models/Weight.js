const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  note: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPrimaryEntry: {
    type: Boolean,
    default: true
  },
  // Body Composition Fields
  bodyFat: {
    type: Number,
    min: 0,
    max: 100
  },
  muscleMass: {
    type: Number,
    min: 0
  },
  // Body Measurements
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number,
    neck: Number,
    shoulders: Number,
    forearms: Number,
    calves: Number
  }
}, {
  timestamps: true
});

// Index for efficient querying
weightSchema.index({ user: 1, date: -1 });

// Add methods to calculate stats
weightSchema.statics.getStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), isPrimaryEntry: true } },
    {
      $group: {
        _id: null,
        current: { $first: "$weight" },
        start: { $last: "$weight" },
        min: { $min: "$weight" },
        max: { $max: "$weight" },
        average: { $avg: "$weight" },
        entries: { $sum: 1 },
        // Body composition stats
        currentBodyFat: { $first: "$bodyFat" },
        startBodyFat: { $last: "$bodyFat" },
        currentMuscleMass: { $first: "$muscleMass" },
        startMuscleMass: { $last: "$muscleMass" },
        // Measurements stats
        currentMeasurements: { $first: "$measurements" },
        startMeasurements: { $last: "$measurements" }
      }
    }
  ]);

  if (stats.length === 0) {
    return null;
  }

  const result = stats[0];
  
  // Calculate changes
  result.totalChange = result.current - result.start;
  result.changeRate = result.entries > 1 ? result.totalChange / (result.entries - 1) : 0;
  
  // Body composition changes
  if (result.currentBodyFat && result.startBodyFat) {
    result.bodyFat = {
      current: result.currentBodyFat,
      change: result.currentBodyFat - result.startBodyFat
    };
  }
  
  if (result.currentMuscleMass && result.startMuscleMass) {
    result.muscleMass = {
      current: result.currentMuscleMass,
      change: result.currentMuscleMass - result.startMuscleMass
    };
  }
  
  // Measurements changes
  if (result.currentMeasurements && result.startMeasurements) {
    result.measurements = {};
    Object.keys(result.currentMeasurements).forEach(key => {
      if (result.currentMeasurements[key] && result.startMeasurements[key]) {
        result.measurements[key] = {
          current: result.currentMeasurements[key],
          change: result.currentMeasurements[key] - result.startMeasurements[key]
        };
      }
    });
  }

  return result;
};

const Weight = mongoose.model('Weight', weightSchema);

module.exports = Weight;
