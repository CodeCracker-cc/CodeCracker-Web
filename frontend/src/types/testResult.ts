export interface TestResult {
  testCaseId: string;
  passed: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  failureReason?: 'wrong_answer' | 'timeout' | 'memory_limit' | 'runtime_error';
} 