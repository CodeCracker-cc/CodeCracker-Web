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
console.log(`Absolute path to frontend/auth/css: ${path.join(frontendPath, 'frontend/auth/css')}`);

// Zusätzliche statische Pfade für die Auth-Komponente
app.use('/frontend/auth/css', express.static(path.join(frontendPath, 'frontend/auth/css')));

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Startseite - nur als Fallback, falls keine index.html existiert
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeCracker</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #1a1a2e;
                color: #e6e6e6;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                text-align: center;
            }
            .container {
                max-width: 800px;
                padding: 20px;
            }
            h1 {
                color: #00b4d8;
                font-size: 3rem;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #4cc9f0;
                font-size: 1.5rem;
                margin-bottom: 30px;
            }
            .card {
                background-color: #16213e;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            .services {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 20px;
                margin-top: 30px;
            }
            .service {
                background-color: #0f3460;
                border-radius: 8px;
                padding: 15px;
                width: 200px;
                transition: transform 0.3s;
            }
            .service:hover {
                transform: translateY(-5px);
            }
            .status {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 8px;
            }
            .online {
                background-color: #4caf50;
            }
            .offline {
                background-color: #f44336;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>CodeCracker</h1>
            <div class="subtitle">Microservices Platform</div>
            
            <div class="card">
                <h2>Welcome to CodeCracker Web</h2>
                <p>This is the gateway service for the CodeCracker platform. All microservices are running and accessible through this gateway.</p>
            </div>
            
            <div class="services">
                <div class="service">
                    <h3><span class="status online"></span>Auth Service</h3>
                    <p>User authentication and authorization</p>
                </div>
                <div class="service">
                    <h3><span class="status online"></span>Challenge Service</h3>
                    <p>Coding challenges and exercises</p>
                </div>
                <div class="service">
                    <h3><span class="status online"></span>Execution Service</h3>
                    <p>Code execution and testing</p>
                </div>
                <div class="service">
                    <h3><span class="status online"></span>Community Service</h3>
                    <p>User forums and discussions</p>
                </div>
                <div class="service">
                    <h3><span class="status online"></span>Monitoring Service</h3>
                    <p>System health and metrics</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
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
    logLevel: 'debug'
}));

// Proxy Konfiguration für Challenge Service
app.use('/api/challenges', createProxyMiddleware({
    target: process.env.CHALLENGE_SERVICE_URL || 'http://challenge-service:3000',
    changeOrigin: true,
    pathRewrite: {
        '^/api/challenges': ''
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Service nicht verfügbar'
        });
    }
}));

// Proxy Konfiguration für Execution Service
app.use('/api/execute', createProxyMiddleware({
    target: process.env.EXECUTION_SERVICE_URL || 'http://execution-service:3000',
    changeOrigin: true,
    pathRewrite: {
        '^/api/execute': ''
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Service nicht verfügbar'
        });
    }
}));

// Proxy Konfiguration für Community Service
app.use('/api/community', createProxyMiddleware({
    target: process.env.COMMUNITY_SERVICE_URL || 'http://community-service:3000',
    changeOrigin: true,
    pathRewrite: {
        '^/api/community': ''
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Service nicht verfügbar'
        });
    }
}));

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
    console.log('CORS erlaubt für:', ['http://192.168.178.200', 'http://localhost:3000', 'http://localhost:8080', 'http://10.20.31.31:3000', 'http://10.20.31.31']);
});