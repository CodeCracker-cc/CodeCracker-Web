const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://mongodb:27017/auth'
  }
};

module.exports = config; 