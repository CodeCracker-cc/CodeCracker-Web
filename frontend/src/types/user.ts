import { Badge } from './badge';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  stats: {
    solvedChallenges: number;
    totalPoints: number;
    streak: number;
    rank: number;
  };
  badges: Badge[];
  preferences: {
    theme: 'light' | 'dark';
    language: 'de' | 'en';
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
} 