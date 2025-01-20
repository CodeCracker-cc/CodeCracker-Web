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
    ]
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
  }
};

module.exports = config; 