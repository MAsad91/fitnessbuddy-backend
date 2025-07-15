// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  profilePicture: {
    url: String,
    publicId: String
  },
  progressPictures: [{
    url: String,
    publicId: String,
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    measurements: {
      weight: Number,
      bodyFat: Number,
      chest: Number,
      waist: Number,
      hips: Number,
      arms: Number,
      thighs: Number
    }
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  dailyCalorieGoal: {
    type: Number,
    default: 2000
  },
  dailyWaterGoal: {
    type: Number,
    default: 2000 // in milliliters (2L)
  },
  macroGoals: {
    protein: {
      type: Number,
      default: 30 // percentage
    },
    carbs: {
      type: Number,
      default: 40 // percentage
    },
    fats: {
      type: Number,
      default: 30 // percentage
    }
  },
  weightGoal: {
    current: {
      type: Number
    },
    target: {
      type: Number
    },
    weeklyGoal: {
      type: Number,
      default: 0.5 // kg per week
    }
  },
  settings: {
    theme: {
      mode: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
      systemDefault: {
        type: Boolean,
        default: true
      }
    },
    notifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      mealReminders: {
        type: Boolean,
        default: true
      },
      waterReminders: {
        type: Boolean,
        default: true
      },
      goalUpdates: {
        type: Boolean,
        default: true
      },
      weeklyReports: {
        type: Boolean,
        default: true
      },
      reminderTime: {
        type: String,
        default: '09:00'
      }
    },
    preferences: {
      biometricAuth: {
        enabled: {
          type: Boolean,
          default: false
        },
        lastUpdated: {
          type: Date,
          default: null
        },
        deviceId: {
          type: String,
          default: null
        }
      },
      language: {
        type: String,
        default: 'en'
      },
      measurementSystem: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric'
      },
      startOfWeek: {
        type: String,
        enum: ['monday', 'sunday'],
        default: 'monday'
      }
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      isVerified: this.isVerified 
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);