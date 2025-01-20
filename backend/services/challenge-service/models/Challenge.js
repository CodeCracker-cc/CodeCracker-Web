const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['algorithmen', 'datenstrukturen', 'web', 'database', 'security']
  },
  points: {
    type: Number,
    required: true,
    min: 1
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: {
      type: Boolean,
      default: false
    }
  }],
  solutionTemplate: {
    type: String,
    required: true
  },
  supportedLanguages: [{
    type: String,
    enum: ['python', 'javascript', 'java', 'cpp']
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  completedBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    rating: Number,
    review: String
  }],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtuelle Felder
challengeSchema.virtual('completionRate').get(function() {
  if (!this.completedBy) return 0;
  return (this.completedBy.length / totalUsers) * 100;
});

// Indizes für bessere Suchperformance
challengeSchema.index({ category: 1, difficulty: 1 });
challengeSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Challenge', challengeSchema); 