const mongoose = require('mongoose');

const crackerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    default: 0
  },
  transactions: [{
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['earned', 'spent'],
      required: true
    },
    source: {
      type: String,
      enum: ['challenge', 'achievement', 'streak', 'purchase', 'admin', 'other'],
      required: true
    },
    description: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Methode zum Hinzufügen von Crackers
crackerSchema.methods.addCrackers = async function(amount, source, description) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  this.amount += amount;
  this.transactions.push({
    amount,
    type: 'earned',
    source,
    description
  });

  return this.save();
};

// Methode zum Ausgeben von Crackers
crackerSchema.methods.spendCrackers = async function(amount, source, description) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  if (this.amount < amount) {
    throw new Error('Insufficient crackers');
  }

  this.amount -= amount;
  this.transactions.push({
    amount,
    type: 'spent',
    source,
    description
  });

  return this.save();
};

module.exports = mongoose.model('Cracker', crackerSchema);
