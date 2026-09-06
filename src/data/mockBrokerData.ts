export interface ConnectedBrokerAccount {
  id: string;
  brokerName: string;
  server: string;
  accountNumber: string;
  nickname: string;
  accountType: 'Live' | 'Demo' | 'Prop Firm';
  platform: 'MT5' | 'MT4';
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  leverage: number;
  status: 'connected' | 'syncing' | 'disconnected' | 'error';
  lastSyncedAt: string;
  autoSyncInterval: '15m' | '1h' | 'realtime' | 'off';
  totalSyncedTrades: number;
  winRate: number;
  netProfit: number;
}

export interface SyncedTradeFill {
  ticket: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  closePrice: number;
  sl?: number;
  tp?: number;
  openTime: string;
  closeTime: string;
  pnl: number;
  pips: number;
  commission: number;
  swap: number;
  syncStatus: 'Imported' | 'Duplicate Skipped' | 'Pending Review';
  journalStatus?: 'Sent' | 'Unsent';
  strategyTag?: string;
  session?: 'London' | 'New York' | 'Asia';
}

export interface BrokerServerOption {
  id: string;
  name: string;
  broker: string;
  category: 'Prop Firm' | 'Retail Forex' | 'Crypto / CFD';
  pingMs: number;
  defaultServer: string;
  logoColor: string;
}

export const POPULAR_SERVERS: BrokerServerOption[] = [
  { id: 'exness-real', name: 'Exness-MT5Real14', broker: 'Exness', category: 'Retail Forex', pingMs: 18, defaultServer: 'Exness-MT5Real14', logoColor: '#F5A623' },
  { id: 'ftmo-server', name: 'FTMO-Server', broker: 'FTMO', category: 'Prop Firm', pingMs: 24, defaultServer: 'FTMO-Server-US', logoColor: '#0066FF' },
  { id: 'icmarkets-live', name: 'ICMarketsSC-Live04', broker: 'IC Markets', category: 'Retail Forex', pingMs: 14, defaultServer: 'ICMarketsSC-Live04', logoColor: '#00B159' },
  { id: 'pepperstone-live', name: 'Pepperstone-MT5-Live01', broker: 'Pepperstone', category: 'Retail Forex', pingMs: 21, defaultServer: 'Pepperstone-MT5-Live01', logoColor: '#E63946' },
  { id: 'fundingpips-live', name: 'FundingPips-Server', broker: 'Funding Pips', category: 'Prop Firm', pingMs: 29, defaultServer: 'FundingPips-Server', logoColor: '#8B5CF6' },
  { id: 'myforexfunds-live', name: 'TheFundedTrader-Live', broker: 'The Funded Trader', category: 'Prop Firm', pingMs: 35, defaultServer: 'TheFundedTrader-Live', logoColor: '#EC4899' },
  { id: 'xm-real', name: 'XMGlobal-MT5', broker: 'XM Global', category: 'Retail Forex', pingMs: 31, defaultServer: 'XMGlobal-MT5', logoColor: '#D90429' },
  { id: 'hantec-live', name: 'HantecMarkets-Live', broker: 'Hantec Markets', category: 'Retail Forex', pingMs: 28, defaultServer: 'HantecMarkets-Live', logoColor: '#06B6D4' }
];

export const INITIAL_CONNECTED_ACCOUNT: ConnectedBrokerAccount = {
  id: 'mt5-acc-8829104',
  brokerName: 'FTMO',
  server: 'FTMO-Server-US',
  accountNumber: '8829104',
  nickname: '100K Funded Challenge #2',
  accountType: 'Prop Firm',
  platform: 'MT5',
  balance: 104280.50,
  equity: 104840.10,
  margin: 1240.00,
  freeMargin: 103600.10,
  marginLevel: 8454.8,
  currency: 'USD',
  leverage: 100,
  status: 'connected',
  lastSyncedAt: '2 mins ago',
  autoSyncInterval: '15m',
  totalSyncedTrades: 42,
  winRate: 64.2,
  netProfit: 4280.50,
};

export const INITIAL_SYNCED_TRADES: SyncedTradeFill[] = [
  {
    ticket: '#94810238',
    symbol: 'EURUSD',
    type: 'BUY',
    lots: 2.50,
    openPrice: 1.08420,
    closePrice: 1.08940,
    sl: 1.08250,
    tp: 1.08950,
    openTime: '2026-09-06 08:30:12',
    closeTime: '2026-09-06 10:15:44',
    pnl: 1300.00,
    pips: 52.0,
    commission: -12.50,
    swap: 0.00,
    syncStatus: 'Imported',
    journalStatus: 'Sent',
    strategyTag: 'ICT London Open FVG',
    session: 'London'
  },
  {
    ticket: '#94809812',
    symbol: 'XAUUSD',
    type: 'SELL',
    lots: 1.00,
    openPrice: 2488.50,
    closePrice: 2471.20,
    sl: 2494.00,
    tp: 2470.00,
    openTime: '2026-09-05 14:00:20',
    closeTime: '2026-09-05 15:48:10',
    pnl: 1730.00,
    pips: 173.0,
    commission: -10.00,
    swap: -3.20,
    syncStatus: 'Imported',
    journalStatus: 'Sent',
    strategyTag: 'SMC NY Liquidity Sweep',
    session: 'New York'
  },
  {
    ticket: '#94798210',
    symbol: 'GBPUSD',
    type: 'BUY',
    lots: 3.00,
    openPrice: 1.29850,
    closePrice: 1.29420,
    sl: 1.29400,
    tp: 1.30600,
    openTime: '2026-09-04 09:12:05',
    closeTime: '2026-09-04 11:22:30',
    pnl: -1290.00,
    pips: -43.0,
    commission: -15.00,
    swap: 0.00,
    syncStatus: 'Imported',
    journalStatus: 'Unsent',
    strategyTag: 'Order Block Bounce',
    session: 'London'
  },
  {
    ticket: '#94784401',
    symbol: 'USDJPY',
    type: 'BUY',
    lots: 2.00,
    openPrice: 147.250,
    closePrice: 148.120,
    sl: 146.900,
    tp: 148.200,
    openTime: '2026-09-03 01:15:30',
    closeTime: '2026-09-03 06:45:10',
    pnl: 1184.20,
    pips: 87.0,
    commission: -10.00,
    swap: 8.50,
    syncStatus: 'Imported',
    journalStatus: 'Sent',
    strategyTag: 'Asia Range Breakout',
    session: 'Asia'
  },
  {
    ticket: '#94776190',
    symbol: 'NAS100',
    type: 'SELL',
    lots: 1.50,
    openPrice: 19850.0,
    closePrice: 19740.0,
    sl: 19920.0,
    tp: 19700.0,
    openTime: '2026-09-02 15:30:00',
    closeTime: '2026-09-02 16:55:18',
    pnl: 1650.00,
    pips: 110.0,
    commission: -15.00,
    swap: 0.00,
    syncStatus: 'Imported',
    journalStatus: 'Unsent',
    strategyTag: 'Silver Bullet NY PM',
    session: 'New York'
  },
  {
    ticket: '#94762118',
    symbol: 'BTCUSD',
    type: 'BUY',
    lots: 0.50,
    openPrice: 62400.0,
    closePrice: 61820.0,
    sl: 61800.0,
    tp: 64000.0,
    openTime: '2026-09-01 20:10:44',
    closeTime: '2026-09-01 23:40:02',
    pnl: -290.00,
    pips: -580.0,
    commission: -5.00,
    swap: -2.10,
    syncStatus: 'Duplicate Skipped',
    journalStatus: 'Unsent',
    strategyTag: 'Weekend Crypto Sweep',
    session: 'Asia'
  }
];

export function generateRandomTrade(existingTickets: string[]): SyncedTradeFill {
  const symbols = ['EURUSD', 'XAUUSD', 'GBPUSD', 'USDJPY', 'NAS100', 'US30', 'AUDUSD', 'USDCAD'];
  const types: ('BUY' | 'SELL')[] = ['BUY', 'SELL'];
  const sessions: ('London' | 'New York' | 'Asia')[] = ['London', 'New York', 'Asia'];
  const tags = ['ICT Fair Value Gap', 'SMC Order Block', 'Liquidity Sweep Entry', 'Silver Bullet Setup', 'Breaker Block Retest'];
  
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const session = sessions[Math.floor(Math.random() * sessions.length)];
  const strategyTag = tags[Math.floor(Math.random() * tags.length)];
  
  const isWin = Math.random() > 0.35;
  const lots = +(0.5 + Math.random() * 2.5).toFixed(2);
  const pnl = isWin 
    ? +(150 + Math.random() * 1800).toFixed(2)
    : +(-100 - Math.random() * 950).toFixed(2);
    
  let ticket = `#948${Math.floor(10000 + Math.random() * 89999)}`;
  while (existingTickets.includes(ticket)) {
    ticket = `#948${Math.floor(10000 + Math.random() * 89999)}`;
  }

  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

  return {
    ticket,
    symbol,
    type,
    lots,
    openPrice: symbol.includes('XAU') ? 2470.50 : symbol.includes('NAS') ? 19800.0 : 1.0850,
    closePrice: symbol.includes('XAU') ? 2482.10 : symbol.includes('NAS') ? 19890.0 : 1.0890,
    openTime: dateStr,
    closeTime: dateStr,
    pnl,
    pips: +(Math.abs(pnl) / (lots * 10)).toFixed(1) * (pnl >= 0 ? 1 : -1),
    commission: -+(lots * 5).toFixed(2),
    swap: 0,
    syncStatus: 'Imported',
    journalStatus: 'Unsent',
    strategyTag,
    session
  };
}
