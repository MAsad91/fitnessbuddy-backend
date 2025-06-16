const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  // Basic exercise information
  name: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'Strength', 'Cardio', 'Flexibility'
  description: { type: String, default: '' },
  
  // Detailed muscle information
  primaryMuscles: [String], // Main muscles worked
  secondaryMuscles: [String], // Secondary muscles worked
  muscleGroup: { type: String, required: true }, // e.g., 'Chest', 'Back', 'Legs'
  
  // Exercise media
  demoImages: [String], // URLs to demonstration images
  demoVideos: [String], // URLs to demonstration videos
  thumbnailUrl: { type: String }, // Main display image

  // Exercise instructions
  instructions: [{
    step: Number,
    description: String,
    image: String // Optional image for each step
  }],

  // Form and safety
  formCues: [String], // Key points for proper form
  safetyTips: [String], // Safety considerations
  commonMistakes: [String], // Common form mistakes to avoid

  // Exercise properties
  type: { 
    type: String, 
    enum: ['isolation', 'compound'], 
    required: true 
  },
  equipment: [String], // Required equipment
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },

  // Meta information
  created: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Exercise', exerciseSchema);
