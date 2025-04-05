/**
 * Zentrale Konfiguration für alle API-Endpunkte
 * Dies erleichtert die Wartung und Konsistenz bei API-Aufrufen
 */

const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
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
    GET_BY_ID: (id) => `${API_BASE_URL}/challenges/${id}`,
    CREATE: `${API_BASE_URL}/challenges`,
    UPDATE: (id) => `${API_BASE_URL}/challenges/${id}`,
    DELETE: (id) => `${API_BASE_URL}/challenges/${id}`,
    SUBMIT_SOLUTION: (id) => `${API_BASE_URL}/challenges/${id}/submit`,
    GET_LEADERBOARD: `${API_BASE_URL}/challenges/leaderboard`,
    GET_BY_CATEGORY: (category) => `${API_BASE_URL}/challenges/category/${category}`,
    GET_BY_DIFFICULTY: (difficulty) => `${API_BASE_URL}/challenges/difficulty/${difficulty}`
  },
  
  // Execution Service Endpoints
  EXECUTION: {
    RUN_CODE: `${API_BASE_URL}/execute/run`,
    CHECK_STATUS: (id) => `${API_BASE_URL}/execute/status/${id}`,
    GET_RESULT: (id) => `${API_BASE_URL}/execute/result/${id}`
  },
  
  // Community Service Endpoints
  COMMUNITY: {
    FORUMS: `${API_BASE_URL}/community/forums`,
    FORUM_TOPICS: (forumId) => `${API_BASE_URL}/community/forums/${forumId}/topics`,
    FORUM_POSTS: (topicId) => `${API_BASE_URL}/community/topics/${topicId}/posts`,
    CREATE_TOPIC: (forumId) => `${API_BASE_URL}/community/forums/${forumId}/topics`,
    CREATE_POST: (topicId) => `${API_BASE_URL}/community/topics/${topicId}/posts`,
    USER_PROFILE: (userId) => `${API_BASE_URL}/community/users/${userId}`,
    NOTIFICATIONS: `${API_BASE_URL}/community/notifications`
  }
};

export default API_ENDPOINTS;
