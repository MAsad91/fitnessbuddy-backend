const mongoose = require('mongoose');

const NutritionSchema = new mongoose.Schema({
  calories: Number,
  protein: Number,
  carbohydrates: Number,
  fat: Number,
  saturatedFat: Number,
  sugar: Number,
  fiber: Number,
  sodium: Number,
  caloriesUnit: String,
  proteinUnit: String,
  carbohydratesUnit: String,
  fatUnit: String,
  saturatedFatUnit: String,
  sugarUnit: String,
  fiberUnit: String,
  sodiumUnit: String,
}, { _id: false });

const PakistaniFoodItemsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  aliases: [String],
  description: String,
  category: String,
  subcategory: String,
  servingSize: Number,
  servingSizeUnit: String,
  servingWeight: Number,
  nutrition: NutritionSchema,
  commonPreparation: String,
  region: String,
  mealType: String,
  ingredients: [String],
  allergens: [String],
  country: String,
  verified: Boolean,
  source: String,
  isPackagedProduct: Boolean,
  isTraditionalFood: Boolean,
  popularity: Number,
  searchCount: Number,
  lastUpdated: Date,
  barcode: String
});

module.exports = mongoose.model('PakistaniFoodItems', PakistaniFoodItemsSchema); 