const Hydration = require('../models/Hydration');
const HydrationGoal = require('../models/HydrationGoal');

// Log water intake
exports.logHydration = async (req, res) => {
  try {
    console.log('Logging hydration:', req.body);
    const { amount, timestamp, note } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }
    
    // Ensure createdAt is properly set
    const createdAt = timestamp ? new Date(timestamp) : new Date();
    
    const hydration = new Hydration({ 
      amount: amount, // Store in ml
      note: note || '',
      createdAt: createdAt, 
      userId: req.user._id 
    });
    
    await hydration.save();
    console.log('✅ Hydration logged successfully:', hydration);
    
    res.status(201).json({
      success: true,
      message: 'Water intake logged successfully',
      data: hydration
    });
  } catch (error) {
    console.error('Error logging hydration:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to log hydration',
      error: error.message 
    });
  }
};

// Get hydration logs with filtering
exports.getHydrationLogs = async (req, res) => {
  try {
    console.log('Fetching hydration logs for user:', req.user._id);
    const { period = 'today', limit = 50, page = 1 } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: startOfDay, $lt: endOfDay } };
        break;
      case 'week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = { createdAt: { $gte: startOfWeek } };
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: startOfMonth } };
        break;
      default:
        // No date filter for 'all'
        break;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await Hydration.find({ 
      userId: req.user._id,
      ...dateFilter
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
    
    const total = await Hydration.countDocuments({ 
      userId: req.user._id,
      ...dateFilter
    });
    
    console.log('✅ Hydration logs fetched successfully:', logs.length, 'logs');
    
    res.json({
      success: true,
      message: 'Hydration logs retrieved successfully',
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching hydration logs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch hydration logs',
      error: error.message 
    });
  }
};

// Update hydration entry
exports.updateHydrationEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, note, timestamp } = req.body;
    
    console.log('Updating hydration entry:', { id, amount, note, timestamp });
    
    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }
    
    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (note !== undefined) updateData.note = note;
    if (timestamp) updateData.createdAt = new Date(timestamp);
    
    const hydration = await Hydration.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true }
    );
    
    if (!hydration) {
      return res.status(404).json({
        success: false,
        message: 'Hydration entry not found'
      });
    }
    
    console.log('✅ Hydration entry updated successfully:', hydration);
    
    res.json({
      success: true,
      message: 'Hydration entry updated successfully',
      data: hydration
    });
  } catch (error) {
    console.error('Error updating hydration entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hydration entry',
      error: error.message
    });
  }
};

// Delete hydration entry
exports.deleteHydrationEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting hydration entry:', id);
    
    const hydration = await Hydration.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });
    
    if (!hydration) {
      return res.status(404).json({
        success: false,
        message: 'Hydration entry not found'
      });
    }
    
    console.log('✅ Hydration entry deleted successfully');
    
    res.json({
      success: true,
      message: 'Hydration entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hydration entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hydration entry',
      error: error.message
    });
  }
};

// Get hydration statistics
exports.getHydrationStats = async (req, res) => {
  try {
    console.log('Fetching hydration stats for user:', req.user._id);
    const { period = 'week' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Get user's hydration goal
    const goal = await HydrationGoal.findOne({ userId: req.user._id });
    const dailyGoal = goal?.amount || 2000;
    
    // Get today's intake
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    const todayEntries = await Hydration.find({
      userId: req.user._id,
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });
    
    const dailyProgress = todayEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    // Get period entries for calculations
    const periodEntries = await Hydration.find({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });
    
    // Calculate weekly average
    const weeklyData = {};
    periodEntries.forEach(entry => {
      const date = entry.createdAt.toDateString();
      weeklyData[date] = (weeklyData[date] || 0) + entry.amount;
    });
    
    const weeklyValues = Object.values(weeklyData);
    const weeklyAverage = weeklyValues.length > 0 
      ? Math.round(weeklyValues.reduce((sum, val) => sum + val, 0) / weeklyValues.length)
      : 0;
    
    // Calculate streak (consecutive days meeting goal)
    let streak = 0;
    const checkDate = new Date(now);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dayStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const dayEntries = await Hydration.find({
        userId: req.user._id,
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });
      
      const dayTotal = dayEntries.reduce((sum, entry) => sum + entry.amount, 0);
      
      if (dayTotal >= dailyGoal) {
        streak++;
      } else {
        break;
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Calculate monthly total
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEntries = await Hydration.find({
      userId: req.user._id,
      createdAt: { $gte: monthStart }
    });
    
    const monthlyTotal = monthlyEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    // Calculate achieved days
    const achievedDays = Object.values(weeklyData).filter(dayTotal => dayTotal >= dailyGoal).length;
    
    // Prepare chart data
    const chartData = {
      weeklyData: [],
      monthlyData: []
    };
    
    // Weekly chart data (last 7 days)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toDateString();
      chartData.weeklyData.push({
        date: date.toISOString().split('T')[0],
        amount: weeklyData[dateString] || 0
      });
    }
    
    const stats = {
      dailyProgress,
      weeklyAverage,
      streak,
      monthlyTotal,
      achievedDays: achievedDays
    };
    
    console.log('✅ Hydration stats calculated successfully:', stats);
    
    res.json({
      success: true,
      message: 'Hydration statistics retrieved successfully',
      data: {
        stats,
        charts: chartData
      }
    });
  } catch (error) {
    console.error('Error fetching hydration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hydration statistics',
      error: error.message
    });
  }
};

// Set or update daily goal
exports.setDailyGoal = async (req, res) => {
  try {
    console.log('Setting daily goal:', req.body);
    const { amount, isActive = true, reminders = true } = req.body;
    
    // Validate amount
    if (!amount || amount < 500 || amount > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Goal must be between 500ml and 5000ml'
      });
    }
    
    const goalData = {
      userId: req.user._id,
      amount,
      isActive,
      reminders,
      updatedAt: new Date()
    };
    
    const goal = await HydrationGoal.findOneAndUpdate(
      { userId: req.user._id },
      goalData,
      { upsert: true, new: true }
    );
    
    console.log('✅ Daily goal set successfully:', goal);
    
    res.json({
      success: true,
      message: 'Daily goal set successfully',
      data: goal
    });
  } catch (error) {
    console.error('Error setting daily goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set daily goal',
      error: error.message
    });
  }
};

// Get daily goal
exports.getDailyGoal = async (req, res) => {
  try {
    console.log('Fetching daily goal for user:', req.user._id);
    
    const goal = await HydrationGoal.findOne({ userId: req.user._id });
    
    // Return default goal if none exists
    const defaultGoal = {
      amount: 2000,
      isActive: true,
      reminders: true,
      achievedDays: 0
    };
    
    res.json({
      success: true,
      message: 'Daily goal retrieved successfully',
      data: goal || defaultGoal
    });
  } catch (error) {
    console.error('Error fetching daily goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily goal',
      error: error.message
    });
  }
};
