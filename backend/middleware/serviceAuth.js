const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

exports.authenticateService = async (req, res, next) => {
  try {
    const serviceToken = req.headers['x-service-token'];
    
    if (!serviceToken) {
      throw new AppError('Service-Token fehlt', 401);
    }

    const decoded = jwt.verify(serviceToken, process.env.SERVICE_SECRET);
    
    if (!decoded.serviceName) {
      throw new AppError('Ungültiger Service-Token', 401);
    }

    req.service = decoded;
    next();
  } catch (err) {
    next(new AppError('Nicht autorisiert', 401));
  }
}; 