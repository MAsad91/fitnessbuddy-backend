const mongoose = require('mongoose');

const hydrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, required: true },
  waterIntake: { type: Number, required: true }, // in liters
});

module.exports =  mongoose.model('Hydration', hydrationSchema);
