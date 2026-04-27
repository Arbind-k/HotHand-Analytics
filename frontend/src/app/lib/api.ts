const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      message = body.detail || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export type Player = {
  id: number;
  player_id: number;
  name: string;
  team: string;
  age: number;
  position?: string;
  archetype: string;
  gp?: number;
  min?: number;
  ppg?: number;
  rpg?: number;
  apg?: number;
  ts_pct?: number;
  usage?: number;
  assist_rate?: number;
  production_score?: number;
};

export type PlayersResponse = {
  source: string;
  season: string;
  players: Player[];
};

export type HotPlayer = {
  name: string;
  team: string;
  score: number;
  ppg?: number;
  apg?: number;
  rpg?: number;
  label?: string;
  momentum?: number;
  player_id?: number;
};

export type DashboardData = {
  source: string;
  season: string;
  hottest_players: HotPlayer[];
  trend_momentum: { game: string; value: number }[];
  schedule_difficulty: { team: string; difficulty: number }[];
};

export type RollingWindow = {
  points: number;
  rebounds: number;
  assists: number;
  minutes: number;
  ts: number;
  usage: number;
  assistRate: number;
};

export type PlayerDetailsData = {
  source: string;
  playerProfile: Player & {
    height?: string;
    weight?: string;
    country?: string;
    experience?: string;
    season?: string;
    games_loaded?: number;
  };
  rollingStats: {
    fiveGame: RollingWindow;
    tenGame: RollingWindow;
    fifteenGame: RollingWindow;
  };
  recentGames: Record<string, any>[];
};

export type AgingCurveRow = {
  player: string;
  age: number;
  archetype: string;
  actual: number;
  expected: number;
  delta: number;
  label: string;
};

export type AgingCurvesResponse = {
  source: string;
  season: string;
  archetype: string;
  players: AgingCurveRow[];
};

export type ScheduleDifficultyResponse = {
  source: string;
  season: string;
  teams: { team: string; difficulty: number }[];
};

export type MiscAnalyticsRow = {
  player: string;
  team: string;
  volatility: number;
  consistency: number;
  momentum: number;
  clutchFG: number;
  clutchPPG: number;
  clutchGames: number;
};

export type MiscAnalyticsResponse = {
  source: string;
  season: string;
  players: MiscAnalyticsRow[];
};

export type HealthResponse = {
  ok: boolean;
  mode: string;
  season: string;
};
