export interface CandleData {
  time: string; // Formatted display time, e.g. "09:30" or "2026-09-06 09:30"
  timestamp: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  session?: 'asia' | 'london' | 'ny' | 'off';
  isKeyLevel?: boolean;
  annotation?: string;
}

export type OrderDirection = 'BUY' | 'SELL';

export interface ReplayPosition {
  id: string;
  symbol: string;
  type: OrderDirection;
  entryPrice: number;
  entryTime: number;
  entryBarIndex: number;
  lots: number;
  sl?: number;
  tp?: number;
  pnl: number;
  pnlPips: number;
  status: 'OPEN' | 'CLOSED';
  closePrice?: number;
  closeTime?: number;
  closeBarIndex?: number;
  closeReason?: 'TP' | 'SL' | 'MANUAL';
  realizedPnl?: number;
}

export interface ReplayAccountStats {
  startingBalance: number;
  currentBalance: number;
  equity: number;
  floatingPnl: number;
  realizedPnl: number;
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  winRate: number;
}

export interface SessionJumpPoint {
  id: string;
  title: string;
  description: string;
  index: number;
  timestamp: number;
  timeStr: string;
  sessionType: 'asia' | 'london' | 'ny' | 'news';
}

export type SpeedMultiplier = 0.5 | 1 | 2 | 3 | 5 | 10;

export interface ReplayEngineState {
  isPlaying: boolean;
  speed: SpeedMultiplier;
  visibleIndex: number;
  totalCandles: number;
  isScissorsActive: boolean;
  activeSymbol: string;
  activeTimeframe: string;
  selectedBar: CandleData | null;
}
