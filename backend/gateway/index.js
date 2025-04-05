const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const consul = require('consul')();
const cors = require('cors');

const app = express();

// CORS-Konfiguration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://codecracker.com' 
    : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Service discovery
const services = {
  auth: { url: process.env.AUTH_SERVICE_URL },
  challenge: { url: process.env.CHALLENGE_SERVICE_URL },
  execution: { url: process.env.EXECUTION_SERVICE_URL },
  community: { url: process.env.COMMUNITY_SERVICE_URL }
};

// Proxy middleware configuration
Object.entries(services).forEach(([name, service]) => {
  app.use(`/api/${name}`, createProxyMiddleware({
    target: service.url,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/${name}`]: ''
    }
  }));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

module.exports = app;