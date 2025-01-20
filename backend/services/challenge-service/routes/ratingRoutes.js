const express = require('express');
const authMiddleware = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

const router = express.Router();

router.use(authMiddleware.protect);

router.post('/challenges/:challengeId/rate', ratingController.rateChallenge);
router.get('/challenges/:challengeId/ratings', ratingController.getChallengeRatings);
router.delete('/challenges/:challengeId/ratings/:ratingId', 
  authMiddleware.isAuthor, 
  ratingController.deleteRating
);

module.exports = router; 