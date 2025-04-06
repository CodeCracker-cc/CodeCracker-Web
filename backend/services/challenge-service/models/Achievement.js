const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ein Name ist erforderlich'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Eine Beschreibung ist erforderlich']
  },
  icon: {
    type: String,
    default: 'trophy'
  },
  category: {
    type: String,
    enum: ['streak', 'challenge', 'community', 'special'],
    required: true
  },
  requirement: {
    type: Number,
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indizes für bessere Suchperformance
achievementSchema.index({ category: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
