const FoodEntry = require('../models/FoodEntry');
const moment = require('moment');
const Hydration = require('../models/Hydration');
const User = require('../models/User');

exports.todayCalories = async (req, res) => { console.log(req.user);
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();

        const todaysFood = await FoodEntry.find({
            userId: req.user._id,
            createdAt: {
                $gte: todayStart,
                $lte: todayEnd
            }
        });

        const totals = todaysFood.reduce((acc, entry) => {
            acc.totalCalories += entry.totals?.calories || 0;
            acc.totalProtein += entry.totals?.protein || 0;
            acc.totalCarbs += entry.totals?.carbs || 0;
            acc.totalFats += entry.totals?.fats || 0;
            return acc;
        }, {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFats: 0
        });

        // Calculate macro percentages based on user's goals
        const macroPercentages = {
            protein: (totals.totalProtein * 4 / user.dailyCalorieGoal) * 100,
            carbs: (totals.totalCarbs * 4 / user.dailyCalorieGoal) * 100,
            fats: (totals.totalFats * 9 / user.dailyCalorieGoal) * 100
        };

        res.status(200).json({
            success: true,
            data: {
                ...totals,
                dailyCaloriesGoal: user.dailyCalorieGoal,
                macroGoals: user.macroGoals,
                macroPercentages,
                todaysFood
            }
        });
    } catch (err) {
        console.error('Error fetching today\'s calories:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch today\'s calories',
            error: err.message
        });
    }
};

exports.weeklyCalories = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const endDate = moment().endOf('day');
        const startDate = moment().subtract(6, 'days').startOf('day');

        const weeklyFood = await FoodEntry.find({
            userId: req.user._id,
            createdAt: {
                $gte: startDate.toDate(),
                $lte: endDate.toDate(),
            },
        });

        const weeklyData = {
            labels: [],
            data: [],
        };

        for (let i = 0; i < 7; i++) {
            const currentDate = moment(startDate).add(i, 'days');
            const dayFood = weeklyFood.filter((entry) => 
                moment(entry.createdAt).isSame(currentDate, 'day')
            );
            
            const dayTotals = dayFood.reduce((acc, entry) => {
                if (entry.totals) {
                    acc.calories += entry.totals.calories || 0;
                }
                return acc;
            }, { calories: 0 });

            weeklyData.labels.push(currentDate.format('ddd'));
            weeklyData.data.push(Math.round(dayTotals.calories));
        }

        res.status(200).json({
            success: true,
            data: weeklyData
        });
    } catch (error) {
        console.error('Error retrieving weekly calories:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to retrieve weekly calories',
            error: error.message 
        });
    }
};

exports.todayWaterIntake = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();

        const todaysWater = await Hydration.find({
            userId: req.user._id,
            createdAt: {
                $gte: todayStart,
                $lte: todayEnd
            }
        });

        const totalWater = todaysWater.reduce((sum, entry) =>
            sum + (entry.waterIntake || 0), 0
        );

        res.status(200).json({
            success: true,
            data: {
                totalWater: Math.round(totalWater),
                dailyWaterGoal: user.dailyWaterGoal,
                percentage: Math.round((totalWater / user.dailyWaterGoal) * 100)
            }
        });
    } catch (err) {
        console.error('Error fetching today\'s water intake:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch today\'s water intake',
            error: err.message
        });
    }
};

exports.getDashboardGoals = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // For now, return basic goal information
        // This can be expanded to include actual goal data from a Goals model
        const dashboardGoals = {
            calories: {
                current: 0, // This would be calculated from today's food entries
                goal: user.dailyCalorieGoal || 2000,
                percentage: 0
            },
            water: {
                current: 0, // This would be calculated from today's hydration entries
                goal: user.dailyWaterGoal || 2000,
                percentage: 0
            },
            weight: {
                current: user.currentWeight || 0,
                goal: user.weightGoal || 0,
                percentage: 0
            }
        };

        res.status(200).json({
            success: true,
            data: dashboardGoals
        });
    } catch (err) {
        console.error('Error fetching dashboard goals:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard goals',
            error: err.message
        });
    }
};
