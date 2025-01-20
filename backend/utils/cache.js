const Redis = require('ioredis');
const logger = require('./logger');

class Cache {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    this.redis.on('error', (err) => logger.error('Redis Error:', err));
  }

  async set(key, value, expireTime = 3600) {
    try {
      await this.redis.setex(key, expireTime, JSON.stringify(value));
    } catch (err) {
      logger.error('Cache Set Error:', err);
    }
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      logger.error('Cache Get Error:', err);
      return null;
    }
  }
}

module.exports = new Cache(); 