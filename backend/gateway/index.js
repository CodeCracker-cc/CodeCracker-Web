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
const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, '../../');
app.use(express.static(frontendPath));
console.log(`Serving static files from: ${frontendPath}`);

// Einfache Test-Route für die Startseite
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