const FoodEntry = require('../models/FoodEntry');
const Jwt = require('jsonwebtoken');
const moment = require('moment');
const { analyzeFoodDescription, lookupBarcode, searchFoodSuggestions, getNutritionInfo } = require('../ThirdParty/nutritionixAPI');
const axios = require('axios');
//const LocalFoodProduct = require('../models/LocalFoodProduct');
//const PakistaniFoodItem = require('../models/PakistaniFoodItem');
const PakistaniFoodItems = require('../models/PakistaniFoodItems');

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

    let foods;
    try {
      foods = await analyzeFoodDescription(description);
    } catch (err) {
      // Fallback: try to find in PakistaniFoodItems by name
      const localFood = await PakistaniFoodItems.findOne({ name: description });
      if (localFood) {
        foods = [{
          food_name: localFood.name,
          serving_qty: localFood.servingSize,
          serving_unit: localFood.servingSizeUnit,
          nf_calories: localFood.nutrition?.calories,
          nf_protein: localFood.nutrition?.protein,
          nf_total_carbohydrate: localFood.nutrition?.carbohydrates,
          nf_total_fat: localFood.nutrition?.fat,
        }];
      } else {
        // If not found, return a user-friendly error
        return res.status(404).json({ message: 'No nutrition data found for this description.' });
      }
    }

    const analyzedFood = foods.map((food) => ({
      foodName: food.food_name,
      servingQty: Number(food.serving_qty) || 0,
      servingUnit: food.serving_unit,
      calories: Number(food.nf_calories) || 0,
      protein: Number(food.nf_protein) || 0,
      carbs: Number(food.nf_total_carbohydrate) || 0,
      fats: Number(food.nf_total_fat) || 0,
    }));

    const totals = {
      calories: analyzedFood.reduce((sum, f) => sum + (Number(f.calories) || 0), 0),
      protein: analyzedFood.reduce((sum, f) => sum + (Number(f.protein) || 0), 0),
      carbs: analyzedFood.reduce((sum, f) => sum + (Number(f.carbs) || 0), 0),
      fats: analyzedFood.reduce((sum, f) => sum + (Number(f.fats) || 0), 0),
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
    const code = req.params.code;
    // Log all barcodes that match the string or number form for debugging
    const possibleMatches = await PakistaniFoodItems.find({
      $or: [
        { barcode: code },
        { barcode: code.replace(/^0+/, '') },
        { barcode: Number(code) },
        { barcode: String(Number(code)) }
      ]
    });
    // 0. Check PakistaniFoodItems first (string and number forms)
    const pkFood = possibleMatches[0];
    if (pkFood) {
      return res.json({
        name: pkFood.name,
        brand: pkFood.brand || '',
        description: pkFood.description,
        category: pkFood.category,
        subcategory: pkFood.subcategory,
        servingSize: pkFood.servingSize,
        servingSizeUnit: pkFood.servingSizeUnit,
        servingWeight: pkFood.servingWeight,
        nutrition: pkFood.nutrition,
        commonPreparation: pkFood.commonPreparation,
        region: pkFood.region,
        mealType: pkFood.mealType,
        ingredients: pkFood.ingredients,
        allergens: pkFood.allergens,
        country: pkFood.country,
        verified: pkFood.verified,
        source: 'pakistani_food_items',
        isPackagedProduct: pkFood.isPackagedProduct,
        isTraditionalFood: pkFood.isTraditionalFood,
        popularity: pkFood.popularity,
        searchCount: pkFood.searchCount,
        lastUpdated: pkFood.lastUpdated,
        barcode: pkFood.barcode
      });
    }
    // Only check external sources if not found in PakistaniFoodItems
    // 1. Try Nutritionix
    let item;
    try {
      item = await lookupBarcode(req.params.code);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Nutritionix: Barcode not found (404)
      } else {
        console.error('Nutritionix lookup error:', err.message);
      }
      item = null;
    }
    if (item && item.foods && item.foods.length > 0) {
      const foodItem = item.foods[0];
      return res.json({
        name: foodItem.food_name,
        brand: foodItem.brand_name,
        calories: foodItem.nf_calories,
        protein: foodItem.nf_protein,
        carbs: foodItem.nf_total_carbohydrate,
        fat: foodItem.nf_total_fat,
        serving_size: foodItem.serving_qty,
        serving_unit: foodItem.serving_unit,
        source: 'nutritionix',
      });
    }
    // 2. Try Open Food Facts
    try {
      const offResp = await axios.get(`https://world.openfoodfacts.org/api/v2/product/${req.params.code}`);
      const offData = offResp.data;
      if (offData.status === 1 && offData.product) {
        const product = offData.product;
        return res.json({
          name: product.product_name || '',
          brand: product.brands || '',
          calories: product.nutriments['energy-kcal_100g'] || 0,
          protein: product.nutriments.proteins_100g || 0,
          carbs: product.nutriments.carbohydrates_100g || 0,
          fat: product.nutriments.fat_100g || 0,
          serving_size: product.serving_size || '',
          serving_unit: product.serving_quantity || '',
          source: 'openfoodfacts',
        });
      }
    } catch (offErr) {
      console.error('Open Food Facts lookup error:', offErr.message);
    }
    // Not found in any source
    res.status(404).json({
      success: false,
      message: 'Product not found in PakistaniFoodItems, Nutritionix, or Open Food Facts'
    });
  } catch (error) {
    console.error('❌ Barcode lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error looking up product'
    });
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

// New: Add food entry by name and quantity (for Pakistani foods)
exports.createPakistaniFoodEntry = async (req, res) => {
  try {
    const { foodName, quantity, mealType } = req.body;
    if (!foodName || !quantity || !mealType) {
      return res.status(400).json({ success: false, message: 'foodName, quantity, and mealType are required' });
    }

    // Find food by name or alias
    const foodItem = await PakistaniFoodItem.findOne({
      $or: [
        { name: new RegExp('^' + foodName + '$', 'i') },
        { aliases: { $in: [new RegExp('^' + foodName + '$', 'i')] } }
      ]
    });
    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food not found in Pakistani food database' });
    }

    // Calculate nutrition
    const qty = Number(quantity);
    const entry = {
      foodName: foodItem.name,
      mealType,
      quantity: qty,
      serving_size: foodItem.serving_size,
      calories: foodItem.calories_per_serving * qty,
      protein: (foodItem.protein_per_serving || 0) * qty,
      carbs: (foodItem.carbs_per_serving || 0) * qty,
      fat: (foodItem.fat_per_serving || 0) * qty,
      createdAt: new Date(),
      userId: req.user._id
    };

    // Save to FoodEntry (reuse your existing model)
    const FoodEntry = require('../models/FoodEntry');
    const saved = await FoodEntry.create(entry);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Error creating Pakistani food entry:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user's favorite foods
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's favorite foods from their profile
    const User = require('../models/User');
    const user = await User.findById(userId).select('favoriteFoods');
    
    res.json({
      success: true,
      favorites: user.favoriteFoods || []
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorite foods'
    });
  }
};

// Add food to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { foodId, foodName, calories, protein, carbs, fat } = req.body;
    
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user.favoriteFoods) {
      user.favoriteFoods = [];
    }
    
    // Check if already in favorites
    const existingFavorite = user.favoriteFoods.find(fav => fav.foodId === foodId);
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Food already in favorites'
      });
    }
    
    // Add to favorites
    user.favoriteFoods.push({
      foodId,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      addedAt: new Date()
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Food added to favorites',
      favorites: user.favoriteFoods
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add food to favorites'
    });
  }
};

// Remove food from favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user.favoriteFoods) {
      return res.status(404).json({
        success: false,
        message: 'No favorites found'
      });
    }
    
    // Remove from favorites
    user.favoriteFoods = user.favoriteFoods.filter(fav => fav._id.toString() !== id);
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Food removed from favorites',
      favorites: user.favoriteFoods
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove food from favorites'
    });
  }
};