import { 
  PerformanceMetrics, 
  RadarDataPoint, 
  DailyPnLPoint, 
  HourlyPnLPoint, 
  DayOfWeekPoint, 
  RRScatterPoint, 
  CalendarDayData, 
  MonthlyMatrixRow, 
  MonteCarloPoint, 
  EquityCurvePoint 
} from '../types/analytics';

export const MOCK_METRICS: PerformanceMetrics = {
  totalTrades: 148,
  winningTrades: 98,
  losingTrades: 42,
  beTrades: 8,
  winRate: 66.2,
  lossRate: 28.4,
  avgWin: 1245.50,
  avgLoss: 580.20,
  winLossRatio: 2.15,
  currentStreak: { count: 4, type: 'WIN' },
  maxWinStreak: 9,
  maxLossStreak: 3,

  netPnl: 97680.00,
  grossProfit: 122059.00,
  grossLoss: 24379.00,
  profitFactor: 5.01,
  sharpeRatio: 2.84,
  sortinoRatio: 4.12,
  expectancy: 660.00,
  maxDrawdownPct: 4.82,
  maxDrawdownAmount: 5120.00,
  recoveryFactor: 19.08,
  calmarRatio: 8.65,

  totalLots: 425.5,
  commissionsPaid: 1480.00,
  avgHoldTimeMinutes: 142,
  avgHoldTimeWinMinutes: 185,
  avgHoldTimeLossMinutes: 48,
  largestWinTrade: { symbol: 'XAUUSD', amount: 8100.00, date: '2026-09-05', rr: 3.90 },
  largestLossTrade: { symbol: 'NQ1!', amount: -1820.00, date: '2026-09-03', rr: -1.0 },
};

// 4 Performance Radars: Discipline, Risk Management, Execution Timing, Edge Consistency
export const RADAR_DISCIPLINE: RadarDataPoint[] = [
  { axis: 'Rule Adherence', traderScore: 92, benchmarkScore: 70, fullMark: 100 },
  { axis: 'Plan Execution', traderScore: 88, benchmarkScore: 65, fullMark: 100 },
  { axis: 'FOMO Resistance', traderScore: 85, benchmarkScore: 60, fullMark: 100 },
  { axis: 'Loss Acceptance', traderScore: 94, benchmarkScore: 75, fullMark: 100 },
  { axis: 'No Revenge Trade', traderScore: 96, benchmarkScore: 68, fullMark: 100 },
  { axis: 'Overtrade Control', traderScore: 89, benchmarkScore: 72, fullMark: 100 },
];

export const RADAR_RISK_MGMT: RadarDataPoint[] = [
  { axis: 'SL Discipline', traderScore: 96, benchmarkScore: 75, fullMark: 100 },
  { axis: 'Pos Sizing Consistency', traderScore: 90, benchmarkScore: 70, fullMark: 100 },
  { axis: 'Max DD Control', traderScore: 93, benchmarkScore: 68, fullMark: 100 },
  { axis: 'R:R Realization', traderScore: 87, benchmarkScore: 65, fullMark: 100 },
  { axis: 'Profit Scaling', traderScore: 82, benchmarkScore: 60, fullMark: 100 },
  { axis: 'Capital Preservation', traderScore: 95, benchmarkScore: 72, fullMark: 100 },
];

export const RADAR_EXECUTION: RadarDataPoint[] = [
  { axis: 'Killzone Precision', traderScore: 91, benchmarkScore: 65, fullMark: 100 },
  { axis: 'Entry Slippage', traderScore: 86, benchmarkScore: 70, fullMark: 100 },
  { axis: 'Limit Fill Rate', traderScore: 89, benchmarkScore: 68, fullMark: 100 },
  { axis: 'Macro Timing', traderScore: 84, benchmarkScore: 62, fullMark: 100 },
  { axis: 'Exit Timing', traderScore: 88, benchmarkScore: 66, fullMark: 100 },
  { axis: 'Spread Efficiency', traderScore: 90, benchmarkScore: 74, fullMark: 100 },
];

export const RADAR_EDGE_CONSISTENCY: RadarDataPoint[] = [
  { axis: 'Setup Expectancy', traderScore: 94, benchmarkScore: 70, fullMark: 100 },
  { axis: 'Win Rate Stability', traderScore: 88, benchmarkScore: 65, fullMark: 100 },
  { axis: 'Profit Factor', traderScore: 95, benchmarkScore: 68, fullMark: 100 },
  { axis: 'Market Regime Adapt', traderScore: 81, benchmarkScore: 60, fullMark: 100 },
  { axis: 'Confluence Depth', traderScore: 92, benchmarkScore: 72, fullMark: 100 },
  { axis: 'Volume Profile Fit', traderScore: 86, benchmarkScore: 66, fullMark: 100 },
];

// Daily PnL for 30 consecutive days
export const MOCK_DAILY_PNL: DailyPnLPoint[] = [
  { date: '2026-08-08', displayDate: 'Aug 08', pnl: 2450, cumulativePnl: 2450, tradesCount: 4, winRate: 75, volumeLots: 8.5 },
  { date: '2026-08-09', displayDate: 'Aug 09', pnl: -820, cumulativePnl: 1630, tradesCount: 3, winRate: 33, volumeLots: 6.0 },
  { date: '2026-08-10', displayDate: 'Aug 10', pnl: 3100, cumulativePnl: 4730, tradesCount: 5, winRate: 80, volumeLots: 12.0 },
  { date: '2026-08-11', displayDate: 'Aug 11', pnl: 1850, cumulativePnl: 6580, tradesCount: 4, winRate: 75, volumeLots: 9.0 },
  { date: '2026-08-12', displayDate: 'Aug 12', pnl: 4200, cumulativePnl: 10780, tradesCount: 6, winRate: 83, volumeLots: 15.0 },
  { date: '2026-08-15', displayDate: 'Aug 15', pnl: -1400, cumulativePnl: 9380, tradesCount: 3, winRate: 0, volumeLots: 6.5 },
  { date: '2026-08-16', displayDate: 'Aug 16', pnl: 2800, cumulativePnl: 12180, tradesCount: 5, winRate: 80, volumeLots: 11.0 },
  { date: '2026-08-17', displayDate: 'Aug 17', pnl: 3950, cumulativePnl: 16130, tradesCount: 6, winRate: 83, volumeLots: 14.5 },
  { date: '2026-08-18', displayDate: 'Aug 18', pnl: -650, cumulativePnl: 15480, tradesCount: 2, winRate: 50, volumeLots: 4.0 },
  { date: '2026-08-19', displayDate: 'Aug 19', pnl: 5120, cumulativePnl: 20600, tradesCount: 7, winRate: 85, volumeLots: 18.0 },
  { date: '2026-08-22', displayDate: 'Aug 22', pnl: 2100, cumulativePnl: 22700, tradesCount: 4, winRate: 75, volumeLots: 9.0 },
  { date: '2026-08-23', displayDate: 'Aug 23', pnl: -1100, cumulativePnl: 21600, tradesCount: 4, winRate: 25, volumeLots: 8.0 },
  { date: '2026-08-24', displayDate: 'Aug 24', pnl: 4600, cumulativePnl: 26200, tradesCount: 6, winRate: 83, volumeLots: 14.0 },
  { date: '2026-08-25', displayDate: 'Aug 25', pnl: 3200, cumulativePnl: 29400, tradesCount: 5, winRate: 80, volumeLots: 11.5 },
  { date: '2026-08-26', displayDate: 'Aug 26', pnl: 6400, cumulativePnl: 35800, tradesCount: 8, winRate: 87, volumeLots: 21.0 },
  { date: '2026-08-29', displayDate: 'Aug 29', pnl: -950, cumulativePnl: 34850, tradesCount: 3, winRate: 33, volumeLots: 7.0 },
  { date: '2026-08-30', displayDate: 'Aug 30', pnl: 3800, cumulativePnl: 38650, tradesCount: 5, winRate: 80, volumeLots: 12.0 },
  { date: '2026-08-31', displayDate: 'Aug 31', pnl: -18, cumulativePnl: 38632, tradesCount: 2, winRate: 50, volumeLots: 5.0 },
  { date: '2026-09-01', displayDate: 'Sep 01', pnl: 7200, cumulativePnl: 45832, tradesCount: 7, winRate: 85, volumeLots: 19.5 },
  { date: '2026-09-02', displayDate: 'Sep 02', pnl: 6375, cumulativePnl: 52207, tradesCount: 5, winRate: 100, volumeLots: 13.0 },
  { date: '2026-09-03', displayDate: 'Sep 03', pnl: -1820, cumulativePnl: 50387, tradesCount: 4, winRate: 25, volumeLots: 9.0 },
  { date: '2026-09-04', displayDate: 'Sep 04', pnl: 3650, cumulativePnl: 54037, tradesCount: 5, winRate: 80, volumeLots: 12.5 },
  { date: '2026-09-05', displayDate: 'Sep 05', pnl: 8100, cumulativePnl: 62137, tradesCount: 6, winRate: 83, volumeLots: 16.0 },
];

// Hourly distribution from 00:00 to 23:00 UTC
export const MOCK_HOURLY_DATA: HourlyPnLPoint[] = [
  { hour: '00:00', hourNumber: 0, pnl: 350, tradesCount: 4, winRate: 50, session: 'ASIA' },
  { hour: '01:00', hourNumber: 1, pnl: 1200, tradesCount: 6, winRate: 66, session: 'ASIA' },
  { hour: '02:00', hourNumber: 2, pnl: 3400, tradesCount: 11, winRate: 81, session: 'ASIA' },
  { hour: '03:00', hourNumber: 3, pnl: 1800, tradesCount: 8, winRate: 75, session: 'ASIA' },
  { hour: '04:00', hourNumber: 4, pnl: 450, tradesCount: 4, winRate: 50, session: 'ASIA' },
  { hour: '05:00', hourNumber: 5, pnl: -200, tradesCount: 2, winRate: 50, session: 'OTHER' },
  { hour: '06:00', hourNumber: 6, pnl: 950, tradesCount: 5, winRate: 60, session: 'OTHER' },
  { hour: '07:00', hourNumber: 7, pnl: 8400, tradesCount: 24, winRate: 79, session: 'LONDON' },
  { hour: '08:00', hourNumber: 8, pnl: 14200, tradesCount: 32, winRate: 84, session: 'LONDON' },
  { hour: '09:00', hourNumber: 9, pnl: 9800, tradesCount: 21, winRate: 76, session: 'LONDON' },
  { hour: '10:00', hourNumber: 10, pnl: 4200, tradesCount: 14, winRate: 64, session: 'LONDON' },
  { hour: '11:00', hourNumber: 11, pnl: -1200, tradesCount: 8, winRate: 37, session: 'OTHER' },
  { hour: '12:00', hourNumber: 12, pnl: 2100, tradesCount: 9, winRate: 66, session: 'OTHER' },
  { hour: '13:00', hourNumber: 13, pnl: 16800, tradesCount: 38, winRate: 86, session: 'NEW_YORK' },
  { hour: '14:00', hourNumber: 14, pnl: 18400, tradesCount: 41, winRate: 82, session: 'NEW_YORK' },
  { hour: '15:00', hourNumber: 15, pnl: 11200, tradesCount: 28, winRate: 75, session: 'NEW_YORK' },
  { hour: '16:00', hourNumber: 16, pnl: 5600, tradesCount: 17, winRate: 70, session: 'NEW_YORK' },
  { hour: '17:00', hourNumber: 17, pnl: 900, tradesCount: 6, winRate: 50, session: 'OTHER' },
  { hour: '18:00', hourNumber: 18, pnl: -450, tradesCount: 4, winRate: 25, session: 'OTHER' },
  { hour: '19:00', hourNumber: 19, pnl: 1600, tradesCount: 7, winRate: 71, session: 'OTHER' },
  { hour: '20:00', hourNumber: 20, pnl: 650, tradesCount: 4, winRate: 50, session: 'OTHER' },
  { hour: '21:00', hourNumber: 21, pnl: 200, tradesCount: 3, winRate: 66, session: 'OTHER' },
  { hour: '22:00', hourNumber: 22, pnl: -350, tradesCount: 2, winRate: 0, session: 'OTHER' },
  { hour: '23:00', hourNumber: 23, pnl: 100, tradesCount: 1, winRate: 100, session: 'OTHER' },
];

// Day of week stats
export const MOCK_DAY_OF_WEEK: DayOfWeekPoint[] = [
  { day: 'Mon', pnl: 16450, tradesCount: 26, winRate: 69.2, avgPnl: 632.70 },
  { day: 'Tue', pnl: 24800, tradesCount: 34, winRate: 73.5, avgPnl: 729.40 },
  { day: 'Wed', pnl: 28600, tradesCount: 38, winRate: 76.3, avgPnl: 752.60 },
  { day: 'Thu', pnl: 19350, tradesCount: 31, winRate: 64.5, avgPnl: 624.20 },
  { day: 'Fri', pnl: 8480, tradesCount: 19, winRate: 57.8, avgPnl: 446.30 },
];

// 30 R:R Scatter Points with actual risk vs reward data
export const MOCK_SCATTER_POINTS: RRScatterPoint[] = [
  { id: '1', symbol: 'XAUUSD', plannedRR: 3.5, realizedRR: 3.90, pnl: 8100, status: 'WIN', date: 'Sep 05', riskAmount: 2075, rewardAmount: 8100 },
  { id: '2', symbol: 'EURUSD', plannedRR: 3.0, realizedRR: 3.17, pnl: 3650, status: 'WIN', date: 'Sep 04', riskAmount: 1150, rewardAmount: 3650 },
  { id: '3', symbol: 'NQ1!', plannedRR: 3.5, realizedRR: -1.0, pnl: -1820, status: 'LOSS', date: 'Sep 03', riskAmount: 1820, rewardAmount: 0 },
  { id: '4', symbol: 'BTCUSD', plannedRR: 3.2, realizedRR: 3.26, pnl: 6375, status: 'WIN', date: 'Sep 02', riskAmount: 1950, rewardAmount: 6375 },
  { id: '5', symbol: 'GBPUSD', plannedRR: 3.0, realizedRR: 0.0, pnl: -18, status: 'BE', date: 'Aug 31', riskAmount: 1050, rewardAmount: 0 },
  { id: '6', symbol: 'XAUUSD', plannedRR: 2.8, realizedRR: 2.85, pnl: 5200, status: 'WIN', date: 'Aug 30', riskAmount: 1820, rewardAmount: 5200 },
  { id: '7', symbol: 'US30', plannedRR: 3.0, realizedRR: -1.0, pnl: -950, status: 'LOSS', date: 'Aug 29', riskAmount: 950, rewardAmount: 0 },
  { id: '8', symbol: 'NQ1!', plannedRR: 4.0, realizedRR: 4.20, pnl: 6400, status: 'WIN', date: 'Aug 26', riskAmount: 1520, rewardAmount: 6400 },
  { id: '9', symbol: 'EURUSD', plannedRR: 2.5, realizedRR: 2.45, pnl: 3200, status: 'WIN', date: 'Aug 25', riskAmount: 1300, rewardAmount: 3200 },
  { id: '10', symbol: 'GBPUSD', plannedRR: 3.0, realizedRR: 3.10, pnl: 4600, status: 'WIN', date: 'Aug 24', riskAmount: 1480, rewardAmount: 4600 },
  { id: '11', symbol: 'USDJPY', plannedRR: 2.0, realizedRR: -1.0, pnl: -1100, status: 'LOSS', date: 'Aug 23', riskAmount: 1100, rewardAmount: 0 },
  { id: '12', symbol: 'XAUUSD', plannedRR: 2.5, realizedRR: 2.60, pnl: 3800, status: 'WIN', date: 'Aug 22', riskAmount: 1460, rewardAmount: 3800 },
  { id: '13', symbol: 'BTCUSD', plannedRR: 3.5, realizedRR: 3.70, pnl: 5120, status: 'WIN', date: 'Aug 19', riskAmount: 1380, rewardAmount: 5120 },
  { id: '14', symbol: 'NQ1!', plannedRR: 2.5, realizedRR: -1.0, pnl: -650, status: 'LOSS', date: 'Aug 18', riskAmount: 650, rewardAmount: 0 },
  { id: '15', symbol: 'EURUSD', plannedRR: 3.0, realizedRR: 3.05, pnl: 3950, status: 'WIN', date: 'Aug 17', riskAmount: 1290, rewardAmount: 3950 },
  { id: '16', symbol: 'GBPUSD', plannedRR: 2.8, realizedRR: 2.75, pnl: 2800, status: 'WIN', date: 'Aug 16', riskAmount: 1020, rewardAmount: 2800 },
  { id: '17', symbol: 'XAUUSD', plannedRR: 3.0, realizedRR: -1.0, pnl: -1400, status: 'LOSS', date: 'Aug 15', riskAmount: 1400, rewardAmount: 0 },
  { id: '18', symbol: 'ES1!', plannedRR: 3.2, realizedRR: 3.35, pnl: 4200, status: 'WIN', date: 'Aug 12', riskAmount: 1250, rewardAmount: 4200 },
  { id: '19', symbol: 'NQ1!', plannedRR: 2.0, realizedRR: 2.10, pnl: 1850, status: 'WIN', date: 'Aug 11', riskAmount: 880, rewardAmount: 1850 },
  { id: '20', symbol: 'EURUSD', plannedRR: 3.0, realizedRR: 3.20, pnl: 3100, status: 'WIN', date: 'Aug 10', riskAmount: 970, rewardAmount: 3100 },
  { id: '21', symbol: 'GBPUSD', plannedRR: 2.5, realizedRR: -1.0, pnl: -820, status: 'LOSS', date: 'Aug 09', riskAmount: 820, rewardAmount: 0 },
  { id: '22', symbol: 'XAUUSD', plannedRR: 2.5, realizedRR: 2.45, pnl: 2450, status: 'WIN', date: 'Aug 08', riskAmount: 1000, rewardAmount: 2450 },
  { id: '23', symbol: 'BTCUSD', plannedRR: 4.0, realizedRR: 4.10, pnl: 7200, status: 'WIN', date: 'Sep 01', riskAmount: 1750, rewardAmount: 7200 },
  { id: '24', symbol: 'US30', plannedRR: 2.5, realizedRR: 2.60, pnl: 3400, status: 'WIN', date: 'Aug 20', riskAmount: 1300, rewardAmount: 3400 },
  { id: '25', symbol: 'NQ1!', plannedRR: 3.0, realizedRR: -1.0, pnl: -1200, status: 'LOSS', date: 'Aug 14', riskAmount: 1200, rewardAmount: 0 },
  { id: '26', symbol: 'EURUSD', plannedRR: 2.5, realizedRR: 2.55, pnl: 2900, status: 'WIN', date: 'Aug 13', riskAmount: 1140, rewardAmount: 2900 },
  { id: '27', symbol: 'GBPUSD', plannedRR: 3.0, realizedRR: 3.15, pnl: 3800, status: 'WIN', date: 'Aug 07', riskAmount: 1200, rewardAmount: 3800 },
  { id: '28', symbol: 'XAUUSD', plannedRR: 2.0, realizedRR: -1.0, pnl: -750, status: 'LOSS', date: 'Aug 06', riskAmount: 750, rewardAmount: 0 },
  { id: '29', symbol: 'BTCUSD', plannedRR: 3.5, realizedRR: 3.60, pnl: 4800, status: 'WIN', date: 'Aug 05', riskAmount: 1330, rewardAmount: 4800 },
  { id: '30', symbol: 'NQ1!', plannedRR: 3.0, realizedRR: 3.05, pnl: 3600, status: 'WIN', date: 'Aug 04', riskAmount: 1180, rewardAmount: 3600 },
];

// Interactive Monthly Calendar Days for September 2026
export const MOCK_CALENDAR_DAYS: CalendarDayData[] = [
  // Padding for start of month (Tuesday Sep 1) -> Monday Aug 31
  { date: '2026-08-31', dayOfMonth: 31, pnl: -18, tradeCount: 2, winCount: 1, lossCount: 1, isCurrentMonth: false },
  
  // September 2026 days
  { date: '2026-09-01', dayOfMonth: 1, pnl: 7200, tradeCount: 7, winCount: 6, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-02', dayOfMonth: 2, pnl: 6375, tradeCount: 5, winCount: 5, lossCount: 0, isCurrentMonth: true },
  { date: '2026-09-03', dayOfMonth: 3, pnl: -1820, tradeCount: 4, winCount: 1, lossCount: 3, isCurrentMonth: true },
  { date: '2026-09-04', dayOfMonth: 4, pnl: 3650, tradeCount: 5, winCount: 4, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-05', dayOfMonth: 5, pnl: 8100, tradeCount: 6, winCount: 5, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-06', dayOfMonth: 6, pnl: 0, tradeCount: 0, winCount: 0, lossCount: 0, isCurrentMonth: true }, // Weekend
  { date: '2026-09-07', dayOfMonth: 7, pnl: 3450, tradeCount: 4, winCount: 3, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-08', dayOfMonth: 8, pnl: 4800, tradeCount: 5, winCount: 4, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-09', dayOfMonth: 9, pnl: -780, tradeCount: 3, winCount: 1, lossCount: 2, isCurrentMonth: true },
  { date: '2026-09-10', dayOfMonth: 10, pnl: 5200, tradeCount: 6, winCount: 5, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-11', dayOfMonth: 11, pnl: 2900, tradeCount: 4, winCount: 3, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-12', dayOfMonth: 12, pnl: 0, tradeCount: 0, winCount: 0, lossCount: 0, isCurrentMonth: true },
  { date: '2026-09-13', dayOfMonth: 13, pnl: 0, tradeCount: 0, winCount: 0, lossCount: 0, isCurrentMonth: true },
  { date: '2026-09-14', dayOfMonth: 14, pnl: 4100, tradeCount: 5, winCount: 4, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-15', dayOfMonth: 15, pnl: -1250, tradeCount: 4, winCount: 1, lossCount: 3, isCurrentMonth: true },
  { date: '2026-09-16', dayOfMonth: 16, pnl: 6800, tradeCount: 7, winCount: 6, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-17', dayOfMonth: 17, pnl: 3200, tradeCount: 4, winCount: 3, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-18', dayOfMonth: 18, pnl: 5400, tradeCount: 6, winCount: 5, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-19', dayOfMonth: 19, pnl: 0, tradeCount: 0, winCount: 0, lossCount: 0, isCurrentMonth: true },
  { date: '2026-09-20', dayOfMonth: 20, pnl: 0, tradeCount: 0, winCount: 0, lossCount: 0, isCurrentMonth: true },
  { date: '2026-09-21', dayOfMonth: 21, pnl: 2750, tradeCount: 4, winCount: 3, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-22', dayOfMonth: 22, pnl: 3900, tradeCount: 5, winCount: 4, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-23', dayOfMonth: 23, pnl: -920, tradeCount: 3, winCount: 1, lossCount: 2, isCurrentMonth: true },
  { date: '2026-09-24', dayOfMonth: 24, pnl: 6100, tradeCount: 6, winCount: 5, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-25', dayOfMonth: 25, pnl: 4350, tradeCount: 5, winCount: 4, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-26', dayOfMonth: 26, pnl: 0, tradeCount: 0, winCount: 0, lossCount: 0, isCurrentMonth: true },
  { date: '2026-09-27', dayOfMonth: 27, pnl: 0, tradeCount: 0, winCount: 0, lossCount: 0, isCurrentMonth: true },
  { date: '2026-09-28', dayOfMonth: 28, pnl: 3800, tradeCount: 4, winCount: 3, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-29', dayOfMonth: 29, pnl: 5100, tradeCount: 5, winCount: 4, lossCount: 1, isCurrentMonth: true },
  { date: '2026-09-30', dayOfMonth: 30, pnl: 4700, tradeCount: 5, winCount: 4, lossCount: 1, isCurrentMonth: true },
  
  // Padding for end of month
  { date: '2026-10-01', dayOfMonth: 1, pnl: 0, tradeCount: 0, winCount: 0, lossCount: 0, isCurrentMonth: false },
  { date: '2026-10-02', dayOfMonth: 2, pnl: 0, tradeCount: 0, winCount: 0, lossCount: 0, isCurrentMonth: false },
  { date: '2026-10-03', dayOfMonth: 3, pnl: 0, tradeCount: 0, winCount: 0, lossCount: 0, isCurrentMonth: false },
  { date: '2026-10-04', dayOfMonth: 4, pnl: 0, tradeCount: 0, winCount: 0, lossCount: 0, isCurrentMonth: false },
];

// Monthly Returns Matrix across years (Jan - Dec + YTD %)
export const MOCK_MONTHLY_MATRIX: MonthlyMatrixRow[] = [
  {
    year: 2026,
    months: [
      { month: 'Jan', pnl: 8450, returnPct: 8.45, tradeCount: 18 },
      { month: 'Feb', pnl: 6200, returnPct: 5.71, tradeCount: 16 },
      { month: 'Mar', pnl: 11400, returnPct: 9.94, tradeCount: 22 },
      { month: 'Apr', pnl: -2300, returnPct: -1.82, tradeCount: 14 },
      { month: 'May', pnl: 14800, returnPct: 11.95, tradeCount: 25 },
      { month: 'Jun', pnl: 9600, returnPct: 6.93, tradeCount: 19 },
      { month: 'Jul', pnl: 12500, returnPct: 8.44, tradeCount: 21 },
      { month: 'Aug', pnl: 18230, returnPct: 11.36, tradeCount: 28 },
      { month: 'Sep', pnl: 18800, returnPct: 10.53, tradeCount: 24 },
      { month: 'Oct', pnl: 0, returnPct: 0, tradeCount: 0 },
      { month: 'Nov', pnl: 0, returnPct: 0, tradeCount: 0 },
      { month: 'Dec', pnl: 0, returnPct: 0, tradeCount: 0 },
    ],
    totalPnl: 97680,
    totalReturnPct: 97.68,
  },
  {
    year: 2025,
    months: [
      { month: 'Jan', pnl: 4200, returnPct: 4.20, tradeCount: 15 },
      { month: 'Feb', pnl: 7800, returnPct: 7.48, tradeCount: 18 },
      { month: 'Mar', pnl: 5400, returnPct: 4.82, tradeCount: 16 },
      { month: 'Apr', pnl: 8900, returnPct: 7.58, tradeCount: 20 },
      { month: 'May', pnl: -1400, returnPct: -1.11, tradeCount: 12 },
      { month: 'Jun', pnl: 6700, returnPct: 5.36, tradeCount: 17 },
      { month: 'Jul', pnl: 11200, returnPct: 8.50, tradeCount: 23 },
      { month: 'Aug', pnl: 9400, returnPct: 6.57, tradeCount: 21 },
      { month: 'Sep', pnl: 13400, returnPct: 8.78, tradeCount: 24 },
      { month: 'Oct', pnl: 8100, returnPct: 4.88, tradeCount: 19 },
      { month: 'Nov', pnl: 15600, returnPct: 8.96, tradeCount: 26 },
      { month: 'Dec', pnl: 7200, returnPct: 3.79, tradeCount: 16 },
    ],
    totalPnl: 96500,
    totalReturnPct: 96.50,
  },
];

// Cumulative Equity Curve + Benchmark S&P 500
export const MOCK_EQUITY_CURVE: EquityCurvePoint[] = Array.from({ length: 40 }).map((_, i) => {
  const tradeNum = i + 1;
  const growth = Math.pow(1.018, i) * 100000;
  const noise = (Math.sin(i * 0.8) * 1200) + ((i % 5 === 0) ? -800 : 950);
  const equity = Math.round(growth + noise);
  const benchmark = Math.round(100000 * Math.pow(1.004, i));
  const peak = 100000 * Math.pow(1.02, i);
  const dd = Math.max(0, Math.min(5.2, ((peak - equity) / peak) * 100));

  return {
    tradeNumber: tradeNum,
    date: `T-${40 - i}`,
    equity,
    pnl: i === 0 ? 0 : Math.round(equity - (100000 * Math.pow(1.018, i - 1))),
    drawdownPct: Number(dd.toFixed(2)),
    benchmarkEquity: benchmark,
  };
});

// Monte Carlo simulation with 5 percentile confidence bands for 50 future trades
export const MOCK_MONTE_CARLO: MonteCarloPoint[] = Array.from({ length: 30 }).map((_, i) => {
  const step = i + 1;
  const base = 100000;
  const expGrowth = step * 650; // Expected profit per trade ($650)
  
  return {
    tradeIndex: step,
    p95: Math.round(base + expGrowth * 1.65 + Math.sqrt(step) * 1800),
    p75: Math.round(base + expGrowth * 1.25 + Math.sqrt(step) * 950),
    p50: Math.round(base + expGrowth),
    p25: Math.round(base + expGrowth * 0.72 - Math.sqrt(step) * 900),
    p05: Math.round(base + expGrowth * 0.35 - Math.sqrt(step) * 1900),
  };
});
