const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const TestCase = require('../models/TestCase');
const axios = require('axios');

class ChallengeController {
  async createChallenge(req, res) {
    try {
      const {
        title,
        description,
        difficulty,
        category,
        points,
        testCases,
        solutionTemplate,
        supportedLanguages
      } = req.body;

      const challenge = await Challenge.create({
        title,
        description,
        difficulty,
        category,
        points,
        solutionTemplate,
        supportedLanguages,
        createdBy: req.user._id
      });

      // Erstelle Testfälle separat
      const testCasePromises = testCases.map(testCase => 
        TestCase.create({
          ...testCase,
          challenge: challenge._id
        })
      );

      await Promise.all(testCasePromises);

      res.status(201).json({
        status: 'success',
        data: { challenge }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async submitSolution(req, res) {
    try {
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
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async checkBadges(userId, challenge) {
    try {
      // Hole Benutzerstatistiken
      const userStats = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/users/stats/${userId}`
      );

      const stats = userStats.data.data.stats;
      const badges = [];

      // Prüfe verschiedene Badge-Bedingungen
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

      // Vergebe neue Badges
      if (badges.length > 0) {
        await axios.post(
          `${process.env.AUTH_SERVICE_URL}/api/users/${userId}/badges`,
          { badges }
        );
      }
    } catch (error) {
      console.error('Fehler beim Badge-Check:', error);
    }
  }

  async getChallenges(req, res) {
    try {
      const challenges = await Challenge.find()
        .select('-testCases.expectedOutput');

      res.status(200).json({
        status: 'success',
        data: { challenges }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async getChallenge(req, res) {
    try {
      const challenge = await Challenge.findById(req.params.id)
        .populate('createdBy', 'username')
        .populate({
          path: 'testCases',
          select: '-expectedOutput -timeLimit -memoryLimit',
          match: { isHidden: false }
        });

      if (!challenge) {
        return res.status(404).json({
          status: 'error',
          message: 'Challenge nicht gefunden'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { challenge }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async getChallengesByCategory(req, res) {
    try {
      const challenges = await Challenge.find({ category: req.params.category })
        .select('-testCases')
        .sort('difficulty');

      res.status(200).json({
        status: 'success',
        data: { challenges }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async getChallengesByDifficulty(req, res) {
    try {
      const challenges = await Challenge.find({ difficulty: req.params.level })
        .select('-testCases')
        .sort('category');

      res.status(200).json({
        status: 'success',
        data: { challenges }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async getUserSubmissions(req, res) {
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
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async updateChallenge(req, res) {
    try {
      const { testCases, ...challengeData } = req.body;
      
      const challenge = await Challenge.findByIdAndUpdate(
        req.params.id,
        challengeData,
        { new: true, runValidators: true }
      );

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
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async deleteChallenge(req, res) {
    try {
      await Challenge.findByIdAndDelete(req.params.id);
      await TestCase.deleteMany({ challenge: req.params.id });
      await Submission.deleteMany({ challenge: req.params.id });

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }
}

module.exports = new ChallengeController(); 