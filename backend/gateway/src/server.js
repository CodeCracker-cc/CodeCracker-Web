const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// CORS für das Frontend erlauben
app.use(cors({
    origin: 'http://192.168.178.200', // Die IP-Adresse des Frontends
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Proxy Konfiguration für Auth Service
app.use('/api/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3000',
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': ''
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Service nicht verfügbar'
        });
    },
    logLevel: 'debug'  // Füge Debug-Logging hinzu
}));

// Proxy Konfiguration für andere Services...
app.use('/api/challenges', createProxyMiddleware({
    target: process.env.CHALLENGE_SERVICE_URL || 'http://challenge-service:3000',
    changeOrigin: true
}));

app.use('/api/execute', createProxyMiddleware({
    target: process.env.EXECUTION_SERVICE_URL || 'http://execution-service:3000',
    changeOrigin: true
}));

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Ein Fehler ist aufgetreten'
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API Gateway läuft auf Port ${port}`);
    console.log('CORS erlaubt für:', 'http://192.168.178.200');
}); 