export interface Rating {
  id: string;
  userId: string;
  challengeId: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt?: string;
} 