require('dotenv').config();
const mongoose = require('mongoose');
const seedExercises = require('./utils/seedExercises');

function connectDB() {
  mongoose.connect(process.env.MONGO_URI)
    .then(function() {
    console.log('MongoDB connected successfully');
    
    // Run the seeder
      return seedExercises();
    })
    .then(function() {
    // Disconnect after seeding
      return mongoose.disconnect();
    })
    .then(function() {
    console.log('Database seeded successfully!');
    process.exit(0);
    })
    .catch(function(error) {
    console.error('Error:', error);
    process.exit(1);
    });
  }

module.exports = connectDB;
