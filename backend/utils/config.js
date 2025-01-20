const Consul = require('consul');
const logger = require('./logger');

class ConfigManager {
  constructor() {
    this.consul = new Consul();
    this.cache = new Map();
  }

  async get(key, defaultValue = null) {
    try {
      // Prüfe Cache
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      const { Value } = await this.consul.kv.get(key);
      if (!Value) return defaultValue;

      const value = JSON.parse(Buffer.from(Value, 'base64').toString());
      this.cache.set(key, value);
      
      return value;
    } catch (err) {
      logger.error(`Config Error: ${err.message}`);
      return defaultValue;
    }
  }

  async set(key, value) {
    try {
      await this.consul.kv.set(key, JSON.stringify(value));
      this.cache.set(key, value);
    } catch (err) {
      logger.error(`Config Set Error: ${err.message}`);
    }
  }
}

module.exports = new ConfigManager(); 