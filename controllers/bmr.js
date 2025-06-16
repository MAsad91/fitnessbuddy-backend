const BMR = require('../models/BMR'); 

exports.calculateBMR = async (req, res) => {
  const { weight, height, age, gender } = req.body;
  
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5; // Harris-Benedict equation for male
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161; // Harris-Benedict equation for female
  }

  try {
    const bmrRecord = new BMR({ user: req.user._id, weight, height, age, gender, bmr, date: new Date() });
    await bmrRecord.save();
    res.status(201).json(bmrRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate BMR' });
  }
};

exports.getBMRLogs = async (req, res) => {
  try {
    const logs = await BMR.find({ user: req.user._id });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BMR logs' });
  }
};
