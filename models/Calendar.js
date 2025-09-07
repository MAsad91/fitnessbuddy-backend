const mongoose = require('mongoose')

const calendarSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventTitle: { type: String, required: true },
  eventDate: { type: Date, required: true },
  description: { type: String },
});

module.exports =  mongoose.model('Calendar', calendarSchema);
