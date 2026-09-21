export type TeamId = 'A' | 'B';

export interface Player {
  id: string;
  name: string;
  team: TeamId;
  isEliminated: boolean;
  eliminatedAt?: number;
  eliminationOrder?: number;
  color?: string;
}

export type WheelMode = 'ALL' | 'TEAM_A' | 'TEAM_B' | 'VERSUS';

export interface TeamConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  badgeBg: string;
  badgeText: string;
}

export interface MatchupRecord {
  id: string;
  playerA: Player;
  playerB: Player;
  timestamp: number;
}
