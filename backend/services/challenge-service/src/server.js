const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const challengeRoutes = require('../routes/challengeRoutes');
const dashboardRoutes = require('../routes/dashboardRoutes');
const config = require('../../../config/serviceConfig');
const errorHandler = require('../../../middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB-Verbindung herstellen
mongoose.connect(process.env.MONGODB_URI || config.database.uri)
  .then(() => console.log('MongoDB verbunden'))
  .catch(err => console.error('MongoDB Verbindungsfehler:', err));

// Routen
app.use('/api', challengeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404-Handler
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} nicht gefunden`
  });
});

// Globaler Error-Handler
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Challenge Service läuft auf Port ${port}`);
});