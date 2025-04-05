import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { API_ENDPOINTS } from '../config/api.config.ts';
import {
  User,
  LoginCredentials,
  RegisterData,
  Challenge,
  CodeSubmission,
  ExecutionResult,
  Forum,
  Topic,
  Post
} from '../types';

// Typdeklaration für Axios
interface AxiosConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  params?: any;
}

const api = axios.create({
  baseURL: '/api'
} as AxiosConfig);

// Request Interceptor
api.interceptors.request.use((config: any) => {
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
      store.dispatch(logout({}));
    }
    return Promise.reject(error);
  }
);

// API-Methoden mit zentraler Konfiguration
export const authApi = {
  login: (credentials: LoginCredentials) => 
    api.post<{ status: string, data: { user: User, token: string } }>(API_ENDPOINTS.AUTH.LOGIN, credentials),
  register: (userData: RegisterData) => 
    api.post<{ status: string, data: { user: User, token: string } }>(API_ENDPOINTS.AUTH.REGISTER, userData),
  getProfile: () => 
    api.get<{ status: string, data: { user: User } }>(API_ENDPOINTS.AUTH.ME),
  updateProfile: (data: Partial<User>) => 
    api.put<{ status: string, data: { user: User } }>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data),
  changePassword: (data: { currentPassword: string, newPassword: string }) => 
    api.post<{ status: string, data: { token: string } }>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
  // @ts-ignore: TypeScript erkennt nicht, dass wir ein leeres Objekt übergeben
  logout: function() {
    const emptyData = {};
    return api.post<{ status: string }>(API_ENDPOINTS.AUTH.LOGOUT, emptyData);
  }
};

export const challengeApi = {
  getAll: (params?: any) => 
    api.get<{ status: string, data: { challenges: Challenge[] } }>(API_ENDPOINTS.CHALLENGES.GET_ALL, { params } as AxiosConfig),
  getById: (id: string) => 
    api.get<{ status: string, data: { challenge: Challenge } }>(API_ENDPOINTS.CHALLENGES.GET_BY_ID(id)),
  submitSolution: (id: string, solution: CodeSubmission) => 
    api.post<{ status: string, data: { result: ExecutionResult } }>(API_ENDPOINTS.CHALLENGES.SUBMIT_SOLUTION(id), solution),
  getLeaderboard: () => 
    api.get<{ status: string, data: { leaderboard: any[] } }>(API_ENDPOINTS.CHALLENGES.GET_LEADERBOARD),
  getByCategory: (category: string) => 
    api.get<{ status: string, data: { challenges: Challenge[] } }>(API_ENDPOINTS.CHALLENGES.GET_BY_CATEGORY(category)),
  getByDifficulty: (difficulty: string) => 
    api.get<{ status: string, data: { challenges: Challenge[] } }>(API_ENDPOINTS.CHALLENGES.GET_BY_DIFFICULTY(difficulty))
};

export const executionApi = {
  runCode: (code: CodeSubmission) => 
    api.post<{ status: string, data: { executionId: string } }>(API_ENDPOINTS.EXECUTION.RUN_CODE, code),
  checkStatus: (id: string) => 
    api.get<{ status: string, data: { status: string } }>(API_ENDPOINTS.EXECUTION.CHECK_STATUS(id)),
  getResult: (id: string) => 
    api.get<{ status: string, data: { result: ExecutionResult } }>(API_ENDPOINTS.EXECUTION.GET_RESULT(id))
};

export const communityApi = {
  getForums: () => 
    api.get<{ status: string, data: { forums: Forum[] } }>(API_ENDPOINTS.COMMUNITY.FORUMS),
  getTopics: (forumId: string) => 
    api.get<{ status: string, data: { topics: Topic[] } }>(API_ENDPOINTS.COMMUNITY.FORUM_TOPICS(forumId)),
  getPosts: (topicId: string) => 
    api.get<{ status: string, data: { posts: Post[] } }>(API_ENDPOINTS.COMMUNITY.FORUM_POSTS(topicId)),
  createTopic: (forumId: string, data: { title: string, content: string }) => 
    api.post<{ status: string, data: { topic: Topic } }>(API_ENDPOINTS.COMMUNITY.CREATE_TOPIC(forumId), data),
  createPost: (topicId: string, data: { content: string }) => 
    api.post<{ status: string, data: { post: Post } }>(API_ENDPOINTS.COMMUNITY.CREATE_POST(topicId), data),
  getUserProfile: (userId: string) => 
    api.get<{ status: string, data: { user: User } }>(API_ENDPOINTS.COMMUNITY.USER_PROFILE(userId)),
  getNotifications: () => 
    api.get<{ status: string, data: { notifications: any[] } }>(API_ENDPOINTS.COMMUNITY.NOTIFICATIONS)
};

export default api;