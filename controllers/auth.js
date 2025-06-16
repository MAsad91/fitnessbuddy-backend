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