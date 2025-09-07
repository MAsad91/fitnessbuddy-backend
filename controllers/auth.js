const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const sendEmail = require('../utils/email');

// Helper function for consistent responses
const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString()
  });
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Helper function to set auth cookie
const setAuthCookie = (res, token) => {
  const options = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('token', token, options);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, {
        type: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { name, email, password, confirmPassword, dateOfBirth, gender, activityLevel } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return sendResponse(res, 400, false, 'Passwords do not match', null, {
        type: 'PASSWORD_MISMATCH'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendResponse(res, 400, false, 'User already exists with this email', null, {
        type: 'USER_EXISTS'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      activityLevel: activityLevel || 'moderate',
      emailVerificationToken,
      emailVerificationExpire,
      isEmailVerified: false,
      settings: {
        notifications: {
          enabled: true,
          mealReminders: true,
          workoutReminders: true
        },
        privacy: {
          profileVisibility: 'private'
        },
        preferences: {
          units: 'metric',
          language: 'en'
        }
      }
    });

    // Send verification email
    try {
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
      
      await sendEmail({
        email: user.email,
        subject: 'Verify Your Email - Fitness Buddy',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3CB7DD;">Welcome to Fitness Buddy!</h2>
            <p>Hi ${user.name},</p>
            <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #3CB7DD; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <p>Best regards,<br>The Fitness Buddy Team</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail registration if email fails - user can request new verification
    }

    // Generate token
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    // Remove sensitive data from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      activityLevel: user.activityLevel,
      createdAt: user.createdAt,
      settings: user.settings
    };

    sendResponse(res, 201, true, 'User registered successfully. Please check your email for verification.', {
      user: userResponse,
      token,
      requiresEmailVerification: !user.isEmailVerified
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific database errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return sendResponse(res, 400, false, `${field} already exists`, null, {
        type: 'DUPLICATE_FIELD',
        field
      });
    }

    sendResponse(res, 500, false, 'Server error during registration', null, {
      type: 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, {
        type: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { email, password, rememberMe } = req.body;

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials', null, {
        type: 'INVALID_CREDENTIALS'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, false, 'Invalid credentials', null, {
        type: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token with appropriate expiration
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: tokenExpiry,
    });

    // Set cookie with appropriate expiration
    const cookieExpiry = rememberMe ? 30 : 7;
    const cookieOptions = {
      expires: new Date(Date.now() + cookieExpiry * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };
    res.cookie('token', token, cookieOptions);

    // Remove sensitive data from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      activityLevel: user.activityLevel,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      settings: user.settings
    };

    sendResponse(res, 200, true, 'Login successful', {
      user: userResponse,
      token,
      expiresIn: tokenExpiry,
      requiresEmailVerification: !user.isEmailVerified
    });

  } catch (error) {
    console.error('Login error:', error);
    sendResponse(res, 500, false, 'Server error during login', null, {
      type: 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Clear the cookie
    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    sendResponse(res, 200, true, 'Logout successful');

  } catch (error) {
    console.error('Logout error:', error);
    sendResponse(res, 500, false, 'Server error during logout', null, {
      type: 'SERVER_ERROR'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found', null, {
        type: 'USER_NOT_FOUND'
      });
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      activityLevel: user.activityLevel,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      settings: user.settings
    };

    sendResponse(res, 200, true, 'User data retrieved successfully', {
      user: userResponse
    });

  } catch (error) {
    console.error('Get me error:', error);
    sendResponse(res, 500, false, 'Server error retrieving user data', null, {
      type: 'SERVER_ERROR'
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return sendResponse(res, 400, false, 'Invalid verification token', null, {
        type: 'INVALID_TOKEN'
      });
    }

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return sendResponse(res, 400, false, 'Invalid or expired verification token', null, {
        type: 'TOKEN_EXPIRED'
      });
    }

    // Verify the email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    // If this is a web request, redirect to success page
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect(`/email-verification-success?verified=true`);
    }

    sendResponse(res, 200, true, 'Email verified successfully', {
      emailVerified: true
    });

  } catch (error) {
    console.error('Email verification error:', error);
    sendResponse(res, 500, false, 'Server error during email verification', null, {
      type: 'SERVER_ERROR'
    });
  }
};

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
// @access  Private
const resendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found', null, {
        type: 'USER_NOT_FOUND'
      });
    }

    if (user.isEmailVerified) {
      return sendResponse(res, 400, false, 'Email already verified', null, {
        type: 'ALREADY_VERIFIED'
      });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpire = emailVerificationExpire;
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email - Fitness Buddy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3CB7DD;">Email Verification</h2>
          <p>Hi ${user.name},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #3CB7DD; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The Fitness Buddy Team</p>
        </div>
      `
    });

    sendResponse(res, 200, true, 'Verification email sent successfully');

  } catch (error) {
    console.error('Resend verification error:', error);
    sendResponse(res, 500, false, 'Error sending verification email', null, {
      type: 'EMAIL_ERROR'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, {
        type: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always send success response to prevent email enumeration
    if (!user) {
      return sendResponse(res, 200, true, 'If an account with that email exists, we sent a password reset link');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save({ validateBeforeSave: false });

    // Send reset email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset - Fitness Buddy',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3CB7DD;">Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #3CB7DD; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>This link will expire in 15 minutes for security reasons.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>The Fitness Buddy Team</p>
          </div>
        `
      });

      sendResponse(res, 200, true, 'Password reset email sent');

    } catch (emailError) {
      console.error('Password reset email error:', emailError);
      
      // Clear reset fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      sendResponse(res, 500, false, 'Error sending password reset email', null, {
        type: 'EMAIL_ERROR'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    sendResponse(res, 500, false, 'Server error processing password reset request', null, {
      type: 'SERVER_ERROR'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, {
        type: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { password, confirmPassword } = req.body;
    const { resetToken } = req.params;

    if (password !== confirmPassword) {
      return sendResponse(res, 400, false, 'Passwords do not match', null, {
        type: 'PASSWORD_MISMATCH'
      });
    }

    // Hash the token to compare with stored version
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return sendResponse(res, 400, false, 'Invalid or expired reset token', null, {
        type: 'INVALID_TOKEN'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate new token for immediate login
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    sendResponse(res, 200, true, 'Password reset successful', {
      token,
      message: 'You are now logged in with your new password'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    sendResponse(res, 500, false, 'Server error during password reset', null, {
      type: 'SERVER_ERROR'
    });
  }
};

// @desc    Change password (authenticated user)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, {
        type: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Check current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return sendResponse(res, 400, false, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendResponse(res, 200, true, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    sendResponse(res, 500, false, 'Server error changing password', null, {
      type: 'SERVER_ERROR'
    });
  }
};

// @desc    Enable biometric authentication
// @route   POST /api/auth/biometric/enable
// @access  Private
const enableBiometric = async (req, res) => {
  try {
    const { biometricData, deviceId } = req.body;
    
    if (!biometricData) {
      return sendResponse(res, 400, false, 'Biometric data is required', null, {
        type: 'MISSING_DATA'
      });
    }

    // Update user's biometric settings
    const user = await User.findById(req.user.id);
    if (!user.settings) user.settings = {};
    if (!user.settings.privacy) user.settings.privacy = {};
    
    user.settings.privacy.biometricAuth = {
      enabled: true,
      lastUpdated: new Date(),
      deviceId: deviceId || null
    };
    await user.save();

    sendResponse(res, 200, true, 'Biometric authentication enabled successfully');
  } catch (error) {
    console.error('Enable biometric error:', error);
    sendResponse(res, 500, false, 'Server error during biometric setup', null, {
      type: 'SERVER_ERROR'
    });
  }
};

// @desc    Disable biometric authentication
// @route   POST /api/auth/biometric/disable
// @access  Private
const disableBiometric = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.settings) user.settings = {};
    if (!user.settings.privacy) user.settings.privacy = {};
    
    user.settings.privacy.biometricAuth = {
      enabled: false,
      lastUpdated: new Date(),
      deviceId: null
    };
    await user.save();

    sendResponse(res, 200, true, 'Biometric authentication disabled successfully');
  } catch (error) {
    console.error('Disable biometric error:', error);
    sendResponse(res, 500, false, 'Server error during biometric disable', null, {
      type: 'SERVER_ERROR'
    });
  }
};

// @desc    Get biometric status
// @route   GET /api/auth/biometric/status
// @access  Private
const getBiometricStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const biometricAuth = user.settings?.privacy?.biometricAuth || {};
    
    sendResponse(res, 200, true, 'Biometric status retrieved', {
      enabled: biometricAuth.enabled || false,
      lastUpdated: biometricAuth.lastUpdated,
      deviceId: biometricAuth.deviceId
    });
  } catch (error) {
    console.error('Get biometric status error:', error);
    sendResponse(res, 500, false, 'Server error getting biometric status', null, {
      type: 'SERVER_ERROR'
    });
  }
};

// @desc    Get user settings
// @route   GET /api/auth/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    sendResponse(res, 200, true, 'Settings retrieved successfully', {
      settings: user.settings || {}
    });
  } catch (error) {
    console.error('Get settings error:', error);
    sendResponse(res, 500, false, 'Server error getting settings', null, {
      type: 'SERVER_ERROR'
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/auth/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return sendResponse(res, 400, false, 'Settings object is required', null, {
        type: 'INVALID_DATA'
      });
    }

    const user = await User.findById(req.user.id);
    user.settings = { ...user.settings, ...settings };
    await user.save();

    sendResponse(res, 200, true, 'Settings updated successfully', {
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    sendResponse(res, 500, false, 'Server error updating settings', null, {
      type: 'SERVER_ERROR'
    });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
  try {
    // This function is called after successful Google OAuth
    const token = generateToken(req.user._id);
    setAuthCookie(res, token);
    
    // Redirect to mobile app or return token
    res.redirect(`fitnessbuddy://auth?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('/login?error=oauth_failed');
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  resendEmailVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  enableBiometric,
  disableBiometric,
  getBiometricStatus,
  getSettings,
  updateSettings,
  googleCallback
};