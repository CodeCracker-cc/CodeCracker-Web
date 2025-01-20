const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, username } = req.body;
      
      const user = await User.create({
        email,
        password,
        username,
        stats: { solvedChallenges: 0, totalPoints: 0, rank: 0 }
      });

      const token = this.signToken(user._id);

      res.status(201).json({
        status: 'success',
        token,
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username
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

  async login(req, res) {
    try {
      const { email, password, twoFactorToken } = req.body;

      const user = await User.findOne({ email }).select('+password');
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        throw new Error('Ungültige Email oder Passwort');
      }

      if (user.twoFactorEnabled) {
        if (!twoFactorToken) {
          return res.status(200).json({
            status: 'pending',
            message: '2FA-Code erforderlich'
          });
        }

        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: twoFactorToken
        });

        if (!verified) {
          throw new Error('Ungültiger 2FA-Code');
        }
      }

      const token = this.signToken(user._id);

      res.status(200).json({
        status: 'success',
        token
      });
    } catch (err) {
      res.status(401).json({
        status: 'error',
        message: err.message
      });
    }
  }

  signToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }
}

module.exports = new AuthController(); 