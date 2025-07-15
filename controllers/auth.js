const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {sendEmail} = require('../utils/email'); 
const path = require('path');
const fs = require('fs').promises;

// Register User
/*exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ username, email, password });
        await user.save();

        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).send('Server error');
    }
};*/
// Update register function to include verification
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists' 
            });
        }

        const user = await User.create({
            username,
            email,
            password,
            emailVerificationToken: crypto.randomBytes(20).toString('hex'),
            emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        // Create verification URL based on platform
        let verificationUrl;
        const isMobile = req.headers['user-agent']?.toLowerCase().includes('expo');
        
        if (isMobile) {
            // For mobile app, use deep linking
            verificationUrl = `calorietracker://verify-email/${user.emailVerificationToken}`;
        } else {
            // For web app
            verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${user.emailVerificationToken}`;
        }

        try {
            await sendEmail({
                email: user.email,
                subject: 'Email Verification - Fitness Buddy',
                message: `Welcome to Fitness Buddy!\n\nPlease verify your email by clicking the following link:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nAfter verification, you can log in to your account.`
            });

            res.status(201).json({ 
                success: true, 
                message: 'Registration successful. Please check your email for verification instructions.'
            });
        } catch (emailError) {
            // If email sending fails, delete the user and return error
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send verification email. Please try again.' 
            });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Use lean: false to get a full Mongoose document
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(401).json({ 
                success: false, 
                message: 'Please verify your email before logging in. Check your inbox for the verification link.' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = user.getSignedJwtToken();
        res.status(200).json({ success: true, message: 'Login Successful', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

        // Send email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message: `You are receiving this email because you (or someone else) has requested the reset of a password. 
                Please click on the following link, or paste it into your browser to complete the process: \n\n ${resetUrl}`
            });

            res.status(200).json({ success: true, message: 'Password reset email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Password successfully updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({
            emailVerificationToken: req.params.token,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired verification link. Please request a new one.' 
            });
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        // Read and serve the success HTML page
        const successPagePath = path.join(__dirname, '..', 'views', 'emailVerificationSuccess.html');
        const htmlContent = await fs.readFile(successPagePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);
    } catch (err) {
        console.error('Email verification error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getCurrentUser = async (req, res) => {console.log(req.user.id)
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Successfully logged out'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
};

// @desc    Enable biometric authentication
// @route   POST /api/auth/biometric/enable
// @access  Private
exports.enableBiometric = function(req, res) {
  console.log('Enabling biometrics - Request body:', req.body);
  console.log('User ID from token:', req.user.id);

  var deviceId = req.body.deviceId;

  if (!deviceId) {
    console.log('No device ID provided');
    return res.status(400).json({
      success: false,
      message: 'Device ID is required'
    });
  }

  // First get the user to understand the current structure
  User.findById(req.user.id)
    .then(function(user) {
      if (!user) {
        console.log('User not found');
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('Current user settings structure:', {
        hasSettings: !!user.settings,
        hasPreferences: !!(user.settings && user.settings.preferences),
        hasBiometricAuth: !!(user.settings && user.settings.preferences && user.settings.preferences.biometricAuth)
      });

      // Update the correct nested field path: settings.preferences.biometricAuth
      var updateData = {
        'settings.preferences.biometricAuth.enabled': true,
        'settings.preferences.biometricAuth.lastUpdated': new Date(),
        'settings.preferences.biometricAuth.deviceId': deviceId
      };

      return User.findByIdAndUpdate(
        req.user.id,
        updateData,
        {
          new: true, // Return the updated document
          runValidators: false // Don't run validators since we're only updating preferences
        }
      );
    })
    .then(function(updatedUser) {
      console.log('User biometric settings updated successfully:', updatedUser.settings.preferences.biometricAuth);

      res.status(200).json({
        success: true,
        message: 'Biometric authentication enabled',
        data: {
          biometricAuth: updatedUser.settings.preferences.biometricAuth
        }
      });
    })
    .catch(function(error) {
      console.error('Enable biometric error details:', {
        error: error.message,
        stack: error.stack,
        name: error.name,
        userId: req.user ? req.user.id : 'unknown'
      });
      res.status(500).json({
        success: false,
        message: 'Error enabling biometric authentication',
        error: error.message
      });
    });
};

// @desc    Disable biometric authentication
// @route   POST /api/auth/biometric/disable
// @access  Private
exports.disableBiometric = function(req, res) {
  console.log('Disabling biometrics for user:', req.user.id);
  
  var updateData = {
    'settings.preferences.biometricAuth.enabled': false,
    'settings.preferences.biometricAuth.lastUpdated': new Date(),
    'settings.preferences.biometricAuth.deviceId': null
  };

  User.findByIdAndUpdate(
    req.user.id,
    updateData,
    {
      new: true,
      runValidators: false
    }
  )
  .then(function(updatedUser) {
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Biometric disabled successfully');

    res.status(200).json({
      success: true,
      message: 'Biometric authentication disabled',
      data: {
        biometricAuth: updatedUser.settings.preferences.biometricAuth
      }
    });
  })
  .catch(function(error) {
    console.error('Disable biometric error:', error);
    res.status(500).json({
      success: false,
      message: 'Error disabling biometric authentication',
      error: error.message
    });
  });
};

// @desc    Get biometric status
// @route   GET /api/auth/biometric/status
// @access  Private
exports.getBiometricStatus = function(req, res) {
  console.log('Getting biometric status for user:', req.user.id);
  
  User.findById(req.user.id)
    .then(function(user) {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Ensure the biometric auth structure exists
      var biometricAuth = (user.settings && user.settings.preferences && user.settings.preferences.biometricAuth) || {
        enabled: false,
        lastUpdated: null,
        deviceId: null
      };

      console.log('Current biometric status:', biometricAuth);
      
      res.status(200).json({
        success: true,
        data: {
          biometricAuth: biometricAuth
        }
      });
    })
    .catch(function(error) {
      console.error('Get biometric status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting biometric status',
        error: error.message
      });
    });
};

// Update user settings
exports.updateSettings = function(req, res) {
    console.log('Updating settings for user:', req.user.id);
    console.log('Settings data:', req.body.settings);
    
    // Use findByIdAndUpdate with dot notation to avoid object replacement issues
    var updateOperations = {};
    
    if (req.body.settings) {
        // Build update operations using dot notation for safety
        if (req.body.settings.theme) {
            Object.keys(req.body.settings.theme).forEach(function(key) {
                updateOperations['settings.theme.' + key] = req.body.settings.theme[key];
            });
        }
        
        if (req.body.settings.notifications) {
            Object.keys(req.body.settings.notifications).forEach(function(key) {
                updateOperations['settings.notifications.' + key] = req.body.settings.notifications[key];
            });
        }
        
        if (req.body.settings.preferences) {
            Object.keys(req.body.settings.preferences).forEach(function(key) {
                // Skip biometricAuth - it should only be updated via biometric endpoints
                if (key !== 'biometricAuth') {
                    updateOperations['settings.preferences.' + key] = req.body.settings.preferences[key];
                }
            });
        }
    }
    
    console.log('Update operations:', updateOperations);
    
    if (Object.keys(updateOperations).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No valid settings to update'
        });
    }
    
    User.findByIdAndUpdate(
        req.user.id,
        updateOperations,
        {
            new: true, // Return updated document
            runValidators: false // Don't run validators for partial updates
        }
    )
        .then(function(savedUser) {
            if (!savedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            console.log('Settings updated successfully:', savedUser.settings);
            res.status(200).json({
                success: true,
                message: 'Settings updated successfully',
                data: savedUser.settings
            });
        })
        .catch(function(err) {
            console.error('Update settings error details:', {
                message: err.message,
                name: err.name,
                errors: err.errors,
                userId: req.user.id
            });
            
            // More specific error messages
            var errorMessage = 'Failed to update settings';
            if (err.name === 'ValidationError') {
                if (err.errors.name) {
                    errorMessage = 'User data corruption detected. Please try logging out and back in.';
                } else if (err.errors['settings.preferences.biometricAuth']) {
                    errorMessage = 'Biometric settings validation failed. Please try again.';
                } else {
                    errorMessage = 'Settings validation failed: ' + Object.keys(err.errors).join(', ');
                }
            }
            
            res.status(500).json({ 
                success: false, 
                message: errorMessage,
                error: err.message
            });
        });
};

// Get user settings
exports.getSettings = function(req, res) {
    console.log('Getting settings for user:', req.user.id);
    
    User.findById(req.user.id)
        .then(function(user) {
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            // Ensure settings structure exists
            var settings = user.settings || {
                theme: {},
                notifications: {},
                preferences: {}
            };

            console.log('Retrieved settings:', settings);
            res.status(200).json({
                success: true,
                data: settings
            });
        })
        .catch(function(err) {
            console.error('Get settings error:', err);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to get settings',
                error: err.message
            });
        });
};