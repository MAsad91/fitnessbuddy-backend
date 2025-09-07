const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');

// Register push token
router.post('/register-token', protect, async (req, res) => {
  try {
    const { token, platform, deviceId } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Push token is required'
      });
    }

    // Check if token already exists for this user
    const existingToken = await Notification.findOne({
      userId: req.user.id,
      token: token
    });

    if (existingToken) {
      // Update existing token
      existingToken.platform = platform || existingToken.platform;
      existingToken.deviceId = deviceId || existingToken.deviceId;
      existingToken.isActive = true;
      existingToken.lastUpdated = new Date();
      await existingToken.save();

      return res.json({
        success: true,
        message: 'Token updated successfully',
        data: existingToken
      });
    }

    // Create new token record
    const newToken = new Notification({
      userId: req.user.id,
      token: token,
      platform: platform || 'unknown',
      deviceId: deviceId || 'unknown',
      isActive: true,
      type: 'push_token'
    });

    await newToken.save();

    console.log(`✅ Push token registered for user ${req.user.id}:`, token);

    res.json({
      success: true,
      message: 'Token registered successfully',
      data: newToken
    });
  } catch (error) {
    console.error('❌ Error registering push token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register push token'
    });
  }
});

// Get user's notification tokens
router.get('/tokens', protect, async (req, res) => {
  try {
    const tokens = await Notification.find({
      userId: req.user.id,
      type: 'push_token',
      isActive: true
    });

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('❌ Error getting notification tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification tokens'
    });
  }
});

// Deactivate a specific token
router.put('/deactivate-token/:tokenId', protect, async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    const token = await Notification.findOne({
      _id: tokenId,
      userId: req.user.id,
      type: 'push_token'
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    token.isActive = false;
    await token.save();

    res.json({
      success: true,
      message: 'Token deactivated successfully'
    });
  } catch (error) {
    console.error('❌ Error deactivating token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate token'
    });
  }
});

// Deactivate all tokens for user
router.put('/deactivate-all-tokens', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        userId: req.user.id,
        type: 'push_token'
      },
      {
        isActive: false
      }
    );

    res.json({
      success: true,
      message: 'All tokens deactivated successfully'
    });
  } catch (error) {
    console.error('❌ Error deactivating all tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate tokens'
    });
  }
});

// Test notification endpoint
router.post('/test', protect, async (req, res) => {
  try {
    const { title, body, data } = req.body;
    
    const firebaseNotificationService = require('../utils/firebaseNotificationService');
    
    const result = await firebaseNotificationService.sendToUser(req.user.id, {
      title: title || 'Test Notification',
      body: body || 'This is a test notification',
      data: data || {}
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Test notification sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Failed to send test notification'
      });
    }
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
});

module.exports = router; 