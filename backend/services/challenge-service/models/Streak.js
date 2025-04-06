const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  maxStreak: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  streakHistory: [{
    date: {
      type: Date,
      required: true
    },
    challengesSolved: {
      type: Number,
      default: 1
    }
  }]
}, {
  timestamps: true
});

// Methode zum Aktualisieren des Streaks
streakSchema.methods.updateStreak = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivityDate = new Date(this.lastActivity);
  lastActivityDate.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Prüfen, ob der Benutzer heute bereits aktiv war
  if (lastActivityDate.getTime() === today.getTime()) {
    // Bereits heute aktiv, nur Aktivitätszähler erhöhen
    const todayHistory = this.streakHistory.find(
      h => new Date(h.date).setHours(0, 0, 0, 0) === today.getTime()
    );
    
    if (todayHistory) {
      todayHistory.challengesSolved += 1;
    } else {
      this.streakHistory.push({
        date: today,
        challengesSolved: 1
      });
    }
  } 
  // Prüfen, ob der Benutzer gestern aktiv war (Streak fortsetzen)
  else if (lastActivityDate.getTime() === yesterday.getTime()) {
    this.currentStreak += 1;
    this.streakHistory.push({
      date: today,
      challengesSolved: 1
    });
  } 
  // Streak unterbrochen, neu starten
  else {
    this.currentStreak = 1;
    this.streakHistory = [{
      date: today,
      challengesSolved: 1
    }];
  }
  
  // Max-Streak aktualisieren, wenn nötig
  if (this.currentStreak > this.maxStreak) {
    this.maxStreak = this.currentStreak;
  }
  
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('Streak', streakSchema);
