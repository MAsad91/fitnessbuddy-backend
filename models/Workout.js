const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  exercises: [{
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    sets: [{
      reps: Number,
      weight: Number,
      completed: { type: Boolean, default: false }
    }]
  }]
});

module.exports = mongoose.model('Workout', workoutSchema);
