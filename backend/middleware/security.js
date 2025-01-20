const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

const limiter = rateLimit({
  max: 100, // max 100 requests
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut'
});

module.exports = (app) => {
  // Security HTTP headers
  app.use(helmet());

  // Rate limiting
  app.use('/api', limiter);

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp());
}; 