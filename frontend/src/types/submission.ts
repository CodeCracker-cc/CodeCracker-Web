import { TestResult } from './testResult';

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