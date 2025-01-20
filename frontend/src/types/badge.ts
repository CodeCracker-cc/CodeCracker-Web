export interface Badge {
  id: string;
  name: string;
  description: string;
  type: 'achievement' | 'rank' | 'special';
  imageUrl: string;
  earnedAt?: string;
  progress?: {
    current: number;
    total: number;
  };
} 