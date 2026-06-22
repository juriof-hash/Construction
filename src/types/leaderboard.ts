export interface LeaderboardRecord {
  stage: string;
  elapsedTime: number;
  userName: string;
  timestamp: string;
}

export interface LeaderboardState {
  data: LeaderboardRecord[];
  isLoading: boolean;
  error: string | null;
}
