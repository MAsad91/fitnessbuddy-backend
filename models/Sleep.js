const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true }, // in hours
  quality: { type: String }, // e.g., "good", "poor", "average"
});

module.exports = mongoose.model('Sleep', sleepSchema);
