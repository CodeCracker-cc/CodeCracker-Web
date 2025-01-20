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
    // Implementierung für Benutzerstatistiken
  }

  async getBadges(req, res, next) {
    // Implementierung für Benutzer-Badges
  }
}

module.exports = new UserController(); 