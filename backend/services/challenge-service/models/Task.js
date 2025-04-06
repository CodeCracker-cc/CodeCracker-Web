const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'achievement', 'challenge'],
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  },
  reward: {
    crackers: {
      type: Number,
      default: 0
    },
    experience: {
      type: Number,
      default: 0
    }
  },
  progress: {
    current: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      required: true,
      min: 1
    }
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Methode zum Aktualisieren des Fortschritts
taskSchema.methods.updateProgress = async function(increment = 1) {
  this.progress.current += increment;
  
  // Prüfen, ob die Aufgabe abgeschlossen ist
  if (this.progress.current >= this.progress.target && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Indizes für bessere Suchperformance
taskSchema.index({ user: 1, completed: 1 });
taskSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Task', taskSchema);
