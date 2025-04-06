const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  notified: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure a user can only have an achievement once
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

module.exports = mongoose.model('UserAchievement', userAchievementSchema);
