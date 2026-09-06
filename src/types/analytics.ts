export interface PerformanceMetrics {
  // Win / Loss Statistics
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  beTrades: number;
  winRate: number; // percentage e.g. 68.4%
  lossRate: number;
  avgWin: number;
  avgLoss: number;
  winLossRatio: number; // avgWin / avgLoss
  currentStreak: { count: number; type: 'WIN' | 'LOSS' };
  maxWinStreak: number;
  maxLossStreak: number;

  // Risk & Efficiency
  netPnl: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  expectancy: number; // $ per trade
  maxDrawdownPct: number;
  maxDrawdownAmount: number;
  recoveryFactor: number;
  calmarRatio: number;

  // Execution & Volume
  totalLots: number;
  commissionsPaid: number;
  avgHoldTimeMinutes: number;
  avgHoldTimeWinMinutes: number;
  avgHoldTimeLossMinutes: number;
  largestWinTrade: { symbol: string; amount: number; date: string; rr: number };
  largestLossTrade: { symbol: string; amount: number; date: string; rr: number };
}

export interface RadarDataPoint {
  axis: string;
  traderScore: number;
  benchmarkScore: number;
  fullMark: number;
}

export interface DailyPnLPoint {
  date: string; // "YYYY-MM-DD"
  displayDate: string; // "Sep 01"
  pnl: number;
  cumulativePnl: number;
  tradesCount: number;
  winRate: number;
  volumeLots: number;
}

export interface HourlyPnLPoint {
  hour: string; // "08:00", "09:00", etc.
  hourNumber: number;
  pnl: number;
  tradesCount: number;
  winRate: number;
  session: 'ASIA' | 'LONDON' | 'NEW_YORK' | 'OTHER';
}

export interface DayOfWeekPoint {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  pnl: number;
  tradesCount: number;
  winRate: number;
  avgPnl: number;
}

export interface RRScatterPoint {
  id: string;
  symbol: string;
  plannedRR: number;
  realizedRR: number;
  pnl: number;
  status: 'WIN' | 'LOSS' | 'BE';
  date: string;
  riskAmount: number;
  rewardAmount: number;
}

export interface CalendarDayData {
  date: string; // "YYYY-MM-DD"
  dayOfMonth: number;
  pnl: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  isCurrentMonth: boolean;
}

export interface MonthlyMatrixRow {
  year: number;
  months: {
    month: string;
    pnl: number;
    returnPct: number;
    tradeCount: number;
  }[];
  totalPnl: number;
  totalReturnPct: number;
}

export interface MonteCarloPoint {
  tradeIndex: number;
  p25: number;
  p50: number; // median
  p75: number;
  p95: number;
  p05: number;
}

export interface EquityCurvePoint {
  tradeNumber: number;
  date: string;
  equity: number;
  pnl: number;
  drawdownPct: number;
  benchmarkEquity: number;
}

export interface AnalyticsFilterState {
  accountId: string;
  dateRange: 'LAST_7D' | 'LAST_30D' | 'LAST_90D' | 'YTD' | 'ALL_TIME' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  compareBenchmark: boolean;
  benchmarkAsset: 'SP500' | 'NASDAQ' | 'GOLD' | 'BTC';
  selectedSymbol: string;
  selectedSession: 'ALL' | 'LONDON' | 'NEW_YORK' | 'ASIA';
  selectedModel: string;
  selectedDayOfWeek: 'ALL' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
}
