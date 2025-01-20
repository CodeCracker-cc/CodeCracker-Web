export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  description?: string;
  timeLimit?: number;
  memoryLimit?: number;
} 