const mongoose = require('mongoose');

const workoutHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedAt: { type: Date, default: Date.now },
  originalWorkoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  duration: { type: Number }, // in minutes
  exercises: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    name: String, // Store the name at the time of completion
    sets: [{
      reps: Number,
      weight: Number,
      completed: Boolean
    }],
    notes: String
  }],
  totalVolume: { type: Number }, // Total weight × reps across all exercises
  caloriesBurned: { type: Number },
  rating: { type: Number, min: 1, max: 5 }, // User's rating of the workout
  mood: { type: String }, // How user felt during/after workout
  notes: { type: String } // Any additional notes about the workout
}, {
  timestamps: true
});

// Index for efficient querying
workoutHistorySchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('WorkoutHistory', workoutHistorySchema); 