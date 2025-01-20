const express = require('express');
const router = express.Router();
const proxy = require('express-http-proxy');
const serviceAuth = require('../middleware/serviceAuth');
const rateLimit = require('express-rate-limit');

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100 // Limit pro IP
});

// Auth Service Routes
router.use('/api/auth', apiLimiter, proxy('http://auth-service:3000', {
  proxyReqPathResolver: (req) => `/api/auth${req.url}`
}));

// Challenge Service Routes
router.use('/api/challenges', serviceAuth.authenticateService, proxy('http://challenge-service:3000', {
  proxyReqPathResolver: (req) => `/api/challenges${req.url}`
}));

// Execution Service Routes
router.use('/api/execute', serviceAuth.authenticateService, proxy('http://execution-service:3000', {
  proxyReqPathResolver: (req) => `/api/execute${req.url}`,
  limit: '10mb'
}));

// Community Service Routes
router.use('/api/community', serviceAuth.authenticateService, proxy('http://community-service:3000', {
  proxyReqPathResolver: (req) => `/api/community${req.url}`
}));

module.exports = router; 