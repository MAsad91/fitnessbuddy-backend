const mongoose = require('mongoose');

function connectDB() {
  // Use environment variable or default to local MongoDB
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/calories-calculator';
  
  return mongoose.connect(mongoURI)
    .then(function() {
      console.log('MongoDB Connected to:', mongoURI);
    })
    .catch(function(err) {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}

module.exports = connectDB;