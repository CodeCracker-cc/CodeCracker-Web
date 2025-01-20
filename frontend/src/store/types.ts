import { store } from './index';
import type { User } from '../types/user';

// Redux Store Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Challenge Types
export interface ChallengeFilters {
  category?: string;
  difficulty?: string;
  limit?: number;
  sort?: string;
}

export interface SubmitSolutionPayload {
  challengeId: string;
  code: string;
  language: string;
} 