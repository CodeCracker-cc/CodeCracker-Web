const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const monitoringRoutes = require('./routes/monitoringRoutes');
const errorHandler = require('../../utils/errorHandler');
const security = require('../../middleware/security');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Security
security(app);

// Routes
app.use('/api/monitoring', monitoringRoutes);

// Error handling
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Monitoring-Service läuft auf Port ${port}`);
}); 