const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  challenge: {
    type: mongoose.Schema.ObjectId,
    ref: 'Challenge',
    required: true
  },
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  timeLimit: {
    type: Number,
    default: 2000 // 2 Sekunden
  },
  memoryLimit: {
    type: Number,
    default: 50 // 50MB
  }
});

module.exports = mongoose.model('TestCase', testCaseSchema); 