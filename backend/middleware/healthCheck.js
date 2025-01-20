const logger = require('../utils/logger');

const healthCheck = (req, res, next) => {
  try {
    const healthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: process.env.SERVICE_NAME,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    // Prüfe Datenbankverbindung
    const dbStatus = req.app.get('dbConnection')?.readyState === 1;
    healthInfo.database = dbStatus ? 'connected' : 'disconnected';

    if (!dbStatus) {
      healthInfo.status = 'degraded';
      logger.warn(`Health check: Database connection issue in ${process.env.SERVICE_NAME}`);
    }

    res.status(200).json(healthInfo);
  } catch (err) {
    logger.error(`Health check failed: ${err.message}`);
    res.status(500).json({
      status: 'unhealthy',
      error: err.message
    });
  }
};

module.exports = healthCheck; 