const AppError = require('../utils/appError');
const Validators = require('../utils/validators');

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      
      if (error) {
        const message = error.details.map(detail => detail.message).join(', ');
        throw new AppError(message, 400);
      }

      // Spezielle Validierungen
      if (req.body.email) {
        Validators.validateEmail(req.body.email);
      }
      
      if (req.body.password) {
        Validators.validatePassword(req.body.password);
      }
      
      if (req.body.username) {
        Validators.validateUsername(req.body.username);
      }

      if (req.body.code) {
        Validators.validateCode(req.body.code, req.body.language);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validateRequest; 