const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const config = require('../config');
const { promisify } = require('util');
const QRCode = require('qrcode');
const authSchemas = require('../schemas/authSchemas');
const validateRequest = require('../../../middleware/validateRequest');
const speakeasy = require('speakeasy');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, username } = req.body;

      // Prüfe ob Benutzer bereits existiert
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (existingUser) {
        return next(new AppError(
          'Ein Benutzer mit dieser Email oder diesem Benutzernamen existiert bereits',
          400
        ));
      }

      // Hash das Passwort
      const hashedPassword = await bcrypt.hash(password, 12);

      // Erstelle neuen Benutzer
      const user = await User.create({
        email,
        password: hashedPassword,
        username,
        preferences: {
          theme: 'light',
          language: 'de',
          notifications: {
            email: true,
            push: true
          }
        }
      });

      // Generiere Token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Entferne Password aus Response
      user.password = undefined;

      res.status(201).json({
        status: 'success',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Prüfe ob Email und Passwort angegeben wurden
      if (!email || !password) {
        return next(new AppError('Bitte Email und Passwort angeben', 400));
      }

      // Hole Benutzer mit Passwort
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Falsche Email oder Passwort', 401));
      }

      // Prüfe ob 2FA aktiviert ist
      if (user.twoFactorEnabled) {
        return res.json({
          status: 'success',
          requires2FA: true,
          tempToken: jwt.sign(
            { id: user._id, temp: true },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
          )
        });
      }

      // Generiere Token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Entferne Password aus Response
      user.password = undefined;

      res.json({
        status: 'success',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await User.findById(req.user.id)
        .populate('badges')
        .select('-password');

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req, res, next) {
    try {
      // Verhindere Passwort Update über diese Route
      if (req.body.password) {
        return next(new AppError(
          'Diese Route ist nicht für Passwort Updates. Bitte nutze /update-password',
          400
        ));
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          username: req.body.username,
          email: req.body.email,
          preferences: req.body.preferences
        },
        {
          new: true,
          runValidators: true
        }
      );

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req, res, next) {
    try {
      const user = await User.findById(req.user.id).select('+password');

      if (!(await user.correctPassword(req.body.currentPassword))) {
        return next(new AppError('Dein aktuelles Passwort ist falsch', 401));
      }

      user.password = req.body.newPassword;
      await user.save();

      // Generiere neuen Token
      const token = jwt.sign(
        { id: user._id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({
        status: 'success',
        data: { token }
      });
    } catch (error) {
      next(error);
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

  async enable2FA(req, res, next) {
    try {
      const user = await User.findById(req.user.id);

      // Generiere 2FA Secret
      const secret = speakeasy.generateSecret({
        name: `CodeCracker:${user.email}`
      });

      // Speichere Secret temporär
      user.twoFactorSecret = secret.base32;
      await user.save();

      // Generiere QR Code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      res.json({
        status: 'success',
        data: {
          qrCode,
          secret: secret.base32
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async verify2FA(req, res, next) {
    try {
      const { token } = req.body;
      const user = await User.findById(req.user.id);

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token
      });

      if (!verified) {
        return next(new AppError('Ungültiger 2FA Code', 401));
      }

      user.twoFactorEnabled = true;
      await user.save();

      res.json({
        status: 'success',
        message: '2FA erfolgreich aktiviert'
      });
    } catch (error) {
      next(error);
    }
  }

  async validate2FA(req, res, next) {
    try {
      const { token } = req.body;
      const user = await User.findById(req.user.id);

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token
      });

      if (!verified) {
        return next(new AppError('Ungültiger 2FA Code', 401));
      }

      res.json({
        status: 'success',
        message: '2FA Code gültig'
      });
    } catch (error) {
      next(error);
    }
  }

  async disable2FA(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      await user.save();

      res.json({
        status: 'success',
        message: '2FA deaktiviert'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController(); 