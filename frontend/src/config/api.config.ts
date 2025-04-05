/**
 * Zentrale Konfiguration für alle API-Endpunkte
 * Dies erleichtert die Wartung und Konsistenz bei API-Aufrufen
 */

const API_BASE_URL = '/api';

interface ApiEndpoints {
  AUTH: {
    LOGIN: string;
    REGISTER: string;
    LOGOUT: string;
    VERIFY_TOKEN: string;
    REFRESH_TOKEN: string;
    ME: string;
    UPDATE_PROFILE: string;
    CHANGE_PASSWORD: string;
    SETUP_2FA: string;
    VERIFY_2FA: string;
  };
  CHALLENGES: {
    BASE: string;
    GET_ALL: string;
    GET_BY_ID: (id: string) => string;
    CREATE: string;
    UPDATE: (id: string) => string;
    DELETE: (id: string) => string;
    SUBMIT_SOLUTION: (id: string) => string;
    GET_LEADERBOARD: string;
    GET_BY_CATEGORY: (category: string) => string;
    GET_BY_DIFFICULTY: (difficulty: string) => string;
  };
  EXECUTION: {
    RUN_CODE: string;
    CHECK_STATUS: (id: string) => string;
    GET_RESULT: (id: string) => string;
  };
  COMMUNITY: {
    FORUMS: string;
    FORUM_TOPICS: (forumId: string) => string;
    FORUM_POSTS: (topicId: string) => string;
    CREATE_TOPIC: (forumId: string) => string;
    CREATE_POST: (topicId: string) => string;
    USER_PROFILE: (userId: string) => string;
    NOTIFICATIONS: string;
  };
}

export const API_ENDPOINTS: ApiEndpoints = {
  // Auth Service Endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    VERIFY_TOKEN: `${API_BASE_URL}/auth/verify-token`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
    ME: `${API_BASE_URL}/auth/me`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/update-profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    SETUP_2FA: `${API_BASE_URL}/auth/setup-2fa`,
    VERIFY_2FA: `${API_BASE_URL}/auth/verify-2fa`
  },
  
  // Challenge Service Endpoints
  CHALLENGES: {
    BASE: `${API_BASE_URL}/challenges`,
    GET_ALL: `${API_BASE_URL}/challenges`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/challenges/${id}`,
    CREATE: `${API_BASE_URL}/challenges`,
    UPDATE: (id: string) => `${API_BASE_URL}/challenges/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/challenges/${id}`,
    SUBMIT_SOLUTION: (id: string) => `${API_BASE_URL}/challenges/${id}/submit`,
    GET_LEADERBOARD: `${API_BASE_URL}/challenges/leaderboard`,
    GET_BY_CATEGORY: (category: string) => `${API_BASE_URL}/challenges/category/${category}`,
    GET_BY_DIFFICULTY: (difficulty: string) => `${API_BASE_URL}/challenges/difficulty/${difficulty}`
  },
  
  // Execution Service Endpoints
  EXECUTION: {
    RUN_CODE: `${API_BASE_URL}/execute/run`,
    CHECK_STATUS: (id: string) => `${API_BASE_URL}/execute/status/${id}`,
    GET_RESULT: (id: string) => `${API_BASE_URL}/execute/result/${id}`
  },
  
  // Community Service Endpoints
  COMMUNITY: {
    FORUMS: `${API_BASE_URL}/community/forums`,
    FORUM_TOPICS: (forumId: string) => `${API_BASE_URL}/community/forums/${forumId}/topics`,
    FORUM_POSTS: (topicId: string) => `${API_BASE_URL}/community/topics/${topicId}/posts`,
    CREATE_TOPIC: (forumId: string) => `${API_BASE_URL}/community/forums/${forumId}/topics`,
    CREATE_POST: (topicId: string) => `${API_BASE_URL}/community/topics/${topicId}/posts`,
    USER_PROFILE: (userId: string) => `${API_BASE_URL}/community/users/${userId}`,
    NOTIFICATIONS: `${API_BASE_URL}/community/notifications`
  }
};

export default API_ENDPOINTS;
