const Consul = require('consul');
const logger = require('./logger');

class ServiceDiscovery {
  constructor() {
    this.consul = new Consul({
      host: process.env.CONSUL_HOST || 'localhost',
      port: process.env.CONSUL_PORT || '8500'
    });
  }

  async register(serviceName, servicePort) {
    try {
      await this.consul.agent.service.register({
        name: serviceName,
        port: servicePort,
        check: {
          http: `http://localhost:${servicePort}/health`,
          interval: '10s'
        }
      });
      logger.info(`Service ${serviceName} registriert`);
    } catch (err) {
      logger.error(`Service Registration Error: ${err.message}`);
    }
  }

  async discover(serviceName) {
    try {
      const result = await this.consul.catalog.service.nodes(serviceName);
      return result[0]; // Returne den ersten verfügbaren Service
    } catch (err) {
      logger.error(`Service Discovery Error: ${err.message}`);
      return null;
    }
  }
}

module.exports = new ServiceDiscovery(); 