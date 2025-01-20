const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Ein Titel ist erforderlich'],
    trim: true,
    minlength: [5, 'Der Titel muss mindestens 5 Zeichen lang sein'],
    maxlength: [100, 'Der Titel darf maximal 100 Zeichen lang sein']
  },
  content: {
    type: String,
    required: [true, 'Der Inhalt ist erforderlich'],
    minlength: [10, 'Der Inhalt muss mindestens 10 Zeichen lang sein'],
    maxlength: [5000, 'Der Inhalt darf maximal 5000 Zeichen lang sein']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  tags: [{
    type: String,
    maxlength: 20
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
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
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Middleware
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', postSchema); 