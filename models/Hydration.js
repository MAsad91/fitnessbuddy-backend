const mongoose = require('mongoose');

const hydrationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 1 // in ml
  },
  note: {
    type: String,
    default: '',
    maxLength: 500
  },
  createdAt: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  // Keep legacy field for backward compatibility
  waterIntake: { 
    type: Number // in liters (deprecated, use amount instead)
  },
});

// Index for efficient queries
hydrationSchema.index({ userId: 1, createdAt: -1 });

// Virtual to convert amount to liters for legacy compatibility
hydrationSchema.virtual('waterIntakeInLiters').get(function() {
  return this.amount / 1000;
});

// Pre-save middleware to ensure waterIntake is set for legacy compatibility
hydrationSchema.pre('save', function(next) {
  if (this.amount && !this.waterIntake) {
    this.waterIntake = this.amount / 1000;
  }
  next();
});

module.exports = mongoose.model('Hydration', hydrationSchema);
