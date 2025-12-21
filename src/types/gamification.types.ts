export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: string;
}

export interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly';
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  operatorId: string;
  name: string;
  points: number;
  rank: number;
}
