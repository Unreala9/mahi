export type Sport = {
  id: string;
  name: string;
  icon?: string;
  count?: number;
};

export type League = {
  id: string;
  name: string;
  country: string;
  logo?: string;
};

export type Market = {
  id: string;
  name: string;
  outcomes: Outcome[];
};

export type Outcome = {
  id: string;
  name: string;
  price: number;
};

export type Fixture = {
  id: string;
  sportId: string;
  league: League;
  participants: {
    home: { name: string; logo?: string };
    away: { name: string; logo?: string };
  };
  startTime: string;
  status: "prematch" | "live" | "finished";
  markets: Market[]; // Main markets (e.g. 1X2)
  isLeague?: boolean; // UI Helper to distinguish clickable leagues
};
