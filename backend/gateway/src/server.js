const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();

// CORS für das Frontend erlauben
app.use(cors({
    origin: ['http://192.168.178.200', 'http://localhost:3000', 'http://localhost:8080', 'http://10.20.31.31:3000', 'http://10.20.31.31'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Debug-Ausgabe für Pfade
const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, '../../..');
console.log(`Serving static files from: ${frontendPath}`);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Proxy Konfiguration für Newsletter Service
app.use('/newsletter', createProxyMiddleware({
    target: process.env.NEWSLETTER_SERVICE_URL || 'http://newsletter-service:3004',
    changeOrigin: true,
    pathRewrite: {
        '^/newsletter': ''
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Newsletter-Service nicht verfügbar'
        });
    }
}));

// Statische Dateien aus dem Frontend-Verzeichnis bereitstellen
app.use(express.static(frontendPath));

// Alle anderen Anfragen zur index.html weiterleiten (für SPA-Routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API Gateway läuft auf Port ${port}`);
    console.log('CORS erlaubt für:', ['http://192.168.178.200', 'http://localhost:3000', 'http://localhost:8080', 'http://10.20.31.31:3000', 'http://10.20.31.31']);
});
