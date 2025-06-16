const mongoose = require('mongoose')

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  weight: { type: Number }, // in kg
  bodyFat: { type: Number }, // in percentage
  muscleMass: { type: Number }, // in kg
  measurements: {
    chest: { type: Number },
    waist: { type: Number },
    hips: { type: Number },
    arms: { type: Number },
  },
});

module.exports =  mongoose.model('Progress', progressSchema);
