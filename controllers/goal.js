const Goal = require('../models/Goal');
const jwt = require('jsonwebtoken');

exports.createGoal = async (req, res) => {
  try { console.log(req.body);
    const goal = new Goal({ ...req.body });
    await goal.save();
    res.status(201).json({status: 'success', message: "Goal Added Successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

exports.getGoals = async (req, res) => {
  const userId = req.user.id;
  try {
    const goals = await Goal.find({ userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};
