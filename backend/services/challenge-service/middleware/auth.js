const jwt = require('jsonwebtoken');
const AppError = require('../../../utils/appError');
const config = require('../../../config/serviceConfig');

/**
 * Middleware zum Schutz von Routen, die eine Authentifizierung erfordern
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) Token aus Header holen
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Du bist nicht eingeloggt. Bitte logge dich ein, um Zugriff zu erhalten.', 401));
    }

    // 2) Token verifizieren
    const decoded = jwt.verify(token, process.env.JWT_SECRET || config.jwt.secret);

    // 3) Prüfen, ob der Benutzer noch existiert
    // Dies wird durch den API-Gateway-Service-Auth-Check abgedeckt

    // 4) Benutzer-ID in Request speichern
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Ungültiger Token. Bitte logge dich erneut ein.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Dein Token ist abgelaufen. Bitte logge dich erneut ein.', 401));
    }
    next(error);
  }
};

/**
 * Middleware zur Beschränkung des Zugriffs auf bestimmte Rollen
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Wenn die Rolle des Benutzers nicht in den erlaubten Rollen enthalten ist
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Du hast keine Berechtigung für diese Aktion', 403));
    }
    next();
  };
};

/**
 * Middleware zur Überprüfung des Service-Tokens
 */
exports.verifyServiceToken = async (req, res, next) => {
  try {
    const serviceToken = req.headers['x-service-token'];
    
    if (!serviceToken) {
      return next(new AppError('Service-Token fehlt', 401));
    }

    const decoded = jwt.verify(serviceToken, process.env.SERVICE_SECRET || config.service.secret);
    
    if (!decoded.serviceName) {
      return next(new AppError('Ungültiger Service-Token', 401));
    }

    req.service = decoded;
    next();
  } catch (err) {
    next(new AppError('Nicht autorisiert', 401));
  }
};
