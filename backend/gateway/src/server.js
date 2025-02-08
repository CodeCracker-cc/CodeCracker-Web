const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use(cors());
app.use(express.json());

// Proxy Konfiguration
app.use('/api/auth', createProxyMiddleware({ 
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true
}));

app.use('/api/challenges', createProxyMiddleware({ 
  target: process.env.CHALLENGE_SERVICE_URL,
  changeOrigin: true
}));

app.use('/api/execute', createProxyMiddleware({ 
  target: process.env.EXECUTION_SERVICE_URL,
  changeOrigin: true
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API Gateway läuft auf Port ${port}`);
}); 