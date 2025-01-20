const mongoose = require('mongoose');
const config = require('../../../config/serviceConfig');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  description: String,
  timeLimit: { type: Number, default: 2000 }, // in ms
  memoryLimit: { type: Number, default: 128 }, // in MB
});

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Ein Titel ist erforderlich'],
    trim: true,
    minlength: [5, 'Der Titel muss mindestens 5 Zeichen lang sein'],
    maxlength: [100, 'Der Titel darf maximal 100 Zeichen lang sein'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Eine Beschreibung ist erforderlich'],
    minlength: [20, 'Die Beschreibung muss mindestens 20 Zeichen lang sein']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  category: {
    type: String,
    required: true,
    enum: config.challenge.categories
  },
  points: {
    type: Number,
    required: true,
    min: [1, 'Mindestens 1 Punkt muss vergeben werden'],
    max: [100, 'Maximal 100 Punkte können vergeben werden']
  },
  testCases: [testCaseSchema],
  solutionTemplate: {
    type: String,
    required: [true, 'Eine Lösungsvorlage ist erforderlich']
  },
  supportedLanguages: [{
    type: String,
    enum: config.execution.supportedLanguages
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
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
  ratings: [ratingSchema],
  solvedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
challengeSchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

challengeSchema.virtual('solvedCount').get(function() {
  return this.solvedBy.length;
});

// Middleware
challengeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indizes für bessere Suchperformance
challengeSchema.index({ difficulty: 1, category: 1 });
challengeSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Challenge', challengeSchema); 