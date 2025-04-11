const mongoose = require('mongoose');

// Newsletter Schema
const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Bitte gib eine gültige E-Mail-Adresse ein']
  },
  subscribeDate: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true
  }
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = { Newsletter };
