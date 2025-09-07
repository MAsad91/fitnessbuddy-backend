const mongoose = require('mongoose');

const FoodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  totals: {
    totalMacros: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
    },
    totalMicros: {
      type: Object,
      default: {}
    }
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

// Add index for querying by user and date (fixed field name)
FoodEntrySchema.index({ userId: 1, createdAt: 1 });

module.exports = mongoose.model('FoodEntry', FoodEntrySchema);