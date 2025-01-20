const express = require('express');
const challengeController = require('../controllers/challengeController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Öffentliche Routen
router.get('/challenges', challengeController.getChallenges);
router.get('/challenges/:id', challengeController.getChallenge);
router.get('/challenges/category/:category', challengeController.getChallengesByCategory);
router.get('/challenges/difficulty/:level', challengeController.getChallengesByDifficulty);

// Geschützte Routen
router.use(authMiddleware.protect);

router.post('/challenges/:challengeId/submit', challengeController.submitSolution);
router.get('/challenges/:challengeId/submissions', challengeController.getUserSubmissions);

// Admin/Moderator Routen
router.use(authMiddleware.restrictTo('admin', 'moderator'));

router.post('/challenges', challengeController.createChallenge);
router.patch('/challenges/:id', challengeController.updateChallenge);
router.delete('/challenges/:id', challengeController.deleteChallenge);

module.exports = router; 