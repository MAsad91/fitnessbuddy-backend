const mongoose = require('mongoose')

const challengeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challengeName: { type: String, required: true },
  target: { type: Number, required: true },
  progress: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
});

module.exports =  mongoose.model('Challenge', challengeSchema);
