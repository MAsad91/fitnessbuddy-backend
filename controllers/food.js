const FoodEntry = require('../models/FoodEntry');
const Jwt = require('jsonwebtoken');
const moment = require('moment');
const { analyzeFoodDescription, lookupBarcode, searchFoodSuggestions, getNutritionInfo, analyzeNutritionalLabelImage } = require('../ThirdParty/geminiAPI');
const axios = require('axios');
//const LocalFoodProduct = require('../models/LocalFoodProduct');
//const PakistaniFoodItem = require('../models/PakistaniFoodItem');
const PakistaniFoodItems = require('../models/PakistaniFoodItems');

exports.createFoodEntry = async (req, res) => {
  const { mealType, description } = req.body;
  
  try {
    // Get user ID consistently - prefer req.user if available, otherwise decode JWT
    let userId;
    if (req.user && req.user._id) {
      userId = req.user._id;
    } else {
      const decode = Jwt.verify(req.headers.token, process.env.JWT_SECRET);
      userId = decode.id || decode._id;
    }

    console.log('👤 User ID for food entry:', userId);

    if (mealType !== 'snacks') {
      const startOfDay = moment().startOf('day').toDate();
      const endOfDay = moment().endOf('day').toDate();

      const existingEntry = await FoodEntry.findOne({
        userId: userId,
        mealType,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      if (existingEntry) {
        return res.status(400).json({ message: `Food entry already exists for ${mealType} today` });
      }
    }

    let foods;
    try {
      console.log('🔍 Using Gemini AI to analyze food description:', description);
      foods = await analyzeFoodDescription(description);
      console.log('✅ Gemini AI returned data:', { 
        foodCount: foods?.length || 0, 
        foods: foods?.map(f => ({ name: f.food_name, calories: f.nf_calories })) || []
      });
    } catch (err) {
      console.error('❌ Gemini AI analysis failed:', err.message);
      
      // Quick fallback: try to find in PakistaniFoodItems by name
      try {
        const localFood = await PakistaniFoodItems.findOne({ 
          name: { $regex: new RegExp(description, 'i') } 
        });
        
        if (localFood) {
          console.log('✅ Found in local database:', localFood.name);
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
          console.log('❌ No nutrition data found for:', description);
          return res.status(404).json({ 
            message: 'No nutrition data found for this description. Please try a more specific food name.' 
          });
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback lookup also failed:', fallbackErr.message);
        return res.status(500).json({ 
          message: 'Unable to analyze food description. Please try again or use a different food name.' 
        });
      }
    }

    // Validate that we have foods data
    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      console.error('❌ Invalid foods data received:', foods);
      return res.status(500).json({ 
        message: 'Failed to process food data. Please try again.' 
      });
    }

    console.log('🔄 Processing food data for database...');
    const analyzedFood = foods.map((food, index) => {
      console.log(`   Food ${index + 1}:`, {
        name: food.food_name,
        calories: food.nf_calories,
        protein: food.nf_protein,
        carbs: food.nf_total_carbohydrate,
        fat: food.nf_total_fat,
        sodium: food.nf_sodium,
        fiber: food.nf_fiber,
        sugars: food.nf_sugars
      });
      
      // Extract all micronutrients from Gemini response (excluding macros)
      const micros = {};
      Object.keys(food).forEach(key => {
        if (key.startsWith('nf_') && 
            !['nf_calories', 'nf_protein', 'nf_total_carbohydrate', 'nf_total_fat'].includes(key)) {
          micros[key] = Number(food[key]) || 0;
        }
      });
      
      return {
        foodName: food.food_name,
        servingQty: Number(food.serving_qty) || 0,
        servingUnit: food.serving_unit || 'serving',
        // Macronutrients
        calories: Number(food.nf_calories) || 0,
        protein: Number(food.nf_protein) || 0,
        carbs: Number(food.nf_total_carbohydrate) || 0,
        fats: Number(food.nf_total_fat) || 0,
        // Micronutrients (dynamic object)
        micros: micros
      };
    });

    // Calculate total macros
    const totalMacros = {
      calories: analyzedFood.reduce((sum, f) => sum + (Number(f.calories) || 0), 0),
      protein: analyzedFood.reduce((sum, f) => sum + (Number(f.protein) || 0), 0),
      carbs: analyzedFood.reduce((sum, f) => sum + (Number(f.carbs) || 0), 0),
      fats: analyzedFood.reduce((sum, f) => sum + (Number(f.fats) || 0), 0),
    };

    // Calculate total micros by combining all micros from all foods
    const totalMicros = {};
    analyzedFood.forEach(food => {
      if (food.micros && typeof food.micros === 'object') {
        Object.keys(food.micros).forEach(microKey => {
          if (!totalMicros[microKey]) {
            totalMicros[microKey] = 0;
          }
          totalMicros[microKey] += Number(food.micros[microKey]) || 0;
        });
      }
    });

    const totals = {
      totalMacros,
      totalMicros
    };

    console.log('📊 Calculated totals:', {
      totalMacros,
      totalMicros
    });

    console.log('📊 Creating food entry with data:', {
      userId: userId,
      mealType,
      description,
      analyzedFoodCount: analyzedFood.length,
      rawFoodCount: foods.length,
      totals
    });

    const entry = new FoodEntry({
      userId: userId,
      mealType,
      description,
      analyzedFood,
      rawFood: foods,
      totals,
      createdAt: moment().toDate(),
    });

    console.log('💾 Saving food entry to database...');
    const savedEntry = await entry.save();
    console.log('✅ Food entry saved successfully:', savedEntry._id);
    
    // Return the format expected by mobile app
    res.json(savedEntry);
  } catch (err) {
    console.error('❌ Error in createFoodEntry:', err);
    console.error('❌ Error stack:', err.stack);
    
    // More specific error messages
    if (err.name === 'ValidationError') {
      console.error('❌ Validation error details:', err.errors);
      return res.status(400).json({ 
        message: 'Validation error: ' + Object.values(err.errors).map(e => e.message).join(', ')
      });
    }
    
    if (err.name === 'CastError') {
      console.error('❌ Cast error details:', err);
      return res.status(400).json({ 
        message: 'Invalid data format'
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while creating food entry',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Get today's food entries (fixed function)
exports.getTodaysEntries = async (req, res) => {
  try {
    console.log('Fetching today\'s entries for user:', req.user._id);
    
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();

    const entries = await FoodEntry.find({
      userId: req.user._id,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    console.log('✅ Today\'s entries fetched:', entries.length, 'entries');

    res.json({
      success: true,
      message: 'Today\'s food entries retrieved successfully',
      data: entries
    });
  } catch (err) {
    console.error('❌ Error fetching today\'s entries:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
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

// Update food entry (enhanced)
exports.updateFoodEntry = async (req, res) => {
  try {
    console.log('Updating food entry:', req.params.id);
    
    const entry = await FoodEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ 
        success: false,
        message: 'Entry not found' 
      });
    }

    // Update fields
    Object.assign(entry, req.body);
    await entry.save();

    console.log('✅ Food entry updated successfully');

    res.json({
      success: true,
      message: 'Food entry updated successfully',
      data: entry
    });
  } catch (err) {
    console.error('❌ Error updating food entry:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

// Delete food entry (fixed function)
exports.deleteFoodEntry = async (req, res) => {
  try {
    console.log('Deleting food entry:', req.params.id);
    
    const entry = await FoodEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ 
        success: false,
        message: 'Entry not found' 
      });
    }

    console.log('✅ Food entry deleted successfully');

    res.json({ 
      success: true,
      message: 'Entry deleted successfully' 
    });
  } catch (err) {
    console.error('❌ Error deleting food entry:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
};

exports.getBarcodeInfo = async (req, res) => {
  try {
    const code = req.params.code;
    
    // 1. First check PakistaniFoodItems (local database)
    const possibleMatches = await PakistaniFoodItems.find({
      $or: [
        { barcode: code },
        { barcode: code.replace(/^0+/, '') },
        { barcode: Number(code) },
        { barcode: String(Number(code)) }
      ]
    });
    
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

    // 2. Try Gemini AI for barcode analysis
    try {
      console.log('🔍 Using Gemini AI to analyze barcode:', code);
      const geminiResult = await lookupBarcode(code);
      
      if (geminiResult && geminiResult.foods && geminiResult.foods.length > 0) {
        const foodItem = geminiResult.foods[0];
        return res.json({
          name: foodItem.name || 'Unknown Product',
          brand: foodItem.brand || 'Unknown',
          calories: foodItem.calories || 0,
          protein: foodItem.protein || 0,
          carbs: foodItem.carbs || 0,
          fat: foodItem.fat || 0,
          serving_size: foodItem.serving_size || '',
          serving_unit: foodItem.serving_unit || '',
          ingredients: foodItem.ingredients || [],
          allergens: foodItem.allergens || [],
          source: 'gemini_ai',
        });
      }
    } catch (geminiErr) {
      console.error('❌ Gemini AI lookup error:', geminiErr.message);
    }

    // 3. Fallback to Open Food Facts
    try {
      const offResp = await axios.get(`https://world.openfoodfacts.org/api/v2/product/${code}`);
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
      message: 'Product not found in local database, Gemini AI, or Open Food Facts'
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

    console.log('🔍 Using Gemini AI to get nutrition info for:', foodName);
    const nutritionInfo = await getNutritionInfo(foodName);
    res.json({
      success: true,
      data: nutritionInfo
    });
  } catch (err) {
    console.error('❌ Error getting nutrition info:', err);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to fetch nutrition information'
    });
  }
};

// Test endpoint for Gemini AI integration
exports.testGeminiIntegration = async (req, res) => {
  try {
    const { testQuery } = req.body;
    const query = testQuery || 'apple';
    
    console.log('🧪 Testing Gemini AI with query:', query);
    
    const result = await analyzeFoodDescription(query);
    
    res.json({
      success: true,
      message: 'Gemini AI integration test successful',
      query: query,
      result: result
    });
  } catch (err) {
    console.error('❌ Gemini AI test failed:', err);
    res.status(500).json({
      success: false,
      message: 'Gemini AI test failed',
      error: err.message
    });
  }
};

// Add Pakistani food entry (fixed function)
exports.addPakistaniFoodEntry = async (req, res) => {
  try {
    const { foodName, quantity, mealType } = req.body;
    
    console.log('Adding Pakistani food entry:', { foodName, quantity, mealType });
    
    if (!foodName || !quantity || !mealType) {
      return res.status(400).json({ 
        success: false, 
        message: 'foodName, quantity, and mealType are required' 
      });
    }

    // Find food by name or alias
    const foodItem = await PakistaniFoodItems.findOne({
      $or: [
        { name: new RegExp('^' + foodName + '$', 'i') },
        { aliases: { $in: [new RegExp('^' + foodName + '$', 'i')] } }
      ]
    });
    
    if (!foodItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Food not found in Pakistani food database' 
      });
    }

    // Calculate nutrition
    const qty = Number(quantity);
    const entryData = {
      foodName: foodItem.name,
      mealType,
      quantity: qty,
      description: `${qty} ${foodItem.servingSizeUnit || 'serving'}(s) of ${foodItem.name}`,
      analyzedFood: [{
        food_name: foodItem.name,
        serving_qty: qty,
        serving_unit: foodItem.servingSizeUnit || 'serving',
        nf_calories: (foodItem.nutrition?.calories || 0) * qty,
        nf_protein: (foodItem.nutrition?.protein || 0) * qty,
        nf_total_carbohydrate: (foodItem.nutrition?.carbohydrates || 0) * qty,
        nf_total_fat: (foodItem.nutrition?.fat || 0) * qty,
      }],
      totals: {
        totalMacros: {
          calories: (foodItem.nutrition?.calories || 0) * qty,
          protein: (foodItem.nutrition?.protein || 0) * qty,
          carbs: (foodItem.nutrition?.carbohydrates || 0) * qty,
          fat: (foodItem.nutrition?.fat || 0) * qty,
        }
      },
      createdAt: new Date(),
      userId: req.user._id
    };

    // Save to FoodEntry
    const saved = await FoodEntry.create(entryData);
    
    console.log('✅ Pakistani food entry created successfully');
    
    res.status(201).json({ 
      success: true, 
      message: 'Pakistani food entry created successfully',
      data: saved 
    });
  } catch (err) {
    console.error('❌ Error creating Pakistani food entry:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
};

exports.analyzeNutritionalLabel = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    console.log('📸 Analyzing nutritional label image...');
    
    // Remove data URL prefix if present
    const cleanImageData = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const analysisResult = await analyzeNutritionalLabelImage(cleanImageData);
    
    // Transform the result to match the expected mobile app format
    const transformedResult = {
      name: analysisResult.product_name || 'Unknown Product',
      brand: analysisResult.brand || 'Unknown',
      calories: analysisResult.nutrition_per_serving?.calories || 0,
      protein: analysisResult.nutrition_per_serving?.protein || 0,
      carbs: analysisResult.nutrition_per_serving?.total_carbohydrate || 0,
      fat: analysisResult.nutrition_per_serving?.total_fat || 0,
      serving_size: analysisResult.serving_size || '',
      serving_unit: analysisResult.serving_unit || '',
      ingredients: analysisResult.ingredients || [],
      allergens: analysisResult.allergens || [],
      source: 'gemini_vision',
      // Additional nutrition data for future use
      nutrition_details: analysisResult.nutrition_per_serving || {}
    };

    console.log('✅ Nutritional label analysis completed:', {
      productName: transformedResult.name,
      brand: transformedResult.brand,
      calories: transformedResult.calories,
      servingSize: `${transformedResult.serving_size} ${transformedResult.serving_unit}`
    });

    res.json(transformedResult);
    
  } catch (error) {
    console.error('❌ Error analyzing nutritional label:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze nutritional label',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
