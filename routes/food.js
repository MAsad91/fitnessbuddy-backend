const express = require('express');
const router = express.Router();
const foodController = require('../controllers/food');
const { protect } = require('../middleware/auth');

router.post('/entries', protect, foodController.createFoodEntry);
router.get('/entries/today', protect, foodController.getTodayEntries);
router.get('/entries/week', protect, foodController.getWeekEntries);
router.put('/entries/:id', protect, foodController.updateFoodEntry);
router.delete('/entries/:id', protect, foodController.deleteFoodEntry);
router.get('/barcode/:code', protect, foodController.getBarcodeInfo);
router.get('/search', protect, foodController.searchFood);
router.get('/nutrition', protect, foodController.getNutritionInfo);
router.get('/favorites', protect, foodController.getFavorites);
router.post('/favorites', protect, foodController.addToFavorites);
router.delete('/favorites/:id', protect, foodController.removeFromFavorites);

module.exports = router;
