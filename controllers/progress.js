const Progress = require('../models/Progress');

exports.logProgress = async (req, res) => {
  try {
    const progress = new Progress({ ...req.body, user: req.user._id });
    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log progress' });
  }
};

exports.getProgressLogs = async (req, res) => {
  try {
    const logs = await Progress.find({ user: req.user._id });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress logs' });
  }
};
