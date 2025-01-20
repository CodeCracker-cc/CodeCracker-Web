import { TestCase } from './testCase';
import { Rating } from './rating';

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