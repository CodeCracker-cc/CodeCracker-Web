const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const authSchemas = require('../schemas/authSchemas');
const validateRequest = require('../../../middleware/validateRequest');
const AppError = require('../../../utils/appError');

class AuthController {
  async register(req, res, next) {
    try {
      await validateRequest(authSchemas.register)(req, res, async () => {
        const { email, password, username } = req.body;

        // Prüfe ob Benutzer bereits existiert
        const existingUser = await User.findOne({ 
          $or: [{ email }, { username }] 
        });

        if (existingUser) {
          throw new AppError('E-Mail oder Benutzername bereits vergeben', 400);
        }

        const user = await User.create({
          email,
          password,
          username
        });

        const token = user.generateAuthToken();

        res.status(201).json({
          status: 'success',
          data: {
            user: {
              id: user._id,
              username: user.username,
              email: user.email
            },
            token
          }
        });
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      await validateRequest(authSchemas.login)(req, res, async () => {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
          throw new AppError('Ungültige E-Mail oder Passwort', 401);
        }

        const token = user.generateAuthToken();

        res.status(200).json({
          status: 'success',
          data: {
            user: {
              id: user._id,
              username: user.username,
              email: user.email
            },
            token
          }
        });
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyToken(req, res) {
    try {
      const { token } = req.body;
      
      if (!token) {
        throw new Error('Token ist erforderlich');
      }

      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new Error('Der Benutzer existiert nicht mehr');
      }

      res.status(200).json({
        status: 'success',
        user: {
          _id: user._id,
          username: user.username,
          role: user.role
        }
      });
    } catch (err) {
      res.status(401).json({
        status: 'error',
        message: 'Ungültiger Token'
      });
    }
  }

  signToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }

  async updateProfile(req, res, next) {
    try {
      await validateRequest(authSchemas.updateProfile)(req, res, async () => {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(
          req.user._id,
          updates,
          { new: true, runValidators: true }
        );

        res.status(200).json({
          status: 'success',
          data: {
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              bio: user.bio,
              preferences: user.preferences
            }
          }
        });
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController(); 