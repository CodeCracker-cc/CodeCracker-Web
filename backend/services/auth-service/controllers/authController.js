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
const axios = require('axios');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

  async googleAuth(req, res, next) {
    try {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = `${process.env.API_BASE_URL}/auth/callback?provider=google`;
      const scope = 'email profile';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
      
      res.json({
        status: 'success',
        data: { authUrl }
      });
    } catch (error) {
      next(error);
    }
  }

  async githubAuth(req, res, next) {
    try {
      const githubClientId = process.env.GITHUB_CLIENT_ID;
      const redirectUri = `${process.env.API_BASE_URL}/auth/callback?provider=github`;
      const scope = 'user:email';
      
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      
      res.json({
        status: 'success',
        data: { authUrl }
      });
    } catch (error) {
      next(error);
    }
  }

  async socialCallback(req, res, next) {
    try {
      const { provider, code } = req.body;
      
      if (!provider || !code) {
        return next(new AppError('Provider und Code sind erforderlich', 400));
      }
      
      let userInfo;
      let socialId;
      let email;
      let name;
      let picture;
      
      // Provider-spezifische Verarbeitung
      if (provider === 'google') {
        // Token von Google erhalten
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${process.env.API_BASE_URL}/auth/callback?provider=google`,
          grant_type: 'authorization_code'
        });
        
        // Benutzerinformationen von Google abrufen
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });
        
        userInfo = userInfoResponse.data;
        socialId = userInfo.sub;
        email = userInfo.email;
        name = userInfo.name;
        picture = userInfo.picture;
      } else if (provider === 'github') {
        // Token von GitHub erhalten
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${process.env.API_BASE_URL}/auth/callback?provider=github`
        }, {
          headers: { Accept: 'application/json' }
        });
        
        // Benutzerinformationen von GitHub abrufen
        const userInfoResponse = await axios.get('https://api.github.com/user', {
          headers: { Authorization: `token ${tokenResponse.data.access_token}` }
        });
        
        // E-Mail von GitHub abrufen (kann privat sein)
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `token ${tokenResponse.data.access_token}` }
        });
        
        userInfo = userInfoResponse.data;
        socialId = userInfo.id.toString();
        // Primäre und verifizierte E-Mail auswählen
        const primaryEmail = emailsResponse.data.find(email => email.primary && email.verified);
        email = primaryEmail ? primaryEmail.email : userInfo.email;
        name = userInfo.name || userInfo.login;
        picture = userInfo.avatar_url;
      } else {
        return next(new AppError('Nicht unterstützter Provider', 400));
      }
      
      // Prüfen, ob Benutzer bereits existiert
      let user = await User.findOne({
        $or: [
          { email },
          { [`socialLogins.${provider}.id`]: socialId }
        ]
      });
      
      if (user) {
        // Benutzer existiert bereits, Social-Login-Informationen aktualisieren
        if (!user.socialLogins) {
          user.socialLogins = {};
        }
        
        user.socialLogins[provider] = {
          id: socialId,
          email,
          name,
          picture: provider === 'github' ? picture : undefined,
          avatar: provider === 'github' ? picture : undefined
        };
        
        await user.save();
      } else {
        // Neuen Benutzer erstellen
        const username = `${name.replace(/\s+/g, '')}_${Math.floor(Math.random() * 10000)}`;
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 12);
        
        const socialLoginData = {};
        socialLoginData[provider] = {
          id: socialId,
          email,
          name,
          picture: provider === 'google' ? picture : undefined,
          avatar: provider === 'github' ? picture : undefined
        };
        
        user = await User.create({
          email,
          password: hashedPassword,
          username,
          profileImage: picture,
          socialLogins: socialLoginData
        });
      }
      
      // Token generieren
      const token = this.signToken(user._id);
      
      // Passwort aus Response entfernen
      user.password = undefined;
      
      res.json({
        status: 'success',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return next(new AppError('Bitte E-Mail angeben', 400));
      }
      
      // Benutzer finden
      const user = await User.findOne({ email });
      
      if (!user) {
        return next(new AppError('Es existiert kein Benutzer mit dieser E-Mail', 404));
      }
      
      // Reset-Token generieren
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = Date.now() + 3600000; // 1 Stunde
      
      // Token hashen und speichern
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.passwordResetExpires = resetTokenExpires;
      
      await user.save({ validateBeforeSave: false });
      
      // Reset-URL erstellen
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      
      // E-Mail senden
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      await transporter.sendMail({
        from: `"CodeCracker" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: 'Passwort zurücksetzen',
        html: `
          <h1>Passwort zurücksetzen</h1>
          <p>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p>
          <a href="${resetUrl}" target="_blank">Passwort zurücksetzen</a>
          <p>Der Link ist eine Stunde gültig.</p>
          <p>Falls du keine Passwort-Zurücksetzung angefordert hast, ignoriere diese E-Mail.</p>
        `
      });
      
      res.json({
        status: 'success',
        message: 'E-Mail zum Zurücksetzen des Passworts wurde gesendet'
      });
    } catch (error) {
      // Bei Fehler Token zurücksetzen
      if (user) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
      }
      
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return next(new AppError('Token und Passwort sind erforderlich', 400));
      }
      
      // Token hashen
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      // Benutzer mit gültigem Token finden
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        return next(new AppError('Ungültiger oder abgelaufener Token', 400));
      }
      
      // Passwort aktualisieren
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      
      await user.save();
      
      // Token generieren
      const jwtToken = this.signToken(user._id);
      
      res.json({
        status: 'success',
        data: { token: jwtToken }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();