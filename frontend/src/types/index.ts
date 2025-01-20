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

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  points: number;
  solutionTemplate: string;
  supportedLanguages: string[];
  testCases: TestCase[];
  createdBy: string;
  solvedBy: string[];
  ratings: Rating[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  code: string;
  language: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'error';
  results: TestResult[];
  submittedAt: string;
}

export interface TestResult {
  passed: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  type: 'achievement' | 'rank' | 'special';
  imageUrl: string;
}

export interface Rating {
  userId: string;
  rating: number;
  review?: string;
} 