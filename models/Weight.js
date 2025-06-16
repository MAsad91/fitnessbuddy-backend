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
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number,
    neck: Number
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
        entries: { $sum: 1 }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : null;
};

const Weight = mongoose.model('Weight', weightSchema);

module.exports = Weight;
