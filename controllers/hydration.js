const Hydration = require('../models/Hydration'); 
const Jwt = require('jsonwebtoken');

exports.logHydration = async (req, res) => {
  try {
    console.log('Logging hydration:', req.body);
    const { amount, createdAt } = req.body;
    const decode = Jwt.verify(req.headers.token, process.env.JWT_SECRET);
    const hydration = new Hydration({ waterIntake: amount, createdAt, userId: decode.id });
    await hydration.save();
    res.status(201).json(hydration);
  } catch (error) {
    console.error('Error logging hydration:', error);
    res.status(500).json({ error: 'Failed to log hydration' });
  }
};

exports.getHydrationLogs = async (req, res) => {
  try {
    const decode = Jwt.verify(req.headers.token, process.env.JWT_SECRET);
    const logs = await Hydration.find({ userId: decode.id });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hydration logs' });
  }
};
