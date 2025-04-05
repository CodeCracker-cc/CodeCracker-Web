declare const API_ENDPOINTS: {
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
};

export { API_ENDPOINTS };
export default API_ENDPOINTS;
