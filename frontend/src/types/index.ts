// Benutzertypen
export interface User {
  _id: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'moderator';
  profileImage?: string;
  bio?: string;
  stats: UserStats;
  badges: Badge[];
  preferences: UserPreferences;
  twoFactorEnabled: boolean;
  createdAt: string;
  subscription?: 'Free' | 'Basic' | 'Premium' | 'Enterprise';
  crackers?: number;
  openTasks?: Task[];
}

export interface UserStats {
  solvedChallenges: number;
  totalPoints: number;
  rank: number;
  streak: number;
  lastActive: string;
}

export interface Badge {
  type: 'achievement' | 'rank' | 'special';
  name: string;
  description: string;
  dateEarned: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'de' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

// Auth-Typen
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  status: string;
  data?: {
    user: User;
    token: string;
  };
  requires2FA?: boolean;
  tempToken?: string;
}

// Challenge-Typen
export interface Challenge {
  _id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  points: number;
  testCases: TestCase[];
  solutionTemplate: string;
  supportedLanguages: string[];
  createdBy: string;
  completedBy: CompletedBy[];
  ratings: Rating[];
  solvedBy: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  solvedCount?: number;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  description?: string;
  timeLimit: number;
  memoryLimit: number;
}

export interface CompletedBy {
  user: string;
  completedAt: string;
}

export interface Rating {
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt?: string;
}

// Execution-Typen
export interface CodeSubmission {
  code: string;
  language: string;
  challengeId?: string;
}

export interface ExecutionResult {
  status: 'success' | 'error' | 'timeout' | 'memory_limit';
  output?: string;
  error?: string;
  executionTime?: number;
  memoryUsage?: number;
  passedTestCases?: number;
  totalTestCases?: number;
  testResults?: TestResult[];
}

export interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  error?: string;
  executionTime?: number;
}

// Community-Typen
export interface Forum {
  _id: string;
  name: string;
  description: string;
  topics: number;
  lastActivity?: string;
}

export interface Topic {
  _id: string;
  title: string;
  forumId: string;
  createdBy: string;
  posts: number;
  views: number;
  lastActivity?: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  topicId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
}

// Store-Typen
export interface RootState {
  auth: AuthState;
  challenges: ChallengesState;
  execution: ExecutionState;
  community: CommunityState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ChallengesState {
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  loading: boolean;
  error: string | null;
}

export interface ExecutionState {
  result: ExecutionResult | null;
  loading: boolean;
  error: string | null;
}

export interface CommunityState {
  forums: Forum[];
  topics: Topic[];
  posts: Post[];
  loading: boolean;
  error: string | null;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'completed';
  type: 'challenge' | 'exam' | 'learning';
  points: number;
  challengeId?: string;
}
