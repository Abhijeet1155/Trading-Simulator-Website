import { Trade } from '../types/journal';

export const PREDEFINED_SETUP_MODELS = [
  'ICT 2022 Mentorship Model',
  'ICT Silver Bullet',
  'ICT Judas Swing',
  'SMC Liquidity Sweep & BOS',
  'Order Block Rejection',
  'Fair Value Gap (FVG) Tap',
  'Breaker Block Retest',
  'London Open Killzone',
  'NY AM Session Sweep',
  'Asia Range High/Low Run',
  'Trendline Liquidity Grab',
  'High Timeframe Discount Array',
  'News Straddle / FOMC Reaction',
];

export const PREDEFINED_CONFLUENCES = [
  '15m FVG',
  '1h Order Block',
  '4h Market Structure Shift (MSS)',
  'Equal Highs (EQH) Liquidity',
  'Equal Lows (EQL) Liquidity',
  'Discount PD Array',
  'Premium PD Array',
  'OTE Fib 0.618 - 0.786',
  'Dollar Index (DXY) SMT Divergence',
  'High Volume Node (POC)',
  'Previous Day High (PDH) Sweep',
  'Previous Day Low (PDL) Sweep',
  'Asian Session High (ASH) Taken',
  'Clean Displacement Leg',
];

export const PSYCHOLOGY_TAGS = [
  'Discipline 10/10',
  'Followed Trade Plan',
  'Patient Limit Execution',
  'Waited for Confirmation',
  'Zero Hesitation',
  'Accepted Risk Easily',
  'Mild FOMO',
  'Slight Early Entry',
  'Moved SL Too Fast',
  'Held Through Retracement',
  'Revenge Trading Impulse (Avoided)',
];

export const MISTAKE_TAGS = [
  'None (Clean Execution)',
  'Entered Too Early',
  'Overleveraged Position',
  'Chased Market Price',
  'Moved Stop Loss to BE Prematurely',
  'Ignored High Impact News',
  'Did Not Wait for 5m Displacement',
  'Exited Winner Too Early',
  'Hesitated on Valid Signal',
];

export const POPULAR_SYMBOLS = [
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', assetClass: 'Commodities' as const, defaultMultiplier: 100 },
  { symbol: 'EURUSD', name: 'Euro / US Dollar', assetClass: 'Forex' as const, defaultMultiplier: 100000 },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', assetClass: 'Forex' as const, defaultMultiplier: 100000 },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', assetClass: 'Forex' as const, defaultMultiplier: 100000 },
  { symbol: 'NQ1!', name: 'E-mini NASDAQ 100', assetClass: 'Indices' as const, defaultMultiplier: 20 },
  { symbol: 'ES1!', name: 'E-mini S&P 500', assetClass: 'Indices' as const, defaultMultiplier: 50 },
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', assetClass: 'Crypto' as const, defaultMultiplier: 1 },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', assetClass: 'Crypto' as const, defaultMultiplier: 1 },
  { symbol: 'US30', name: 'Dow Jones Industrial 30', assetClass: 'Indices' as const, defaultMultiplier: 1 },
];

export const MOCK_TRADES: Trade[] = [
  {
    id: 'TRD-2026-0901',
    symbol: 'XAUUSD',
    assetClass: 'Commodities',
    direction: 'LONG',
    status: 'CLOSED',
    result: 'WIN',
    entryPrice: 2482.40,
    exitPrice: 2514.80,
    stopLoss: 2474.10,
    takeProfit: 2515.00,
    lotSize: 2.5,
    contractMultiplier: 100,
    netPnl: 8100.00,
    grossPnl: 8135.00,
    commission: 35.00,
    pips: 324,
    rrRealized: 3.90,
    rrPlanned: 3.92,
    entryDate: '2026-09-05T13:35:00Z',
    exitDate: '2026-09-05T16:20:00Z',
    session: 'NEW_YORK',
    timeframe: '5m',
    setupModel: 'ICT Silver Bullet',
    confluences: ['15m FVG', 'Clean Displacement Leg', 'Discount PD Array', 'Dollar Index (DXY) SMT Divergence'],
    partials: [
      { id: 'p1', percentage: 50, exitPrice: 2498.00, lotSize: 1.25, pnl: 1950.00, time: '14:15', note: 'Took 50% at internal liquidity pool' },
      { id: 'p2', percentage: 30, exitPrice: 2508.50, lotSize: 0.75, pnl: 1957.50, time: '15:10', note: 'Took 30% at Asia High sweep' },
      { id: 'p3', percentage: 20, exitPrice: 2514.80, lotSize: 0.50, pnl: 1620.00, time: '16:20', note: 'Runner tagged final TP' },
    ],
    chartUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80',
    chartThumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
    notes: 'Classic NY AM Killzone Silver Bullet delivery. 10:00 AM macro expanded right into 15m unmitigated bullish FVG. DXY posted a higher high while Gold refused to make a lower low (clear bullish SMT). Executed market order with 8.3 pt invalidation.',
    psychology: ['Discipline 10/10', 'Followed Trade Plan', 'Zero Hesitation'],
    mistakes: ['None (Clean Execution)'],
    rating: 5,
  },
  {
    id: 'TRD-2026-0902',
    symbol: 'EURUSD',
    assetClass: 'Forex',
    direction: 'SHORT',
    status: 'CLOSED',
    result: 'WIN',
    entryPrice: 1.09450,
    exitPrice: 1.08720,
    stopLoss: 1.09680,
    takeProfit: 1.08650,
    lotSize: 5.0,
    contractMultiplier: 100000,
    netPnl: 3650.00,
    grossPnl: 3685.00,
    commission: 35.00,
    pips: 73,
    rrRealized: 3.17,
    rrPlanned: 3.47,
    entryDate: '2026-09-04T07:45:00Z',
    exitDate: '2026-09-04T12:30:00Z',
    session: 'LONDON',
    timeframe: '15m',
    setupModel: 'SMC Liquidity Sweep & BOS',
    confluences: ['Asian Session High (ASH) Taken', '1h Order Block', 'Equal Lows (EQL) Liquidity'],
    partials: [
      { id: 'p1', percentage: 60, exitPrice: 1.08980, lotSize: 3.0, pnl: 1410.00, time: '09:40', note: 'First scale out at London low of day' },
      { id: 'p2', percentage: 40, exitPrice: 1.08720, lotSize: 2.0, pnl: 1460.00, time: '12:30', note: 'Closed remaining before NY open' },
    ],
    chartUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1600&q=80',
    chartThumbnail: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=400&q=80',
    notes: 'London Judas swing swept Asian High at 07:30 UTC followed by aggressive 5m displacement breakdown. Bearish breaker held firmly on retest.',
    psychology: ['Followed Trade Plan', 'Patient Limit Execution'],
    mistakes: ['None (Clean Execution)'],
    rating: 5,
  },
  {
    id: 'TRD-2026-0903',
    symbol: 'NQ1!',
    assetClass: 'Indices',
    direction: 'LONG',
    status: 'CLOSED',
    result: 'LOSS',
    entryPrice: 19840.50,
    exitPrice: 19795.00,
    stopLoss: 19795.00,
    takeProfit: 20020.00,
    lotSize: 2.0,
    contractMultiplier: 20,
    netPnl: -1820.00,
    grossPnl: -1820.00,
    commission: 12.00,
    pips: 45,
    rrRealized: -1.0,
    rrPlanned: 3.94,
    entryDate: '2026-09-03T14:10:00Z',
    exitDate: '2026-09-03T14:28:00Z',
    session: 'NEW_YORK',
    timeframe: '1m',
    setupModel: 'ICT 2022 Mentorship Model',
    confluences: ['15m FVG', 'Previous Day Low (PDL) Sweep'],
    partials: [],
    chartUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1600&q=80',
    chartThumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80',
    notes: 'Anticipated 15m bullish FVG bounce after PDL tap, but failed to notice heavy selling volume in bond yields. Stopped out cleanly without slippage. Controlled risk.',
    psychology: ['Accepted Risk Easily', 'Mild FOMO'],
    mistakes: ['Entered Too Early', 'Ignored High Impact News'],
    rating: 3,
  },
  {
    id: 'TRD-2026-0904',
    symbol: 'BTCUSD',
    assetClass: 'Crypto',
    direction: 'LONG',
    status: 'CLOSED',
    result: 'WIN',
    entryPrice: 58200.00,
    exitPrice: 62450.00,
    stopLoss: 56900.00,
    takeProfit: 62500.00,
    lotSize: 1.5,
    contractMultiplier: 1,
    netPnl: 6375.00,
    grossPnl: 6390.00,
    commission: 15.00,
    pips: 4250,
    rrRealized: 3.26,
    rrPlanned: 3.30,
    entryDate: '2026-09-02T02:15:00Z',
    exitDate: '2026-09-02T19:40:00Z',
    session: 'ASIA',
    timeframe: '1h',
    setupModel: 'High Timeframe Discount Array',
    confluences: ['4h Market Structure Shift (MSS)', 'OTE Fib 0.618 - 0.786', 'Equal Highs (EQH) Liquidity'],
    partials: [
      { id: 'p1', percentage: 40, exitPrice: 60100.00, lotSize: 0.6, pnl: 1140.00, time: '11:00', note: 'Scaled 40% at range equilibrium' },
      { id: 'p2', percentage: 60, exitPrice: 62450.00, lotSize: 0.9, pnl: 3825.00, time: '19:40', note: 'Final target reached at major weekly resistance' },
    ],
    chartUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    chartThumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    notes: '4H MSS with clean displacement upwards. Entered on OTE 70.5% retracement inside 1H bullish imbalance during Asia session. Held patiently through London chop.',
    psychology: ['Discipline 10/10', 'Held Through Retracement'],
    mistakes: ['None (Clean Execution)'],
    rating: 5,
  },
  {
    id: 'TRD-2026-0905',
    symbol: 'GBPUSD',
    assetClass: 'Forex',
    direction: 'SHORT',
    status: 'CLOSED',
    result: 'BE',
    entryPrice: 1.31200,
    exitPrice: 1.31200,
    stopLoss: 1.31550,
    takeProfit: 1.30150,
    lotSize: 3.0,
    contractMultiplier: 100000,
    netPnl: -18.00,
    grossPnl: 0.00,
    commission: 18.00,
    pips: 0,
    rrRealized: 0.0,
    rrPlanned: 3.0,
    entryDate: '2026-08-31T08:15:00Z',
    exitDate: '2026-08-31T11:05:00Z',
    session: 'LONDON',
    timeframe: '5m',
    setupModel: 'London Open Killzone',
    confluences: ['1h Order Block', 'Trendline Liquidity Grab'],
    partials: [],
    chartUrl: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=1600&q=80',
    chartThumbnail: 'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=400&q=80',
    notes: 'Trade moved +1.8R in our favor quickly, moved stop loss to break-even to protect capital ahead of UK GDP flash news. Whiplash tagged BE before dumping.',
    psychology: ['Moved SL Too Fast', 'Followed Trade Plan'],
    mistakes: ['Moved Stop Loss to BE Prematurely'],
    rating: 4,
  }
];

// Calculation helper functions
export function calculateTradeMetrics(trades: Trade[]) {
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  const totalTrades = closedTrades.length;
  
  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      beTrades: 0,
      winRate: 0,
      netPnl: 0,
      grossProfit: 0,
      grossLoss: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      avgRR: 0,
      bestTrade: 0,
      worstTrade: 0,
      expectancy: 0,
      openTradesCount: trades.filter(t => t.status === 'OPEN').length,
    };
  }

  const wins = closedTrades.filter(t => t.netPnl > 0);
  const losses = closedTrades.filter(t => t.netPnl < 0);
  const bes = closedTrades.filter(t => Math.abs(t.netPnl) <= 25 && t.result === 'BE');

  const grossProfit = wins.reduce((acc, t) => acc + t.netPnl, 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.netPnl, 0));
  const netPnl = closedTrades.reduce((acc, t) => acc + t.netPnl, 0);
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 99.9 : 0);
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  
  const realizedRRs = closedTrades.map(t => t.rrRealized).filter(r => typeof r === 'number' && !isNaN(r));
  const avgRR = realizedRRs.length > 0 ? realizedRRs.reduce((a, b) => a + b, 0) / realizedRRs.length : 0;

  const pnls = closedTrades.map(t => t.netPnl);
  const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0;
  const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0;

  // Expectancy = (Win% * AvgWin) - (Loss% * AvgLoss)
  const winFraction = wins.length / totalTrades;
  const lossFraction = losses.length / totalTrades;
  const expectancy = (winFraction * avgWin) - (lossFraction * avgLoss);

  return {
    totalTrades,
    winningTrades: wins.length,
    losingTrades: losses.length,
    beTrades: bes.length,
    winRate: Number(winRate.toFixed(1)),
    netPnl: Number(netPnl.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    avgRR: Number(avgRR.toFixed(2)),
    bestTrade: Number(bestTrade.toFixed(2)),
    worstTrade: Number(worstTrade.toFixed(2)),
    expectancy: Number(expectancy.toFixed(2)),
    openTradesCount: trades.filter(t => t.status === 'OPEN').length,
  };
}
