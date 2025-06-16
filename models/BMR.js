const mongoose = require('mongoose')

const bmrSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  weight: { type: Number, required: true }, // in kg
  height: { type: Number, required: true }, // in cm
  age: { type: Number, required: true },
  gender: { type: String, required: true }, // 'male' or 'female'
  activityLevel: { type: String, required: true }, // activity level for TDEE calculation
  bmr: { type: Number, required: true },
  tdee: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

// Add index for efficient querying
bmrSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('BMR', bmrSchema);
