const Challenge = require('../models/Challenge');

class RatingController {
  async rateChallenge(req, res) {
    try {
      const { rating, review } = req.body;
      const { challengeId } = req.params;

      const challenge = await Challenge.findById(challengeId);
      
      if (!challenge) {
        return res.status(404).json({
          status: 'error',
          message: 'Challenge nicht gefunden'
        });
      }

      // Prüfe ob der User die Challenge bereits abgeschlossen hat
      const hasCompleted = challenge.completedBy.some(
        completion => completion.user.toString() === req.user._id.toString()
      );

      if (!hasCompleted) {
        return res.status(403).json({
          status: 'error',
          message: 'Sie müssen die Challenge erst abschließen, bevor Sie sie bewerten können'
        });
      }

      // Entferne alte Bewertung falls vorhanden
      challenge.ratings = challenge.ratings.filter(
        r => r.user.toString() !== req.user._id.toString()
      );

      // Füge neue Bewertung hinzu
      challenge.ratings.push({
        user: req.user._id,
        rating,
        review
      });

      // Berechne Durchschnittsbewertung
      challenge.averageRating = challenge.ratings.reduce(
        (acc, curr) => acc + curr.rating, 0
      ) / challenge.ratings.length;

      await challenge.save();

      res.status(200).json({
        status: 'success',
        data: {
          rating: rating,
          averageRating: challenge.averageRating
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async getChallengeRatings(req, res) {
    try {
      const challenge = await Challenge.findById(req.params.challengeId)
        .populate('ratings.user', 'username');

      if (!challenge) {
        return res.status(404).json({
          status: 'error',
          message: 'Challenge nicht gefunden'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          ratings: challenge.ratings,
          averageRating: challenge.averageRating
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }
}

module.exports = new RatingController(); 