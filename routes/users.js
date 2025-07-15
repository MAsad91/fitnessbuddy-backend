// Structure: server/routes/users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadProgressPicture,
  deleteProgressPicture,
  getProgressPictures,
  testCloudinary
} = require('../controllers/users');

// GET /api/users/profile
router.get('/profile', protect, getProfile);

// Test route
router.get('/test-cloudinary', protect, testCloudinary);

// PUT /api/users/profile
router.put('/profile', protect, updateProfile);

// POST /api/users/profile-picture
router.post('/profile-picture', protect, uploadProfilePicture);

// POST /api/users/progress-picture
router.post('/progress-picture', protect, uploadProgressPicture);

// DELETE /api/users/progress-picture/:pictureId
router.delete('/progress-picture/:pictureId', protect, deleteProgressPicture);

// GET /api/users/progress-pictures
router.get('/progress-pictures', protect, getProgressPictures);

module.exports = router;