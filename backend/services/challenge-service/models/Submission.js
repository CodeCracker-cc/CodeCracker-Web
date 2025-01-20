const mongoose = require('mongoose');
const config = require('../../../config/serviceConfig');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  code: {
    type: String,
    required: [true, 'Code ist erforderlich'],
    maxlength: [10000, 'Code darf maximal 10000 Zeichen lang sein']
  },
  language: {
    type: String,
    required: true,
    enum: config.execution.supportedLanguages
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'success', 'failed', 'error'],
    default: 'pending'
  },
  executionResult: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExecutionResult'
  },
  passedTestCases: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    required: true
  },
  executionTime: {
    type: Number,
    default: 0
  },
  memoryUsage: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
submissionSchema.virtual('successRate').get(function() {
  if (this.totalTestCases === 0) return 0;
  return ((this.passedTestCases / this.totalTestCases) * 100).toFixed(1);
});

// Indexes
submissionSchema.index({ user: 1, challenge: 1, submittedAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema); 