const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const limiter = rateLimit({
  max: 100, // max 100 requests
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Zu viele Anfragen von dieser IP'
});

module.exports = (app) => {
  // Security HTTP headers
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));

  // Rate limiting
  app.use('/api', limiter);

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp());
}; 