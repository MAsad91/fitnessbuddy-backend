// Structure: server/controllers/users.js
const User = require('../models/User');
const { uploadImage, deleteImage } = require('../utils/imageUpload');
const cloudinary = require('../config/cloudinary');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Please provide an image' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if it exists
    if (user.profilePicture && user.profilePicture.publicId) {
      await deleteImage(user.profilePicture.publicId);
    }

    // Upload new profile picture
    const uploadResult = await uploadImage(image, 'profile-pictures');

    // Update user profile using findByIdAndUpdate to avoid validation issues
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        profilePicture: {
          url: uploadResult.url,
          publicId: uploadResult.publicId
        }
      },
      { new: true, runValidators: false } // Disable validators for this update
    ).select('-password');

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: updatedUser.profilePicture
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

// @desc    Upload progress picture
// @route   POST /api/users/progress-picture
// @access  Private
exports.uploadProgressPicture = async (req, res) => {
  try {
    const { image, notes, measurements } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Please provide an image' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Upload progress picture
    const uploadResult = await uploadImage(image, 'progress-pictures');

    // Add progress picture to user's collection
    user.progressPictures.push({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      notes,
      measurements
    });
    await user.save();

    res.json({
      message: 'Progress picture uploaded successfully',
      progressPicture: user.progressPictures[user.progressPictures.length - 1]
    });
  } catch (error) {
    console.error('Error uploading progress picture:', error);
    res.status(500).json({ message: 'Failed to upload progress picture' });
  }
};

// @desc    Delete progress picture
// @route   DELETE /api/users/progress-picture/:pictureId
// @access  Private
exports.deleteProgressPicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the progress picture
    const picture = user.progressPictures.id(req.params.pictureId);
    if (!picture) {
      return res.status(404).json({ message: 'Progress picture not found' });
    }

    // Delete from Cloudinary
    await deleteImage(picture.publicId);

    // Remove from user's collection
    picture.remove();
    await user.save();

    res.json({ message: 'Progress picture deleted successfully' });
  } catch (error) {
    console.error('Error deleting progress picture:', error);
    res.status(500).json({ message: 'Failed to delete progress picture' });
  }
};

// @desc    Get all progress pictures
// @route   GET /api/users/progress-pictures
// @access  Private
exports.getProgressPictures = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.progressPictures);
  } catch (error) {
    console.error('Error fetching progress pictures:', error);
    res.status(500).json({ message: 'Failed to fetch progress pictures' });
  }
};

// @desc    Test Cloudinary configuration
// @route   GET /api/users/test-cloudinary
// @access  Private
exports.testCloudinary = async (req, res) => {
  try {
    // Test if we can access Cloudinary configuration
    const testConfig = {
      cloudName: cloudinary.config().cloud_name,
      hasApiKey: !!cloudinary.config().api_key,
      hasApiSecret: !!cloudinary.config().api_secret
    };

    // Try to get account details (this will fail if credentials are invalid)
    const accountDetails = await cloudinary.api.usage();

    res.json({
      message: 'Cloudinary configuration is valid',
      config: testConfig,
      accountDetails
    });
  } catch (error) {
    console.error('Error testing Cloudinary configuration:', error);
    res.status(500).json({
      message: 'Cloudinary configuration error',
      error: error.message,
      config: {
        cloudName: cloudinary.config().cloud_name,
        hasApiKey: !!cloudinary.config().api_key,
        hasApiSecret: !!cloudinary.config().api_secret
      }
    });
  }
};