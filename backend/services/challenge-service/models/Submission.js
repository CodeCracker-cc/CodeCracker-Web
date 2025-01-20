const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.ObjectId,
    ref: 'Challenge',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['python', 'javascript', 'java', 'cpp'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'error'],
    default: 'pending'
  },
  testResults: [{
    testCase: Number,
    passed: Boolean,
    output: String,
    error: String
  }],
  executionTime: Number,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema); 