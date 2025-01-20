import type { User } from './user';
import type { Badge } from './badge';

export type { User };
export type { Badge };

// Definiere alle anderen Types direkt hier
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
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  description?: string;
  timeLimit?: number;
  memoryLimit?: number;
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
  executionTime?: number;
  memoryUsage?: number;
  score?: number;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  failureReason?: 'wrong_answer' | 'timeout' | 'memory_limit' | 'runtime_error';
}

export interface Rating {
  id: string;
  userId: string;
  challengeId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserStats {
  solvedChallenges: number;
  totalPoints: number;
  streak: number;
  rank: number;
  lastActive?: string;
  badges?: Badge[];
  recentSubmissions?: Submission[];
} 