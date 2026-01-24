/**
 * Comprehensive Sports Betting Types
 * Based on Diamond API structure
 */

// ===== Market Types =====
export type MarketType =
  | "MATCH_ODDS"
  | "BOOKMAKER"
  | "FANCY"
  | "SESSION"
  | "TOSS"
  | "OTHER";

export type BetType = "BACK" | "LAY";

export type BetStatus =
  | "PENDING"
  | "MATCHED"
  | "UNMATCHED"
  | "SETTLED"
  | "CANCELLED"
  | "VOID";

export type BetResult = "WON" | "LOST" | "VOID";

// ===== Odds Data =====
export interface OddsSelection {
  price: number;
  size: number;
}

export interface RunnerOdds {
  runner_name: string;
  runner_id?: number;
  nat?: string; // nationality/flag
  runs?: number; // for fancy/session markets
  back?: OddsSelection | null;
  lay?: OddsSelection | null;
  odds?: any[]; // raw odds ladder
  min?: number; // minimum bet
  max?: number; // maximum bet
  status?: "ACTIVE" | "SUSPENDED" | "CLOSED";
}

export interface MarketOdds {
  market_id: string | number;
  market_name: string;
  market_type: MarketType;
  runners: RunnerOdds[];
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  min_bet?: number;
  max_bet?: number;
  max_profit?: number;
  inplay?: boolean;
}

// ===== Match Odds (Win/Draw/Loss) =====
export interface MatchOddsData {
  match_odds?: RunnerOdds[];
  bookmaker?: RunnerOdds[];
  fancy?: RunnerOdds[];
  session?: RunnerOdds[];
  toss?: RunnerOdds[];
}

// ===== Bet Placement =====
export interface BetPlacement {
  event_id: number;
  event_name: string;
  market_id: number | string;
  market_name: string;
  market_type: MarketType;
  selection: string;
  selection_id?: number;
  stake: number;
  odds: number;
  bet_type: BetType;
  user_id?: string;
  ip_address?: string;
  device?: string;
}

export interface PlacedBet extends BetPlacement {
  bet_id: string;
  status: BetStatus;
  potential_profit: number;
  placed_at: string;
  matched_at?: string;
  settled_at?: string;
  result?: BetResult;
  payout?: number;
  username?: string;
}

// ===== Bet Result =====
export interface BetResult {
  event_id: number;
  event_name: string;
  market_id: number | string;
  market_name: string;
  market_type: MarketType;
  winner?: string;
  winner_id?: number;
  result_value?: number; // for fancy/session markets
  status: "DECLARED" | "VOID" | "PENDING";
  declared_at?: string;
}

// ===== Live Score Data =====
export interface LiveScoreData {
  gmid: number;
  score?: {
    home?: {
      name: string;
      score: string;
      overs?: string;
      wickets?: string;
    };
    away?: {
      name: string;
      score: string;
      overs?: string;
      wickets?: string;
    };
    status?: string;
    live_status?: string;
  };
  commentary?: Array<{
    ball: string;
    text: string;
    timestamp?: string;
  }>;
  last_updated?: string;
}

// ===== WebSocket Messages =====
export interface OddsUpdateMessage {
  type: "odds_update";
  event_id: number;
  market_id: string | number;
  market_type: MarketType;
  data: RunnerOdds[];
  timestamp: number;
}

export interface ScoreUpdateMessage {
  type: "score_update";
  event_id: number;
  data: LiveScoreData;
  timestamp: number;
}

export interface BetPlacedMessage {
  type: "bet_placed";
  bet: PlacedBet;
  timestamp: number;
}

export interface BetSettledMessage {
  type: "bet_settled";
  bet_id: string;
  result: BetResult;
  payout?: number;
  timestamp: number;
}

export interface MarketStatusMessage {
  type: "market_status";
  event_id: number;
  market_id: string | number;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  timestamp: number;
}

export type SportsBettingMessage =
  | OddsUpdateMessage
  | ScoreUpdateMessage
  | BetPlacedMessage
  | BetSettledMessage
  | MarketStatusMessage;

// ===== Betting Context =====
export interface BetSlipItem {
  event_id: number;
  event_name: string;
  market_id: string | number;
  market_name: string;
  market_type: MarketType;
  selection: string;
  selection_id?: number;
  odds: number;
  bet_type: BetType;
  stake: number;
  potential_profit: number;
}

export interface BettingState {
  betSlip: BetSlipItem[];
  placedBets: PlacedBet[];
  balance: number;
  exposure: number;
  isPlacingBet: boolean;
  error?: string;
}

// ===== API Response Types =====
export interface PlaceBetResponse {
  success: boolean;
  bet_id?: string;
  message?: string;
  bet?: PlacedBet;
}

export interface GetResultResponse {
  success: boolean;
  result?: BetResult;
  bets?: Array<{
    bet_id: string;
    result: BetResult;
    payout: number;
  }>;
}

export interface GetPlacedBetsResponse {
  success: boolean;
  bets: PlacedBet[];
  total: number;
  page?: number;
  limit?: number;
}
