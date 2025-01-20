const axios = require('axios');

class HealthCheck {
  async checkServices() {
    const services = [
      { name: 'auth', url: process.env.AUTH_SERVICE_URL },
      { name: 'challenge', url: process.env.CHALLENGE_SERVICE_URL },
      { name: 'execution', url: process.env.EXECUTION_SERVICE_URL },
      { name: 'community', url: process.env.COMMUNITY_SERVICE_URL }
    ];

    const results = await Promise.all(
      services.map(async (service) => {
        try {
          const start = Date.now();
          await axios.get(`${service.url}/health`);
          const latency = Date.now() - start;

          return {
            service: service.name,
            status: 'healthy',
            latency: `${latency}ms`
          };
        } catch (err) {
          return {
            service: service.name,
            status: 'unhealthy',
            error: err.message
          };
        }
      })
    );

    return results;
  }
}

module.exports = new HealthCheck(); 