const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use(cors());
app.use(express.json());

// Default Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
const CHALLENGE_SERVICE_URL = process.env.CHALLENGE_SERVICE_URL || 'http://challenge-service:3000';
const EXECUTION_SERVICE_URL = process.env.EXECUTION_SERVICE_URL || 'http://execution-service:3000';

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Proxy Konfiguration
app.use('/api/auth', createProxyMiddleware({ 
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': ''
  }
}));

app.use('/api/challenges', createProxyMiddleware({ 
  target: CHALLENGE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/challenges': ''
  }
}));

app.use('/api/execute', createProxyMiddleware({ 
  target: EXECUTION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/execute': ''
  }
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API Gateway läuft auf Port ${port}`);
  console.log('Service URLs:');
  console.log(`Auth Service: ${AUTH_SERVICE_URL}`);
  console.log(`Challenge Service: ${CHALLENGE_SERVICE_URL}`);
  console.log(`Execution Service: ${EXECUTION_SERVICE_URL}`);
}); 