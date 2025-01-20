const { MongoClient } = require('mongodb');
const { S3 } = require('aws-sdk');
const cron = require('node-cron');
const logger = require('../../utils/logger');

class BackupService {
  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    });
  }

  async createBackup() {
    try {
      const client = await MongoClient.connect(process.env.MONGODB_URI);
      const dump = await client.db().admin().listDatabases();
      
      const timestamp = new Date().toISOString();
      const filename = `backup-${timestamp}.json`;

      await this.s3.putObject({
        Bucket: process.env.AWS_BACKUP_BUCKET,
        Key: filename,
        Body: JSON.stringify(dump)
      }).promise();

      logger.info(`Backup created: ${filename}`);
    } catch (err) {
      logger.error('Backup Error:', err);
    }
  }
}

// Schedule daily backup
const backupService = new BackupService();
cron.schedule('0 0 * * *', () => backupService.createBackup());

module.exports = backupService; 