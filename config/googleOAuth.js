const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Configure Google OAuth Strategy only if client ID is provided
if (process.env.GOOGLE_CLIENT_ID) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '', // Allow empty client secret for Android
        callbackURL: "/api/auth/google/callback",
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            // User exists, return user
            return done(null, user);
        }
        
        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
            // User exists with email but no googleId, update with googleId
            user.googleId = profile.id;
            user.isVerified = true; // Google users are pre-verified
            await user.save();
            return done(null, user);
        }
        
        // Create new user
        const newUser = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName || profile.emails[0].value.split('@')[0],
            isVerified: true, // Google users are pre-verified
            profilePicture: profile.photos[0]?.value,
            authProvider: 'google'
        });
        
        await newUser.save();
        return done(null, newUser);
        
    } catch (error) {
        return done(error, null);
    }
    }));
} else {
    console.log('⚠️ Google OAuth not configured. Set GOOGLE_CLIENT_ID to enable Google Sign-in.');
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport; 