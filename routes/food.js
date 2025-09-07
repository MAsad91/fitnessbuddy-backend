const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food');
const { protect } = require('../middleware/auth');

// Food entry CRUD operations
router.post('/entries', protect, foodController.createFoodEntry);
router.get('/entries/today', protect, foodController.getTodaysEntries);
router.get('/entries/week', protect, foodController.getWeekEntries);
router.put('/entries/:id', protect, foodController.updateFoodEntry);
router.delete('/entries/:id', protect, foodController.deleteFoodEntry);

// Food search and information
router.get('/barcode/:code', protect, foodController.getBarcodeInfo);
router.get('/search', protect, foodController.searchFood);
router.get('/nutrition', protect, foodController.getNutritionInfo);

// Pakistani food entries
router.post('/pakistani-entry', protect, foodController.addPakistaniFoodEntry);

// AI-powered features
router.post('/test-gemini', protect, foodController.testGeminiIntegration);
router.post('/analyze-nutritional-label', protect, foodController.analyzeNutritionalLabel);

module.exports = router;
