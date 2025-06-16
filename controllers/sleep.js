const Sleep = require('../models/Sleep'); 

exports.logSleep = async (req, res) => {
  try {
    const sleep = new Sleep({ ...req.body, user: req.user._id });
    await sleep.save();
    res.status(201).json(sleep);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log sleep' });
  }
};

exports.getSleepLogs = async (req, res) => {
  try {
    const logs = await Sleep.find({ user: req.user._id });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sleep logs' });
  }
};
