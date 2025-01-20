const express = require('express');
const challengeController = require('../controllers/challengeController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', challengeController.getChallenges);

router.use(authMiddleware.protect);

router.post('/', 
  authMiddleware.restrictTo('admin', 'moderator'),
  challengeController.createChallenge
);

router.post('/:challengeId/submit', challengeController.submitSolution);

module.exports = router; 