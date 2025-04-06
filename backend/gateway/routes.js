const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceAuth = require('../middleware/serviceAuth');
const rateLimit = require('express-rate-limit');

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100 // Limit pro IP
});

// Auth Service Routes
router.use('/api/auth', apiLimiter, createProxyMiddleware({
  target: 'http://auth-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  }
}));

// Challenge Service Routes
router.use('/api/challenges', serviceAuth.authenticateService, createProxyMiddleware({
  target: 'http://challenge-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/challenges': '/api/challenges'
  }
}));

// Dashboard Service Routes (Teil des Challenge-Service)
router.use('/api/dashboard', serviceAuth.authenticateService, createProxyMiddleware({
  target: 'http://challenge-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/dashboard': '/api/dashboard'
  }
}));

// Execution Service Routes
router.use('/api/execute', serviceAuth.authenticateService, createProxyMiddleware({
  target: 'http://execution-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/execute': '/api/execute'
  },
  proxyTimeout: 120000, // 2 Minuten Timeout für Code-Ausführung
  limit: '10mb'
}));

// Community Service Routes
router.use('/api/community', serviceAuth.authenticateService, createProxyMiddleware({
  target: 'http://community-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/community': '/api/community'
  }
}));

module.exports = router;