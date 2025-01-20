const User = require('../models/User');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../../../utils/appError');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Bitte nur Bilder hochladen.'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

class UserController {
  uploadProfileImage = upload.single('profileImage');

  async updateProfile(req, res) {
    try {
      const allowedFields = ['bio', 'preferences'];
      const updateData = {};

      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = req.body[key];
        }
      });

      if (req.file) {
        // Bildverarbeitung
        const filename = `user-${req.user._id}-${Date.now()}.jpeg`;
        await sharp(req.file.buffer)
          .resize(500, 500)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/images/profiles/${filename}`);

        updateData.profileImage = filename;
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            username: user.username,
            profileImage: user.profileImage,
            bio: user.bio,
            preferences: user.preferences,
            stats: user.stats,
            badges: user.badges
          }
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id)
        .populate('badges')
        .populate('completedChallenges');

      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }

  async updatePreferences(req, res) {
    try {
      const { theme, language, notifications } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          'preferences.theme': theme,
          'preferences.language': language,
          'preferences.notifications': notifications
        },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        status: 'success',
        data: {
          preferences: user.preferences
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async getStats(req, res) {
    try {
      const user = await User.findById(req.params.userId)
        .select('stats badges username');

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Benutzer nicht gefunden'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          username: user.username,
          stats: user.stats,
          badges: user.badges
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
  }

  async updateStats(req, res, next) {
    try {
      const { userId, challengePoints } = req.body;
      
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('Benutzer nicht gefunden', 404);
      }

      // Aktualisiere Statistiken
      user.stats.totalPoints += challengePoints;
      user.stats.solvedChallenges += 1;
      
      // Prüfe und aktualisiere Streak
      const lastActivity = new Date(user.stats.lastActivity);
      const today = new Date();
      const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.stats.streak += 1;
      } else if (diffDays > 1) {
        user.stats.streak = 1;
      }
      
      user.stats.lastActivity = today;

      // Aktualisiere Rang basierend auf Punkten
      await user.updateRank();
      
      await user.save();

      res.status(200).json({
        status: 'success',
        data: { stats: user.stats }
      });
    } catch (err) {
      next(err);
    }
  }

  async getBadges(req, res, next) {
    try {
      const user = await User.findById(req.params.userId)
        .populate('badges');

      if (!user) {
        throw new AppError('Benutzer nicht gefunden', 404);
      }

      res.status(200).json({
        status: 'success',
        data: { badges: user.badges }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController(); 