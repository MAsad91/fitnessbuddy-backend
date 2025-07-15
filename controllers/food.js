const FoodEntry = require('../models/FoodEntry');
const Jwt = require('jsonwebtoken');
const moment = require('moment');
const { analyzeFoodDescription, lookupBarcode, searchFoodSuggestions, getNutritionInfo } = require('../ThirdParty/nutritionixAPI');

exports.createFoodEntry = async (req, res) => {
  const { mealType, description } = req.body;
  const decode = Jwt.verify(req.headers.token, process.env.JWT_SECRET);

  try {
    if (mealType !== 'snacks') {
      const startOfDay = moment().startOf('day').toDate();
      const endOfDay = moment().endOf('day').toDate();

      const existingEntry = await FoodEntry.findOne({
        userId: req.user._id,
        mealType,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      if (existingEntry) {
        return res.status(400).json({ success: false, message: `Food entry already exists for ${mealType} today` });
      }
    }

    const foods = await analyzeFoodDescription(description);
    const analyzedFood = foods.map((food) => ({
      foodName: food.food_name,
      servingQty: food.serving_qty,
      servingUnit: food.serving_unit,
      calories: food.nf_calories,
      protein: food.nf_protein,
      carbs: food.nf_total_carbohydrate,
      fats: food.nf_total_fat,
    }));

    const totals = {
      calories: analyzedFood.reduce((sum, f) => sum + f.calories, 0),
      protein: analyzedFood.reduce((sum, f) => sum + f.protein, 0),
      carbs: analyzedFood.reduce((sum, f) => sum + f.carbs, 0),
      fats: analyzedFood.reduce((sum, f) => sum + f.fats, 0),
    };

    const entry = new FoodEntry({
      userId: decode.id,
      mealType,
      description,
      analyzedFood,
      rawFood: foods,
      totals,
      createdAt: moment().toDate(),
    });

    await entry.save();
    res.json(entry);
  } catch (err) {
    console.error('Error saving food entry:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTodayEntries = async (req, res) => {
  try {
    const todayStart = moment().startOf('day').toDate();
    const todayEnd = moment().endOf('day').toDate();

    const entries = await FoodEntry.find({
      userId: req.user._id,
      createdAt: { 
        $gte: todayStart,
        $lte: todayEnd 
      },
    });

    const meals = {
      breakfast: entries.filter((e) => e.mealType === 'breakfast'),
      lunch: entries.filter((e) => e.mealType === 'lunch'),
      dinner: entries.filter((e) => e.mealType === 'dinner'),
      snacks: entries.filter((e) => e.mealType === 'snacks'),
    };

    res.status(200).json({
      success: true,
      message: 'Today\'s food entries retrieved successfully',
      data: meals
    });
  } catch (err) {
    console.error('Error fetching today\'s food entries:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch today\'s food entries',
      error: err.message 
    });
  }
};

exports.getWeekEntries = async (req, res) => {
  try {
    const weekAgo = moment().subtract(7, 'days').startOf('day').toDate();

    const entries = await FoodEntry.find({
      userId: req.user.id,
      createdAt: { $gte: weekAgo },
    });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateFoodEntry = async (req, res) => {
  try {
    const entry = await FoodEntry.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    Object.assign(entry, req.body);
    await entry.save();

    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteFoodEntry = async (req, res) => {
  try {
    const entry = await FoodEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBarcodeInfo = async (req, res) => {
  try {
    const item = await lookupBarcode(req.params.code);

    if (item) {
      return res.json({
        name: item.food_name,
        brand: item.brand_name,
        calories: item.nf_calories,
        protein: item.nf_protein,
        carbs: item.nf_total_carbohydrate,
        fat: item.nf_total_fat,
        serving_size: item.serving_qty,
        serving_unit: item.serving_unit,
      });
    }

    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    res.status(500).json({ message: 'Error looking up product' });
  }
};

exports.searchFood = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const suggestions = await searchFoodSuggestions(query);
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (err) {
    console.error('Error searching food:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to fetch food suggestions'
    });
  }
};

exports.getNutritionInfo = async (req, res) => {
  try {
    const { foodName } = req.query;
    if (!foodName) {
      return res.status(400).json({ 
        success: false,
        message: 'Food name is required'
      });
    }

    const nutritionInfo = await getNutritionInfo(foodName);
    res.json({
      success: true,
      data: nutritionInfo
    });
  } catch (err) {
    console.error('Error getting nutrition info:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to fetch nutrition information'
    });
  }
};
