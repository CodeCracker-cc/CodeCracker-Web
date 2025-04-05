import axios, { InternalAxiosRequestConfig } from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { API_ENDPOINTS } from '../config/api.config';

const api = axios.create({
  baseURL: '/api'
});

// Request Interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

// API-Methoden mit zentraler Konfiguration
export const authApi = {
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  register: (userData) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
  getProfile: () => api.get(API_ENDPOINTS.AUTH.ME),
  updateProfile: (data) => api.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data),
  changePassword: (data) => api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT)
};

export const challengeApi = {
  getAll: (params) => api.get(API_ENDPOINTS.CHALLENGES.GET_ALL, { params }),
  getById: (id) => api.get(API_ENDPOINTS.CHALLENGES.GET_BY_ID(id)),
  submitSolution: (id, solution) => api.post(API_ENDPOINTS.CHALLENGES.SUBMIT_SOLUTION(id), solution),
  getLeaderboard: () => api.get(API_ENDPOINTS.CHALLENGES.GET_LEADERBOARD),
  getByCategory: (category) => api.get(API_ENDPOINTS.CHALLENGES.GET_BY_CATEGORY(category)),
  getByDifficulty: (difficulty) => api.get(API_ENDPOINTS.CHALLENGES.GET_BY_DIFFICULTY(difficulty))
};

export const executionApi = {
  runCode: (code) => api.post(API_ENDPOINTS.EXECUTION.RUN_CODE, code),
  checkStatus: (id) => api.get(API_ENDPOINTS.EXECUTION.CHECK_STATUS(id)),
  getResult: (id) => api.get(API_ENDPOINTS.EXECUTION.GET_RESULT(id))
};

export const communityApi = {
  getForums: () => api.get(API_ENDPOINTS.COMMUNITY.FORUMS),
  getTopics: (forumId) => api.get(API_ENDPOINTS.COMMUNITY.FORUM_TOPICS(forumId)),
  getPosts: (topicId) => api.get(API_ENDPOINTS.COMMUNITY.FORUM_POSTS(topicId)),
  createTopic: (forumId, data) => api.post(API_ENDPOINTS.COMMUNITY.CREATE_TOPIC(forumId), data),
  createPost: (topicId, data) => api.post(API_ENDPOINTS.COMMUNITY.CREATE_POST(topicId), data),
  getUserProfile: (userId) => api.get(API_ENDPOINTS.COMMUNITY.USER_PROFILE(userId)),
  getNotifications: () => api.get(API_ENDPOINTS.COMMUNITY.NOTIFICATIONS)
};

export default api;