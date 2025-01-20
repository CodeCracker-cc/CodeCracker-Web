const HealthCheck = require('../healthCheck');
const Cache = require('../../../utils/cache');
const logger = require('../../../utils/logger');

class MonitoringController {
  async getServiceStatus(req, res) {
    try {
      // Versuche zuerst aus dem Cache zu laden
      const cachedStatus = await Cache.get('service_status');
      if (cachedStatus) {
        return res.json(cachedStatus);
      }

      const status = await HealthCheck.checkServices();
      
      // Cache für 30 Sekunden
      await Cache.set('service_status', status, 30);

      res.json(status);
    } catch (err) {
      logger.error('Monitoring Error:', err);
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Abrufen der Service-Status'
      });
    }
  }

  async getMetrics(req, res) {
    try {
      const metrics = {
        uptime: process.uptime(),
        responseTime: [],
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      };

      res.json(metrics);
    } catch (err) {
      logger.error('Metrics Error:', err);
      res.status(500).json({
        status: 'error',
        message: 'Fehler beim Abrufen der Metriken'
      });
    }
  }
}

module.exports = new MonitoringController(); 