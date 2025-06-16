const mongoose = require('mongoose');

const FoodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totals: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks']
  },
  analyzedFood: [{
    type: Object
  }],
  rawFood: [{
    type: Object
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for querying by user and date
FoodEntrySchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('FoodEntry', FoodEntrySchema);