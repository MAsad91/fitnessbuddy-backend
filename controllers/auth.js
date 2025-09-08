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

        // Generate a random password
        const randomPassword = crypto.randomBytes(4).toString('hex'); // 8 character password
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        // Update user's password in database
        user.password = hashedPassword;
        user.passwordResetAt = new Date(); // Track when password was reset
        await user.save();

        // Create beautiful modern email template
        const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>🔐 Your New Password - Fitness Buddy</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                }
                .email-container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: #ffffff; 
                    border-radius: 16px; 
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .header { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    padding: 50px 30px; 
                    text-align: center; 
                    position: relative;
                }
                .header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                }
                .header-content { position: relative; z-index: 1; }
                .header h1 { 
                    color: #ffffff; 
                    margin: 0 0 10px 0; 
                    font-size: 32px; 
                    font-weight: 700;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header p { 
                    color: rgba(255,255,255,0.9); 
                    font-size: 16px; 
                    margin: 0;
                }
                .content { padding: 50px 40px; }
                .greeting {
                    font-size: 24px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 20px;
                }
                .intro-text {
                    font-size: 16px;
                    color: #5a6c7d;
                    margin-bottom: 30px;
                    line-height: 1.7;
                }
                .password-section {
                    background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
                    border: 2px solid #667eea;
                    border-radius: 16px;
                    padding: 30px;
                    margin: 30px 0;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .password-section::before {
                    content: '🔐';
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    font-size: 24px;
                    opacity: 0.3;
                }
                .password-label {
                    font-size: 14px;
                    color: #667eea;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                }
                .password-display {
                    background: #ffffff;
                    border: 2px dashed #667eea;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 15px 0;
                    position: relative;
                }
                .password-text { 
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; 
                    font-size: 20px; 
                    font-weight: 700; 
                    color: #2c3e50; 
                    letter-spacing: 3px;
                    word-break: break-all;
                    line-height: 1.4;
                }
                .copy-hint {
                    font-size: 12px;
                    color: #8e9aaf;
                    margin-top: 10px;
                    font-style: italic;
                }
                .warning-box { 
                    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); 
                    border-left: 4px solid #f39c12; 
                    border-radius: 8px; 
                    padding: 20px; 
                    margin: 30px 0;
                    position: relative;
                }
                .warning-box::before {
                    content: '⚠️';
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    font-size: 20px;
                }
                .warning-content {
                    margin-left: 35px;
                }
                .warning-title {
                    font-weight: 700;
                    color: #8b4513;
                    margin-bottom: 5px;
                }
                .warning-text {
                    color: #8b4513;
                    font-size: 14px;
                }
                .steps-container { 
                    background: linear-gradient(135deg, #e8f4fd 0%, #d1ecf1 100%); 
                    border-radius: 16px; 
                    padding: 30px; 
                    margin: 30px 0;
                    border: 1px solid #bee5eb;
                }
                .steps-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #0c5460;
                    margin-bottom: 25px;
                    text-align: center;
                }
                .step { 
                    display: flex;
                    align-items: flex-start;
                    margin: 20px 0; 
                    padding: 15px 0;
                }
                .step-number { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    border-radius: 50%; 
                    width: 32px; 
                    height: 32px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-weight: 700; 
                    margin-right: 15px;
                    flex-shrink: 0;
                    font-size: 14px;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                }
                .step-content {
                    flex: 1;
                }
                .step-title {
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }
                .step-description {
                    color: #5a6c7d;
                    font-size: 14px;
                    line-height: 1.5;
                }
                .footer { 
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
                    padding: 30px; 
                    text-align: center; 
                    color: #6c757d; 
                    font-size: 14px;
                    border-top: 1px solid #dee2e6;
                }
                .footer-brand {
                    font-weight: 700;
                    color: #667eea;
                    margin-bottom: 10px;
                }
                .footer-text {
                    line-height: 1.6;
                }
                .security-note {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 30px 0;
                    border-left: 4px solid #6c757d;
                }
                .security-note-title {
                    font-weight: 600;
                    color: #495057;
                    margin-bottom: 8px;
                }
                .security-note-text {
                    color: #6c757d;
                    font-size: 14px;
                    line-height: 1.5;
                }
                @media (max-width: 600px) {
                    .content { padding: 30px 20px; }
                    .header { padding: 40px 20px; }
                    .header h1 { font-size: 28px; }
                    .password-text { font-size: 16px; letter-spacing: 2px; }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="header-content">
                        <h1>🔐 Password Reset Complete</h1>
                        <p>Your account is ready to use</p>
                    </div>
                </div>
                <div class="content">
                    <div class="greeting">Hello ${user.username || 'Fitness Buddy User'}!</div>
                    <div class="intro-text">
                        Your password has been successfully reset for security reasons. Below is your new temporary password that you can use to log into your account.
                    </div>
                    
                    <div class="password-section">
                        <div class="password-label">Your New Password</div>
                        <div class="password-display">
                            <div class="password-text">${randomPassword}</div>
                            <div class="copy-hint">Click to copy or select all</div>
                        </div>
                    </div>
                    
                    <div class="warning-box">
                        <div class="warning-content">
                            <div class="warning-title">Security Notice</div>
                            <div class="warning-text">Please change this password immediately after logging in to ensure your account remains secure.</div>
                        </div>
                    </div>
                    
                    <div class="steps-container">
                        <div class="steps-title">📱 Next Steps</div>
                        <div class="step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <div class="step-title">Login to Your Account</div>
                                <div class="step-description">Use your email address and the new password above to access your Fitness Buddy account.</div>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <div class="step-title">Navigate to Profile Settings</div>
                                <div class="step-description">Go to your profile section and find the "Change Password" option in the settings.</div>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <div class="step-title">Set Your New Password</div>
                                <div class="step-description">Create a strong, memorable password that you'll use going forward.</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="security-note">
                        <div class="security-note-title">🔒 Account Security</div>
                        <div class="security-note-text">
                            If you didn't request this password reset, please contact our support team immediately. 
                            Your account security is our top priority.
                        </div>
                    </div>
                </div>
                <div class="footer">
                    <div class="footer-brand">🏋️‍♂️ Fitness Buddy</div>
                    <div class="footer-text">
                        Your trusted companion for achieving fitness goals<br>
                        For support, contact us at <strong>support@fitnessbuddy.com</strong>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send email with HTML template
        try {
            await sendEmail({
                email: user.email,
                subject: '🔐 Your New Password - Fitness Buddy',
                html: emailTemplate
            });

            res.status(200).json({ 
                success: true, 
                message: 'Password reset complete. Please check your email for the new password and update it in your profile after logging in.' 
            });
        } catch (err) {
            // If email fails, we should revert the password change
            // For now, we'll log the error but keep the password changed
            console.error('Email sending failed:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Password was reset but email could not be sent. Please contact support.' 
            });
        }
    } catch (err) {
        console.error('Forgot password error:', err);
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