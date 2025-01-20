const mongoose = require('mongoose');

const executionResultSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  language: {
    type: String,
    enum: ['python', 'javascript', 'java', 'cpp'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'error'],
    required: true
  },
  results: [{
    testCase: Number,
    passed: Boolean,
    output: String,
    error: String,
    executionTime: Number
  }],
  totalExecutionTime: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExecutionResult', executionResultSchema); 