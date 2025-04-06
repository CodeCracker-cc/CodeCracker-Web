const config = {
  auth: {
    port: 3001,
    routes: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      verify: '/api/auth/verify'
    },
    security: {
      passwordMinLength: 8,
      jwtExpiresIn: '90d',
      maxLoginAttempts: 5,
      lockoutTime: 15 // minutes
    }
  },
  challenge: {
    port: 3002,
    executionLimits: {
      timeout: 5000, // ms
      memory: 50, // MB
      processes: 5
    },
    categories: [
      'algorithmen',
      'datenstrukturen',
      'web',
      'database',
      'security'
    ],
    dashboard: {
      streakResetHour: 0, // Mitternacht UTC
      dailyTasksResetHour: 0, // Mitternacht UTC
      maxDailyTasks: 3,
      defaultCrackerRewards: {
        challenge: 10,
        achievement: 25,
        dailyTask: 5,
        streak: {
          base: 5,
          multiplier: 1 // Pro Tag im Streak
        }
      }
    }
  },
  execution: {
    port: 3003,
    containerLimits: {
      cpu: '0.5',
      memory: '100M',
      timeout: 10000
    },
    supportedLanguages: ['python', 'javascript', 'java', 'cpp']
  },
  community: {
    port: 3004,
    postLimits: {
      titleMaxLength: 100,
      contentMaxLength: 5000,
      commentsPerPage: 20
    }
  },
  database: {
    uri: 'mongodb://mongodb:27017/codecracker',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development',
    expiresIn: '30d'
  },
  service: {
    secret: process.env.SERVICE_SECRET || 'service-secret-key-for-development'
  }
};

module.exports = config;