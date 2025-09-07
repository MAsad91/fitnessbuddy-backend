const Calendar = require('../models/Calendar');

exports.createEvent = async (req, res) => {
  try {
    const event = new Calendar({ ...req.body, user: req.user._id });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Calendar.find({ user: req.user._id });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};
