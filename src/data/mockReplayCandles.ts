import { CandleData, SessionJumpPoint } from '../types/replay';

/**
 * Deterministic Pseudo-Random Number Generator (Mulberry32)
 * Ensures 100% identical outputs on Server (SSR) and Client (Hydration)
 */
function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

// Fixed deterministic base timestamp (prevents SSR / client clock skew)
const DETERMINISTIC_BASE_TIME = 1725619200; // 2024-09-06 10:40:00 UTC

/**
 * High-fidelity deterministic OHLCV candle generator
 * Produces multi-day intraday market structures (Asian range, London sweep, NY trend run)
 */
export function generateReplayDataset(
  symbol: string = 'XAUUSD',
  timeframe: string = '5m',
  candleCount: number = 300,
  seedModifier: number = 42
): { candles: CandleData[]; jumpPoints: SessionJumpPoint[] } {
  let basePrice = 2485.50;
  let pipMultiplier = 10;
  let volatility = 1.25;

  if (symbol === 'EURUSD') {
    basePrice = 1.08450;
    pipMultiplier = 10000;
    volatility = 0.00045;
  } else if (symbol === 'BTCUSD') {
    basePrice = 64250.00;
    pipMultiplier = 1;
    volatility = 85.0;
  } else if (symbol === 'NAS100') {
    basePrice = 19680.00;
    pipMultiplier = 1;
    volatility = 18.5;
  }

  // Generate deterministic random function from symbol & timeframe hash
  const seed = (hashString(`${symbol}_${timeframe}`) + seedModifier) >>> 0;
  const prng = createPRNG(seed);

  const candles: CandleData[] = [];
  const tfSeconds = timeframe === '1m' ? 60 : timeframe === '5m' ? 300 : timeframe === '15m' ? 900 : 3600;
  const startTime = DETERMINISTIC_BASE_TIME - candleCount * tfSeconds;

  let currentPrice = basePrice;
  const jumpPoints: SessionJumpPoint[] = [];

  // Simulate realistic 3-phase institutional market cycle
  for (let i = 0; i < candleCount; i++) {
    const barTimestamp = startTime + i * tfSeconds;
    const dateObj = new Date(barTimestamp * 1000);
    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} UTC`;

    let session: 'asia' | 'london' | 'ny' | 'off' = 'off';
    let trendBias = 0; // -1 bearish, +1 bullish
    let currentVol = volatility;

    // Session determination & market regime simulation:
    // 00:00 - 07:00 UTC: Asian Session (Tight consolidation, range bound)
    if (hours >= 0 && hours < 7) {
      session = 'asia';
      trendBias = Math.sin(i / 6) * 0.15; // oscillating range
      currentVol = volatility * 0.55;
    }
    // 07:00 - 12:00 UTC: London Session (Liquidity grab / Judas swing then trend)
    else if (hours >= 7 && hours < 12) {
      session = 'london';
      if (hours < 9) {
        trendBias = -0.4; // early liquidity sweep downward
        currentVol = volatility * 1.35;
      } else {
        trendBias = 0.65; // sharp reversal upward
        currentVol = volatility * 1.8;
      }
    }
    // 12:00 - 19:00 UTC: New York Session (High volume expansion / continuation)
    else if (hours >= 12 && hours < 19) {
      session = 'ny';
      if (hours === 13 && minutes <= 30) {
        trendBias = 0.9; // NY Open breakout spike
        currentVol = volatility * 2.4;
      } else if (hours >= 14 && hours <= 16) {
        trendBias = 0.5; // steady trend continuation
        currentVol = volatility * 1.4;
      } else {
        trendBias = -0.2; // PM profit taking
        currentVol = volatility * 0.9;
      }
    }

    const open = currentPrice;
    const delta = (prng() - 0.48 + trendBias * 0.22) * currentVol * 2.2;
    const close = +(open + delta).toFixed(symbol === 'EURUSD' ? 5 : 2);
    
    // Realistic wick extension
    const upperWick = prng() * currentVol * 1.6;
    const lowerWick = prng() * currentVol * 1.6;

    const high = +(Math.max(open, close) + upperWick).toFixed(symbol === 'EURUSD' ? 5 : 2);
    const low = +(Math.min(open, close) - lowerWick).toFixed(symbol === 'EURUSD' ? 5 : 2);
    
    const baseVolume = 350;
    const volume = Math.round(baseVolume * (1 + Math.abs(delta) / currentVol + (session === 'ny' ? 1.5 : session === 'london' ? 1.1 : 0.4)) * (0.8 + prng() * 0.6));

    let isKeyLevel = false;
    let annotation: string | undefined = undefined;

    // Detect and mark signature ICT setups for quick jumping
    if (i === Math.floor(candleCount * 0.2)) {
      isKeyLevel = true;
      annotation = 'Asia Low Swept';
      jumpPoints.push({
        id: 'asia-sweep',
        title: 'Asia Range Low Liquidity Sweep',
        description: 'Asian low swept during London pre-market setup',
        index: i,
        timestamp: barTimestamp,
        timeStr,
        sessionType: 'asia'
      });
    } else if (i === Math.floor(candleCount * 0.45)) {
      isKeyLevel = true;
      annotation = 'London Judas Swing';
      jumpPoints.push({
        id: 'london-open',
        title: 'London Open Expansion (07:00 UTC)',
        description: 'Bullish market structure shift with Fair Value Gap',
        index: i,
        timestamp: barTimestamp,
        timeStr,
        sessionType: 'london'
      });
    } else if (i === Math.floor(candleCount * 0.7)) {
      isKeyLevel = true;
      annotation = 'NY AM Silver Bullet';
      jumpPoints.push({
        id: 'ny-open',
        title: 'New York Silver Bullet (14:00 UTC)',
        description: 'High momentum algorithmic delivery into buy-side liquidity',
        index: i,
        timestamp: barTimestamp,
        timeStr,
        sessionType: 'ny'
      });
    } else if (i === Math.floor(candleCount * 0.88)) {
      isKeyLevel = true;
      annotation = 'High Impact News Release';
      jumpPoints.push({
        id: 'news-event',
        title: 'CPI / Rate Decision Release',
        description: 'Extreme volatility burst with high volume reaction',
        index: i,
        timestamp: barTimestamp,
        timeStr,
        sessionType: 'news'
      });
    }

    candles.push({
      time: timeStr,
      timestamp: barTimestamp,
      open,
      high,
      low,
      close,
      volume,
      session,
      isKeyLevel,
      annotation
    });

    currentPrice = close;
  }

  return { candles, jumpPoints };
}

export const AVAILABLE_SYMBOLS = [
  { id: 'XAUUSD', name: 'Gold / US Dollar', category: 'Metals', precision: 2, pipSize: 0.1, pipValuePerLot: 100 },
  { id: 'EURUSD', name: 'Euro / US Dollar', category: 'Forex', precision: 5, pipSize: 0.0001, pipValuePerLot: 10 },
  { id: 'BTCUSD', name: 'Bitcoin / US Dollar', category: 'Crypto', precision: 2, pipSize: 1.0, pipValuePerLot: 1 },
  { id: 'NAS100', name: 'Nasdaq 100 Index', category: 'Indices', precision: 2, pipSize: 1.0, pipValuePerLot: 20 },
  { id: 'US30', name: 'Dow Jones 30 Index', category: 'Indices', precision: 2, pipSize: 1.0, pipValuePerLot: 20 },
  { id: 'SPX500', name: 'S&P 500 Index', category: 'Indices', precision: 2, pipSize: 1.0, pipValuePerLot: 50 },
  { id: 'ETHUSD', name: 'Ethereum / US Dollar', category: 'Crypto', precision: 2, pipSize: 1.0, pipValuePerLot: 1 },
  { id: 'SOLUSD', name: 'Solana / US Dollar', category: 'Crypto', precision: 2, pipSize: 0.1, pipValuePerLot: 10 },
  { id: 'GBPUSD', name: 'British Pound / US Dollar', category: 'Forex', precision: 5, pipSize: 0.0001, pipValuePerLot: 10 },
  { id: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'Forex', precision: 2, pipSize: 0.01, pipValuePerLot: 10 },
];

export const AVAILABLE_TIMEFRAMES = [
  { id: '1m', label: '1m', desc: '1 Minute' },
  { id: '5m', label: '5m', desc: '5 Minutes' },
  { id: '15m', label: '15m', desc: '15 Minutes' },
  { id: '1h', label: '1H', desc: '1 Hour' },
  { id: '4h', label: '4H', desc: '4 Hours' },
  { id: '1D', label: '1D', desc: 'Daily' },
];
