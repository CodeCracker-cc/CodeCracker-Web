const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email ist erforderlich'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Passwort ist erforderlich'],
    minlength: 8,
    select: false
  },
  username: {
    type: String,
    required: [true, 'Benutzername ist erforderlich'],
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  profileImage: {
    type: String,
    default: 'default.jpg'
  },
  bio: {
    type: String,
    maxLength: 500
  },
  stats: {
    solvedChallenges: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    rank: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  badges: [{
    type: {
      type: String,
      enum: ['achievement', 'rank', 'special']
    },
    name: String,
    description: String,
    dateEarned: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['de', 'en'],
      default: 'de'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  twoFactorSecret: {
    type: String,
    select: false  // Nicht in normalen Queries zurückgeben
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.updateStats = async function(challengePoints) {
  this.stats.totalPoints += challengePoints;
  this.stats.solvedChallenges += 1;
  this.stats.lastActive = Date.now();
  
  const lastActiveDate = new Date(this.stats.lastActive);
  const today = new Date();
  const diffDays = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    this.stats.streak += 1;
  } else {
    this.stats.streak = 1;
  }
  
  await this.save();
};

userSchema.methods.addBadge = async function(badgeData) {
  this.badges.push(badgeData);
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 