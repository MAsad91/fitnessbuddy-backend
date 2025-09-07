const Sleep = require('../models/Sleep');
const moment = require('moment');

// Helper function to calculate sleep duration
const calculateDuration = (bedtime, wakeTime) => {
  const bedMoment = moment(bedtime);
  const wakeMoment = moment(wakeTime);
  
  // If wake time is earlier than bedtime, assume it's the next day
  if (wakeMoment.isBefore(bedMoment)) {
    wakeMoment.add(1, 'day');
  }
  
  return wakeMoment.diff(bedMoment, 'hours', true);
};

// Helper function to calculate sleep efficiency
const calculateSleepEfficiency = (duration, timeInBed) => {
  return timeInBed > 0 ? Math.round((duration / timeInBed) * 100) : 0;
};

// Log sleep entry
exports.logSleep = async (req, res) => {
  try {
    console.log('Logging sleep entry:', req.body);
    const {
      bedtime,
      wakeTime,
      quality,
      notes,
      mood,
      stressLevel,
      caffeineIntake,
      alcoholIntake,
      exerciseBefore,
      screenTimeBefore,
      environment
    } = req.body;

    // Validate required fields
    if (!bedtime || !wakeTime) {
      return res.status(400).json({
        success: false,
        message: 'Bedtime and wake time are required'
      });
    }

    // Calculate duration
    const duration = calculateDuration(bedtime, wakeTime);
    
    if (duration <= 0 || duration > 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sleep duration'
      });
    }

    // Calculate sleep efficiency (assuming time in bed equals duration for now)
    const efficiency = calculateSleepEfficiency(duration, duration);

    const sleepEntry = new Sleep({
      userId: req.user._id,
      bedtime: new Date(bedtime),
      wakeTime: new Date(wakeTime),
      duration,
      quality: quality || 3,
      notes: notes || '',
      mood: mood || 'neutral',
      stressLevel: stressLevel || 3,
      caffeineIntake: caffeineIntake || 0,
      alcoholIntake: alcoholIntake || 0,
      exerciseBefore: exerciseBefore || false,
      screenTimeBefore: screenTimeBefore || 0,
      environment: environment || {},
      efficiency,
      createdAt: new Date()
    });

    await sleepEntry.save();
    console.log('✅ Sleep entry logged successfully:', sleepEntry);

    res.status(201).json({
      success: true,
      message: 'Sleep entry logged successfully',
      data: sleepEntry
    });
  } catch (error) {
    console.error('Error logging sleep entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log sleep entry',
      error: error.message
    });
  }
};

// Get sleep logs with filtering
exports.getSleepLogs = async (req, res) => {
  try {
    console.log('Fetching sleep logs for user:', req.user._id);
    const { period = 'month', limit = 30, page = 1 } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: startOfWeek } };
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: startOfMonth } };
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = { createdAt: { $gte: startOfYear } };
        break;
      default:
        // No date filter for 'all'
        break;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await Sleep.find({
      userId: req.user._id,
      ...dateFilter
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
    
    const total = await Sleep.countDocuments({
      userId: req.user._id,
      ...dateFilter
    });
    
    console.log('✅ Sleep logs fetched successfully:', logs.length, 'logs');
    
    res.json({
      success: true,
      message: 'Sleep logs retrieved successfully',
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sleep logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sleep logs',
      error: error.message
    });
  }
};

// Update sleep entry
exports.updateSleepEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    console.log('Updating sleep entry:', { id, updateData });
    
    // Recalculate duration if bedtime or wakeTime changed
    if (updateData.bedtime || updateData.wakeTime) {
      const existingEntry = await Sleep.findById(id);
      if (!existingEntry) {
        return res.status(404).json({
          success: false,
          message: 'Sleep entry not found'
        });
      }
      
      const bedtime = updateData.bedtime || existingEntry.bedtime;
      const wakeTime = updateData.wakeTime || existingEntry.wakeTime;
      updateData.duration = calculateDuration(bedtime, wakeTime);
      updateData.efficiency = calculateSleepEfficiency(updateData.duration, updateData.duration);
    }
    
    const sleepEntry = await Sleep.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true }
    );
    
    if (!sleepEntry) {
      return res.status(404).json({
        success: false,
        message: 'Sleep entry not found'
      });
    }
    
    console.log('✅ Sleep entry updated successfully:', sleepEntry);
    
    res.json({
      success: true,
      message: 'Sleep entry updated successfully',
      data: sleepEntry
    });
  } catch (error) {
    console.error('Error updating sleep entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sleep entry',
      error: error.message
    });
  }
};

// Delete sleep entry
exports.deleteSleepEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting sleep entry:', id);
    
    const sleepEntry = await Sleep.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });
    
    if (!sleepEntry) {
      return res.status(404).json({
        success: false,
        message: 'Sleep entry not found'
      });
    }
    
    console.log('✅ Sleep entry deleted successfully');
    
    res.json({
      success: true,
      message: 'Sleep entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sleep entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sleep entry',
      error: error.message
    });
  }
};

// Get sleep statistics
exports.getSleepStats = async (req, res) => {
  try {
    console.log('Fetching sleep stats for user:', req.user._id);
    const { period = 'month' } = req.query;
    
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
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const entries = await Sleep.find({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });
    
    if (entries.length === 0) {
      return res.json({
        success: true,
        message: 'Sleep statistics retrieved successfully',
        data: {
          averageDuration: 0,
          averageQuality: 0,
          consistencyScore: 0,
          totalSleep: 0,
          bestDuration: 0,
          worstDuration: 0,
          bedtimeConsistency: 0,
          wakeTimeConsistency: 0,
        }
      });
    }
    
    // Calculate statistics
    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
    const averageDuration = totalDuration / entries.length;
    
    const totalQuality = entries.reduce((sum, entry) => sum + entry.quality, 0);
    const averageQuality = totalQuality / entries.length;
    
    const durations = entries.map(entry => entry.duration).sort((a, b) => a - b);
    const bestDuration = durations[durations.length - 1];
    const worstDuration = durations[0];
    
    // Calculate bedtime and wake time consistency
    const bedtimes = entries.map(entry => {
      const time = moment(entry.bedtime);
      return time.hours() + time.minutes() / 60;
    });
    
    const wakeTimes = entries.map(entry => {
      const time = moment(entry.wakeTime);
      return time.hours() + time.minutes() / 60;
    });
    
    const bedtimeVariance = bedtimes.reduce((sum, time) => {
      const avg = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
      return sum + Math.pow(time - avg, 2);
    }, 0) / bedtimes.length;
    
    const wakeTimeVariance = wakeTimes.reduce((sum, time) => {
      const avg = wakeTimes.reduce((a, b) => a + b, 0) / wakeTimes.length;
      return sum + Math.pow(time - avg, 2);
    }, 0) / wakeTimes.length;
    
    // Convert variance to consistency score (lower variance = higher consistency)
    const bedtimeConsistency = Math.max(0, 100 - Math.sqrt(bedtimeVariance) * 10);
    const wakeTimeConsistency = Math.max(0, 100 - Math.sqrt(wakeTimeVariance) * 10);
    const consistencyScore = Math.round((bedtimeConsistency + wakeTimeConsistency) / 2);
    
    const stats = {
      averageDuration: Math.round(averageDuration * 100) / 100,
      averageQuality: Math.round(averageQuality * 100) / 100,
      consistencyScore,
      totalSleep: Math.round(totalDuration * 100) / 100,
      bestDuration: Math.round(bestDuration * 100) / 100,
      worstDuration: Math.round(worstDuration * 100) / 100,
      bedtimeConsistency: Math.round(bedtimeConsistency),
      wakeTimeConsistency: Math.round(wakeTimeConsistency),
    };
    
    console.log('✅ Sleep stats calculated successfully:', stats);
    
    res.json({
      success: true,
      message: 'Sleep statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching sleep stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sleep statistics',
      error: error.message
    });
  }
};

// Get sleep analysis
exports.getSleepAnalysis = async (req, res) => {
  try {
    console.log('Fetching sleep analysis for user:', req.user._id);
    
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const entries = await Sleep.find({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });
    
    if (entries.length === 0) {
      return res.json({
        success: true,
        message: 'Sleep analysis retrieved successfully',
        data: {
          sleepDebt: 0,
          optimalBedtime: '10:00 PM',
          optimalWakeTime: '6:00 AM',
          sleepEfficiency: 0,
          recommendation: 'Start tracking your sleep to get personalized insights'
        }
      });
    }
    
    // Calculate sleep debt (assuming 8 hours is ideal)
    const idealSleep = 8;
    const recentEntries = entries.slice(0, 7); // Last 7 days
    const avgRecentSleep = recentEntries.reduce((sum, entry) => sum + entry.duration, 0) / recentEntries.length;
    const sleepDebt = Math.max(0, (idealSleep - avgRecentSleep) * 7);
    
    // Calculate optimal bedtime and wake time based on patterns
    const bedtimes = entries.map(entry => moment(entry.bedtime));
    const wakeTimes = entries.map(entry => moment(entry.wakeTime));
    
    const avgBedtime = bedtimes.reduce((sum, time) => {
      return sum + (time.hours() + time.minutes() / 60);
    }, 0) / bedtimes.length;
    
    const avgWakeTime = wakeTimes.reduce((sum, time) => {
      return sum + (time.hours() + time.minutes() / 60);
    }, 0) / wakeTimes.length;
    
    const optimalBedtime = moment().startOf('day').add(avgBedtime, 'hours').format('h:mm A');
    const optimalWakeTime = moment().startOf('day').add(avgWakeTime, 'hours').format('h:mm A');
    
    // Calculate average sleep efficiency
    const avgEfficiency = entries.reduce((sum, entry) => sum + (entry.efficiency || 85), 0) / entries.length;
    
    // Generate recommendation
    let recommendation = '';
    if (avgRecentSleep < 6) {
      recommendation = 'Try to get more sleep. Aim for 7-9 hours per night.';
    } else if (avgRecentSleep > 9) {
      recommendation = 'You might be sleeping too much. Try reducing sleep time gradually.';
    } else if (avgEfficiency < 85) {
      recommendation = 'Focus on improving sleep quality through better sleep hygiene.';
    } else {
      recommendation = 'Your sleep patterns look good! Keep maintaining consistency.';
    }
    
    const analysis = {
      sleepDebt: Math.round(sleepDebt * 100) / 100,
      optimalBedtime,
      optimalWakeTime,
      sleepEfficiency: Math.round(avgEfficiency),
      recommendation
    };
    
    console.log('✅ Sleep analysis calculated successfully:', analysis);
    
    res.json({
      success: true,
      message: 'Sleep analysis retrieved successfully',
      data: analysis
    });
  } catch (error) {
    console.error('Error fetching sleep analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sleep analysis',
      error: error.message
    });
  }
};

// Get sleep trends
exports.getSleepTrends = async (req, res) => {
  try {
    console.log('Fetching sleep trends for user:', req.user._id);
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    let groupBy;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = 'day';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupBy = 'month';
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
    }
    
    const entries = await Sleep.find({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });
    
    // Prepare trend data
    const weeklyData = [];
    const monthlyData = [];
    const qualityTrend = [];
    const durationTrend = [];
    
    // Group entries by day/month
    const groupedEntries = {};
    entries.forEach(entry => {
      const key = groupBy === 'day' 
        ? moment(entry.createdAt).format('YYYY-MM-DD')
        : moment(entry.createdAt).format('YYYY-MM');
      
      if (!groupedEntries[key]) {
        groupedEntries[key] = [];
      }
      groupedEntries[key].push(entry);
    });
    
    // Calculate averages for each group
    Object.keys(groupedEntries).forEach(key => {
      const groupEntries = groupedEntries[key];
      const avgDuration = groupEntries.reduce((sum, entry) => sum + entry.duration, 0) / groupEntries.length;
      const avgQuality = groupEntries.reduce((sum, entry) => sum + entry.quality, 0) / groupEntries.length;
      
      const dataPoint = {
        date: key,
        duration: Math.round(avgDuration * 100) / 100,
        quality: Math.round(avgQuality * 100) / 100
      };
      
      if (groupBy === 'day') {
        weeklyData.push(dataPoint);
        durationTrend.push(dataPoint);
        qualityTrend.push(dataPoint);
      } else {
        monthlyData.push(dataPoint);
      }
    });
    
    const trends = {
      weeklyData,
      monthlyData,
      qualityTrend,
      durationTrend
    };
    
    console.log('✅ Sleep trends calculated successfully');
    
    res.json({
      success: true,
      message: 'Sleep trends retrieved successfully',
      data: trends
    });
  } catch (error) {
    console.error('Error fetching sleep trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sleep trends',
      error: error.message
    });
  }
};

// Get sleep recommendations
exports.getSleepRecommendations = async (req, res) => {
  try {
    console.log('Fetching sleep recommendations for user:', req.user._id);
    
    const now = new Date();
    const startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const entries = await Sleep.find({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });
    
    const recommendations = [];
    
    if (entries.length === 0) {
      recommendations.push({
        type: 'general',
        priority: 'high',
        text: 'Start tracking your sleep to get personalized recommendations'
      });
    } else {
      const avgDuration = entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length;
      const avgQuality = entries.reduce((sum, entry) => sum + entry.quality, 0) / entries.length;
      
      // Duration-based recommendations
      if (avgDuration < 6) {
        recommendations.push({
          type: 'duration',
          priority: 'high',
          text: 'You\'re getting less than 6 hours of sleep. Aim for 7-9 hours for optimal health.'
        });
      } else if (avgDuration > 9) {
        recommendations.push({
          type: 'duration',
          priority: 'medium',
          text: 'You might be oversleeping. Try reducing sleep time gradually to 7-9 hours.'
        });
      }
      
      // Quality-based recommendations
      if (avgQuality < 3) {
        recommendations.push({
          type: 'quality',
          priority: 'high',
          text: 'Your sleep quality is low. Try creating a better sleep environment and routine.'
        });
      }
      
      // Consistency recommendations
      const bedtimes = entries.map(entry => moment(entry.bedtime).hours());
      const bedtimeVariance = bedtimes.reduce((sum, time) => {
        const avg = bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;
        return sum + Math.pow(time - avg, 2);
      }, 0) / bedtimes.length;
      
      if (Math.sqrt(bedtimeVariance) > 2) {
        recommendations.push({
          type: 'consistency',
          priority: 'medium',
          text: 'Your bedtime varies significantly. Try going to bed at the same time each night.'
        });
      }
      
      // Lifestyle recommendations
      const caffeineEntries = entries.filter(entry => entry.caffeineIntake > 0);
      if (caffeineEntries.length > entries.length * 0.5) {
        recommendations.push({
          type: 'lifestyle',
          priority: 'low',
          text: 'Consider reducing caffeine intake, especially in the afternoon and evening.'
        });
      }
      
      const screenTimeEntries = entries.filter(entry => entry.screenTimeBefore > 60);
      if (screenTimeEntries.length > entries.length * 0.3) {
        recommendations.push({
          type: 'lifestyle',
          priority: 'medium',
          text: 'Try to limit screen time before bed to improve sleep quality.'
        });
      }
      
      // If no issues, provide positive reinforcement
      if (recommendations.length === 0) {
        recommendations.push({
          type: 'positive',
          priority: 'low',
          text: 'Great job! Your sleep patterns are looking healthy. Keep it up!'
        });
      }
    }
    
    // Add general tips
    recommendations.push(
      {
        type: 'tip',
        priority: 'low',
        text: 'Keep your bedroom cool, dark, and quiet for better sleep.'
      },
      {
        type: 'tip',
        priority: 'low',
        text: 'Establish a relaxing bedtime routine to signal your body it\'s time to sleep.'
      },
      {
        type: 'tip',
        priority: 'low',
        text: 'Avoid large meals, caffeine, and alcohol before bedtime.'
      }
    );
    
    console.log('✅ Sleep recommendations generated successfully:', recommendations.length);
    
    res.json({
      success: true,
      message: 'Sleep recommendations retrieved successfully',
      data: recommendations
    });
  } catch (error) {
    console.error('Error fetching sleep recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sleep recommendations',
      error: error.message
    });
  }
};
