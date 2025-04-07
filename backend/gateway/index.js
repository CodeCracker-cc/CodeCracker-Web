const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const consul = require('consul')();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Logger für API-Anfragen
app.use(morgan('dev'));

// Sicherheitsheader
app.use(helmet({
  contentSecurityPolicy: false // Deaktiviert für Entwicklung
}));

// CORS-Konfiguration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://codecracker.com' 
    : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Statische Dateien servieren
const frontendPath = path.join(__dirname, '../../');
app.use(express.static(frontendPath));
console.log(`Serving static files from: ${frontendPath}`);

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
    },
    onError: (err, req, res) => {
      console.error(`Proxy error für ${name}-Service:`, err);
      res.status(500).json({ 
        error: 'Service temporär nicht verfügbar',
        service: name,
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Alle anderen Anfragen zur index.html weiterleiten (für SPA-Routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Globaler Error Handler
app.use((err, req, res, next) => {
  console.error('Unbehandelte Ausnahme:', err);
  res.status(500).json({ 
    error: 'Interner Serverfehler',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;