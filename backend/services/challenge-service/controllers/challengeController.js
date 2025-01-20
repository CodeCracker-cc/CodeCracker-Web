const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const axios = require('axios');

class ChallengeController {
  async createChallenge(req, res) {
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

      const submission = await Submission.create({
        user: req.user._id,
        challenge: challengeId,
        code,
        language
      });

      // Sende Code zur Ausführung an den Execution-Service
      const executionResult = await axios.post('http://execution-service:3000/execute', {
        code,
        language,
        testCases: challenge.testCases
      });

      submission.status = executionResult.data.success ? 'success' : 'failed';
      submission.testResults = executionResult.data.results;
      submission.executionTime = executionResult.data.executionTime;
      await submission.save();

      // Aktualisiere Benutzerstatistik bei erfolgreicher Lösung
      if (submission.status === 'success') {
        await axios.post('http://auth-service:3000/api/users/updateStats', {
          userId: req.user._id,
          challengeId,
          points: challenge.points
        });
      }

      res.status(200).json({
        status: 'success',
        data: { submission }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
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
}

module.exports = new ChallengeController(); 