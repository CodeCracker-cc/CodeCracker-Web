const mongoose = require('mongoose');

const executionResultSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Submission'
  },
  language: {
    type: String,
    required: true,
    enum: ['python', 'javascript', 'java', 'cpp']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'running', 'success', 'failed', 'error']
  },
  results: [{
    testCase: {
      input: String,
      expectedOutput: String
    },
    passed: Boolean,
    output: String,
    error: String,
    executionTime: Number,
    memoryUsage: Number
  }],
  totalExecutionTime: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExecutionResult', executionResultSchema); 