const Challenge = require('../models/Challenge');

exports.createChallenge = async (req, res) => {
  try {
    const challenge = new Challenge({ ...req.body, user: req.user._id });
    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create challenge' });
  }
};

exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ user: req.user._id });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
};
