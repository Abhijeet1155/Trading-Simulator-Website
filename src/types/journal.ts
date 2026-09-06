export type TradeDirection = 'LONG' | 'SHORT';

export type TradeResult = 'WIN' | 'LOSS' | 'BE';

export type TradingSession = 'LONDON' | 'NEW_YORK' | 'ASIA' | 'LONDON_CLOSE' | 'OVERNIGHT';

export interface PartialExit {
  id: string;
  percentage: number; // e.g. 50%
  exitPrice: number;
  lotSize: number;
  pnl: number;
  time?: string;
  note?: string;
}

export interface TradeEmotion {
  id: string;
  label: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface Trade {
  id: string;
  symbol: string; // e.g. "XAUUSD", "EURUSD", "NQ1!", "BTCUSD"
  assetClass: 'Forex' | 'Crypto' | 'Indices' | 'Commodities';
  direction: TradeDirection;
  status: 'OPEN' | 'CLOSED';
  result: TradeResult;
  
  // Pricing & Execution
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit?: number;
  lotSize: number; // lots or contracts
  contractMultiplier?: number;
  
  // Financial Outcomes
  netPnl: number;
  grossPnl: number;
  commission: number;
  pips?: number;
  rrRealized: number;
  rrPlanned: number;
  
  // Timing
  entryDate: string; // ISO String
  exitDate?: string; // ISO String
  session: TradingSession;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1D';
  
  // Strategy & SMC / ICT Models
  setupModel: string; // e.g., "ICT Silver Bullet", "SMC Liquidity Sweep"
  confluences: string[]; // e.g., ["Order Block", "FVG", "Displacement", "Discount PD Array"]
  
  // Advanced Partials Tracker
  partials: PartialExit[];
  
  // Review & Psychology
  chartUrl?: string;
  chartThumbnail?: string;
  notes: string;
  psychology: string[]; // e.g. ["Followed Rules", "Patient Entry", "FOMO", "Moved SL Early"]
  mistakes: string[]; // e.g. ["Overleveraged", "Chased Entry", "None"]
  rating: number; // 1 to 5 stars
}

export interface JournalFilterState {
  search: string;
  symbol: string;
  direction: 'ALL' | TradeDirection;
  result: 'ALL' | TradeResult;
  session: 'ALL' | TradingSession;
  setupModel: string;
  confluence: string;
  timeframe: string;
  dateRange: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_30_DAYS' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  minPnl?: number;
  maxPnl?: number;
  sortBy: 'date-desc' | 'date-asc' | 'pnl-desc' | 'pnl-asc' | 'rr-desc';
}

export interface JournalMetricsSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  beTrades: number;
  winRate: number; // %
  netPnl: number; // $
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  avgRR: number;
  bestTrade: number;
  worstTrade: number;
  expectancy: number; // $ per trade
  openTradesCount: number;
}
