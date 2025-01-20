const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const TestCase = require('../models/TestCase');
const axios = require('axios');
const challengeSchemas = require('../schemas/challengeSchemas');
const validateRequest = require('../../../middleware/validateRequest');
const AppError = require('../../../utils/appError');
const config = require('../../../config');
const logger = require('../../../utils/logger');

class ChallengeController {
  async createChallenge(req, res, next) {
    try {
      const challenge = await Challenge.create({
        ...req.body,
        createdBy: req.user._id
      });

      res.status(201).json({
        status: 'success',
        data: { challenge }
      });
    } catch (err) {
      next(err);
    }
  }

  async submitSolution(req, res, next) {
    try {
      await validateRequest(challengeSchemas.submitSolution)(req, res, async () => {
        const { challengeId } = req.params;
        const { code, language } = req.body;

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
          throw new Error('Challenge nicht gefunden');
        }

        // Hole alle Testfälle für die Challenge
        const testCases = await TestCase.find({ challenge: challengeId });

        // Sende Code zur Ausführung
        const executionResult = await axios.post(
          `${process.env.EXECUTION_SERVICE_URL}/execute`,
          {
            code,
            language,
            testCases: testCases.map(tc => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              timeLimit: tc.timeLimit,
              memoryLimit: tc.memoryLimit
            }))
          }
        );

        // Wenn alle Tests bestanden wurden
        if (executionResult.data.success) {
          // Aktualisiere Benutzerstatistiken
          await axios.post(
            `${process.env.AUTH_SERVICE_URL}/api/users/updateStats`,
            {
              userId: req.user._id,
              challengePoints: challenge.points
            }
          );

          // Prüfe auf Badges
          await this.checkBadges(req.user._id, challenge);
        }

        res.status(200).json({
          status: 'success',
          data: {
            success: executionResult.data.success,
            results: executionResult.data.results.map(result => ({
              passed: result.passed,
              output: result.output,
              error: result.error,
              executionTime: result.executionTime
            })),
            points: executionResult.data.success ? challenge.points : 0
          }
        });
      });
    } catch (err) {
      next(err);
    }
  }

  async getChallenges(req, res, next) {
    try {
      const { difficulty, category, sort = '-createdAt' } = req.query;
      const query = {};

      if (difficulty) query.difficulty = difficulty;
      if (category) query.category = category;

      const challenges = await Challenge.find(query)
        .sort(sort)
        .populate('createdBy', 'username');

      res.status(200).json({
        status: 'success',
        data: { challenges }
      });
    } catch (err) {
      next(err);
    }
  }

  async getChallenge(req, res, next) {
    try {
      const challenge = await Challenge.findById(req.params.id)
        .populate('createdBy', 'username')
        .populate('ratings.user', 'username');

      if (!challenge) {
        throw new AppError('Challenge nicht gefunden', 404);
      }

      res.status(200).json({
        status: 'success',
        data: { challenge }
      });
    } catch (err) {
      next(err);
    }
  }

  async getChallengesByCategory(req, res, next) {
    try {
      const { category } = req.params;
      if (!config.challenge.categories.includes(category)) {
        throw new AppError('Ungültige Kategorie', 400);
      }

      const challenges = await Challenge.find({ category })
        .select('-testCases')
        .sort('difficulty');

      res.status(200).json({
        status: 'success',
        data: { challenges }
      });
    } catch (err) {
      next(err);
    }
  }

  async getChallengesByDifficulty(req, res, next) {
    try {
      const { level } = req.params;
      if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(level)) {
        throw new AppError('Ungültiger Schwierigkeitsgrad', 400);
      }

      const challenges = await Challenge.find({ difficulty: level })
        .select('-testCases')
        .sort('category');

      res.status(200).json({
        status: 'success',
        data: { challenges }
      });
    } catch (err) {
      next(err);
    }
  }

  async getUserSubmissions(req, res, next) {
    try {
      const submissions = await Submission.find({
        user: req.user._id,
        challenge: req.params.challengeId
      })
      .sort('-submittedAt')
      .limit(10);

      res.status(200).json({
        status: 'success',
        data: { submissions }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateChallenge(req, res, next) {
    try {
      await validateRequest(challengeSchemas.updateChallenge)(req, res, async () => {
        const { testCases, ...challengeData } = req.body;
        
        const challenge = await Challenge.findByIdAndUpdate(
          req.params.id,
          challengeData,
          { new: true, runValidators: true }
        );

        if (!challenge) {
          throw new AppError('Challenge nicht gefunden', 404);
        }

        if (testCases) {
          await TestCase.deleteMany({ challenge: challenge._id });
          await TestCase.insertMany(
            testCases.map(tc => ({ ...tc, challenge: challenge._id }))
          );
        }

        res.status(200).json({
          status: 'success',
          data: { challenge }
        });
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteChallenge(req, res, next) {
    try {
      const challenge = await Challenge.findById(req.params.id);
      
      if (!challenge) {
        throw new AppError('Challenge nicht gefunden', 404);
      }

      await Challenge.findByIdAndDelete(req.params.id);
      await TestCase.deleteMany({ challenge: req.params.id });
      await Submission.deleteMany({ challenge: req.params.id });

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (err) {
      next(err);
    }
  }

  async checkBadges(userId, challenge) {
    try {
      const userStats = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/users/stats/${userId}`
      );

      const stats = userStats.data.data.stats;
      const badges = [];

      if (stats.solvedChallenges === 1) {
        badges.push({
          type: 'achievement',
          name: 'Erste Challenge',
          description: 'Löse deine erste Challenge'
        });
      }

      if (stats.streak >= 7) {
        badges.push({
          type: 'achievement',
          name: '7-Tage Streak',
          description: 'Löse 7 Tage in Folge Challenges'
        });
      }

      if (badges.length > 0) {
        await axios.post(
          `${process.env.AUTH_SERVICE_URL}/api/users/${userId}/badges`,
          { badges }
        );
      }
    } catch (error) {
      logger.error('Fehler beim Badge-Check:', error);
    }
  }
}

module.exports = new ChallengeController(); 