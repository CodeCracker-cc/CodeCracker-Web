const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { promisify } = require('util');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new Error('Sie sind nicht eingeloggt');
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('Der Benutzer existiert nicht mehr');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Keine Berechtigung für diese Aktion'
      });
    }
    next();
  };
}; 