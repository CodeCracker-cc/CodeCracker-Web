const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const Streak = require('../models/Streak');
const Cracker = require('../models/Cracker');
const Task = require('../models/Task');
const Challenge = require('../models/Challenge');
const AppError = require('../../../utils/appError');
const logger = require('../../../utils/logger');
const mongoose = require('mongoose');

class DashboardController {
  // Achievement-Methoden
  async getAchievements(req, res, next) {
    try {
      const achievements = await Achievement.find();
      
      res.json({
        status: 'success',
        results: achievements.length,
        data: { achievements }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserAchievements(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      
      const userAchievements = await UserAchievement.find({ user: userId })
        .populate('achievement')
        .sort('-unlockedAt');
      
      res.json({
        status: 'success',
        results: userAchievements.length,
        data: { achievements: userAchievements }
      });
    } catch (error) {
      next(error);
    }
  }

  async checkAndUpdateAchievements(userId) {
    try {
      // Alle Achievements abrufen
      const achievements = await Achievement.find();
      
      // Bereits freigeschaltete Achievements des Benutzers abrufen
      const userAchievements = await UserAchievement.find({ user: userId })
        .populate('achievement');
      
      const unlockedAchievementIds = userAchievements.map(ua => ua.achievement._id.toString());
      
      // Benutzerstatistiken abrufen
      const streak = await Streak.findOne({ user: userId });
      
      // Anzahl der gelösten Challenges abrufen
      const solvedChallenges = await Challenge.countDocuments({
        'solvedBy': userId
      });
      
      // Neue Achievements prüfen und freischalten
      const newAchievements = [];
      
      for (const achievement of achievements) {
        if (unlockedAchievementIds.includes(achievement._id.toString())) {
          continue; // Achievement bereits freigeschaltet
        }
        
        let unlocked = false;
        
        switch (achievement.category) {
          case 'streak':
            if (streak && streak.currentStreak >= achievement.requirement) {
              unlocked = true;
            }
            break;
          case 'challenge':
            if (solvedChallenges >= achievement.requirement) {
              unlocked = true;
            }
            break;
          // Weitere Kategorien können hier hinzugefügt werden
        }
        
        if (unlocked) {
          // Achievement freischalten
          const userAchievement = await UserAchievement.create({
            user: userId,
            achievement: achievement._id,
            unlockedAt: new Date()
          });
          
          // Crackers für das Achievement hinzufügen
          await this.addCrackersToUser(
            userId, 
            achievement.points, 
            'achievement', 
            `Achievement freigeschaltet: ${achievement.name}`
          );
          
          newAchievements.push({
            ...achievement.toObject(),
            unlockedAt: userAchievement.unlockedAt
          });
        }
      }
      
      return newAchievements;
    } catch (error) {
      logger.error('Fehler beim Prüfen und Aktualisieren von Achievements:', error);
      return [];
    }
  }

  // Streak-Methoden
  async getUserStreak(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      
      let streak = await Streak.findOne({ user: userId });
      
      if (!streak) {
        streak = await Streak.create({ user: userId });
      }
      
      res.json({
        status: 'success',
        data: { streak }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStreak(userId) {
    try {
      let streak = await Streak.findOne({ user: userId });
      
      if (!streak) {
        streak = await Streak.create({ user: userId });
      }
      
      await streak.updateStreak();
      
      // Crackers für Streak-Fortsetzung hinzufügen
      if (streak.currentStreak > 1) {
        const streakBonus = Math.min(streak.currentStreak, 30); // Maximal 30 Crackers pro Tag
        await this.addCrackersToUser(
          userId, 
          streakBonus, 
          'streak', 
          `${streak.currentStreak}-Tage Streak Bonus`
        );
      }
      
      return streak;
    } catch (error) {
      logger.error('Fehler beim Aktualisieren des Streaks:', error);
      return null;
    }
  }

  // Cracker-Methoden
  async getUserCrackers(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      
      let crackers = await Cracker.findOne({ user: userId });
      
      if (!crackers) {
        crackers = await Cracker.create({ user: userId });
      }
      
      res.json({
        status: 'success',
        data: { crackers }
      });
    } catch (error) {
      next(error);
    }
  }

  async getCrackerTransactions(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const { limit = 10, page = 1 } = req.query;
      
      const crackers = await Cracker.findOne({ user: userId });
      
      if (!crackers) {
        return next(new AppError('Keine Cracker-Daten gefunden', 404));
      }
      
      // Paginierte Transaktionen
      const skip = (page - 1) * limit;
      const transactions = crackers.transactions
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(skip, skip + parseInt(limit));
      
      res.json({
        status: 'success',
        results: transactions.length,
        totalTransactions: crackers.transactions.length,
        currentPage: parseInt(page),
        totalPages: Math.ceil(crackers.transactions.length / limit),
        data: { 
          amount: crackers.amount,
          transactions 
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async addCrackersToUser(userId, amount, source, description) {
    try {
      let crackers = await Cracker.findOne({ user: userId });
      
      if (!crackers) {
        crackers = await Cracker.create({ user: userId });
      }
      
      await crackers.addCrackers(amount, source, description);
      
      return crackers;
    } catch (error) {
      logger.error('Fehler beim Hinzufügen von Crackers:', error);
      return null;
    }
  }

  async spendCrackers(req, res, next) {
    try {
      const { amount, source, description } = req.body;
      
      if (!amount || amount <= 0) {
        return next(new AppError('Ungültiger Betrag', 400));
      }
      
      let crackers = await Cracker.findOne({ user: req.user.id });
      
      if (!crackers) {
        return next(new AppError('Keine Cracker-Daten gefunden', 404));
      }
      
      if (crackers.amount < amount) {
        return next(new AppError('Nicht genügend Crackers', 400));
      }
      
      await crackers.spendCrackers(amount, source || 'other', description || 'Crackers ausgegeben');
      
      res.json({
        status: 'success',
        data: { 
          amount: crackers.amount,
          spent: amount 
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Task-Methoden
  async getUserTasks(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const { completed = 'false' } = req.query;
      
      const query = { 
        user: userId,
        completed: completed === 'true'
      };
      
      // Abgelaufene Tasks ausschließen
      if (completed === 'false') {
        query.expiresAt = { $gt: new Date() };
      }
      
      const tasks = await Task.find(query)
        .populate('challenge', 'title difficulty category points')
        .populate('achievement', 'name description icon category')
        .sort({ createdAt: -1 });
      
      res.json({
        status: 'success',
        results: tasks.length,
        data: { tasks }
      });
    } catch (error) {
      next(error);
    }
  }

  async completeTask(req, res, next) {
    try {
      const { taskId } = req.params;
      
      const task = await Task.findOne({ 
        _id: taskId,
        user: req.user.id,
        completed: false
      });
      
      if (!task) {
        return next(new AppError('Aufgabe nicht gefunden oder bereits abgeschlossen', 404));
      }
      
      // Prüfen, ob die Aufgabe abgelaufen ist
      if (task.expiresAt && task.expiresAt < new Date()) {
        return next(new AppError('Aufgabe ist abgelaufen', 400));
      }
      
      // Aufgabe als abgeschlossen markieren
      task.completed = true;
      task.completedAt = new Date();
      await task.save();
      
      // Belohnungen hinzufügen
      if (task.reward.crackers > 0) {
        await this.addCrackersToUser(
          req.user.id,
          task.reward.crackers,
          'task',
          `Aufgabe abgeschlossen: ${task.title}`
        );
      }
      
      res.json({
        status: 'success',
        data: { 
          task,
          rewards: {
            crackers: task.reward.crackers,
            experience: task.reward.experience
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Dashboard-Daten
  async getDashboardData(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      
      // Streak abrufen oder erstellen
      let streak = await Streak.findOne({ user: userId });
      if (!streak) {
        streak = await Streak.create({ user: userId });
      }
      
      // Crackers abrufen oder erstellen
      let crackers = await Cracker.findOne({ user: userId });
      if (!crackers) {
        crackers = await Cracker.create({ user: userId });
      }
      
      // Achievements abrufen
      const userAchievements = await UserAchievement.find({ user: userId })
        .populate('achievement')
        .sort('-unlockedAt')
        .limit(5);
      
      // Offene Tasks abrufen
      const tasks = await Task.find({ 
        user: userId,
        completed: false,
        expiresAt: { $gt: new Date() }
      })
      .populate('challenge', 'title difficulty category points')
      .populate('achievement', 'name description icon category')
      .sort({ createdAt: -1 })
      .limit(5);
      
      // Gelöste Challenges zählen
      const solvedChallenges = await Challenge.countDocuments({
        'solvedBy': userId
      });
      
      // Neueste gelöste Challenges abrufen
      const recentChallenges = await Challenge.find({
        'solvedBy': userId
      })
      .sort({ 'completedBy.completedAt': -1 })
      .limit(3)
      .select('title difficulty category points');
      
      res.json({
        status: 'success',
        data: {
          streak: {
            current: streak.currentStreak,
            max: streak.maxStreak,
            lastActivity: streak.lastActivity
          },
          crackers: crackers.amount,
          achievements: userAchievements,
          tasks,
          stats: {
            solvedChallenges,
            recentChallenges
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Hilfsmethode zum Generieren täglicher Tasks
  async generateDailyTasks(userId) {
    try {
      // Prüfen, ob bereits tägliche Aufgaben für heute existieren
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const existingTasks = await Task.find({
        user: userId,
        type: 'daily',
        createdAt: { $gte: today }
      });
      
      if (existingTasks.length > 0) {
        return; // Bereits Aufgaben für heute generiert
      }
      
      // Zufällige Challenges für tägliche Aufgaben auswählen
      const challenges = await Challenge.aggregate([
        { $sample: { size: 3 } },
        { $project: { _id: 1, title: 1, difficulty: 1, category: 1, points: 1 } }
      ]);
      
      // Tägliche Aufgaben erstellen
      const tasks = [];
      
      // Aufgabe 1: Eine Challenge lösen
      tasks.push({
        user: userId,
        title: 'Tägliche Challenge',
        description: 'Löse eine beliebige Challenge',
        type: 'daily',
        reward: {
          crackers: 10,
          experience: 5
        },
        progress: {
          current: 0,
          target: 1
        },
        expiresAt: tomorrow
      });
      
      // Aufgabe 2: Spezifische Challenge lösen
      if (challenges.length > 0) {
        tasks.push({
          user: userId,
          title: `Löse "${challenges[0].title}"`,
          description: `Löse die Challenge "${challenges[0].title}"`,
          type: 'daily',
          challenge: challenges[0]._id,
          reward: {
            crackers: 15,
            experience: 10
          },
          progress: {
            current: 0,
            target: 1
          },
          expiresAt: tomorrow
        });
      }
      
      // Aufgabe 3: Streak fortsetzen
      tasks.push({
        user: userId,
        title: 'Streak fortsetzen',
        description: 'Setze deinen täglichen Streak fort',
        type: 'daily',
        reward: {
          crackers: 5,
          experience: 3
        },
        progress: {
          current: 0,
          target: 1
        },
        expiresAt: tomorrow
      });
      
      // Aufgaben in der Datenbank speichern
      await Task.insertMany(tasks);
      
      return tasks;
    } catch (error) {
      logger.error('Fehler beim Generieren täglicher Aufgaben:', error);
      return [];
    }
  }
}

module.exports = new DashboardController();
