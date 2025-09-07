const mongoose = require('mongoose');

const personalRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  records: {
    maxWeight: {
      value: Number,
      date: Date,
      workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutHistory' }
    },
    maxReps: {
      value: Number,
      date: Date,
      workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutHistory' }
    },
    maxVolume: { // weight * reps in a single set
      value: Number,
      date: Date,
      workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutHistory' }
    },
    maxVolumeWorkout: { // total volume in a workout
      value: Number,
      date: Date,
      workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutHistory' }
    }
  },
  // Track PR history for progression visualization
  history: [{
    type: {
      type: String,
      enum: ['maxWeight', 'maxReps', 'maxVolume', 'maxVolumeWorkout']
    },
    value: Number,
    previousValue: Number,
    improvement: Number, // percentage
    date: { type: Date, default: Date.now },
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutHistory' }
  }]
}, {
  timestamps: true
});

// Compound index for efficient querying
personalRecordSchema.index({ userId: 1, exerciseId: 1 });

module.exports = mongoose.model('PersonalRecord', personalRecordSchema); 