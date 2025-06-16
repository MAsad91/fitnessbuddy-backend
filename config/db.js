const mongoose = require('mongoose');

function connectDB() {
  return mongoose.connect(process.env.MONGO_URI)
    .then(function() {
    console.log('MongoDB Connected');
    })
    .catch(function(err) {
    console.error(err.message);
    process.exit(1);
    });
  }

module.exports = connectDB;