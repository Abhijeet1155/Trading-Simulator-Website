import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

interface CandlestickRow {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function getSecondsForTimeframe(tf: string): number {
  switch (tf) {
    case '1m': return 60;
    case '5m': return 300;
    case '15m': return 900;
    case '1h':
    case '1H': return 3600;
    case '4h':
    case '4H': return 14400;
    case '1D':
    case '1d': return 86400;
    default: return 900;
  }
}

function parseTimeParam(param: string | null): number | undefined {
  if (!param) return undefined;
  if (/^\d+$/.test(param)) {
    const num = parseInt(param, 10);
    return num > 1e11 ? Math.floor(num / 1000) : num;
  }
  const parsed = Date.parse(param);
  if (!isNaN(parsed)) {
    return Math.floor(parsed / 1000);
  }
  return undefined;
}

/**
 * Fetch real historical candles from Binance API for crypto and gold (PAXG)
 */
async function fetchBinanceKlines(symbol: string, interval: string, limit: number = 300): Promise<CandlestickRow[] | null> {
  const binanceMap: Record<string, string> = {
    'BTCUSD': 'BTCUSDT',
    'BTCUSDT': 'BTCUSDT',
    'BTC': 'BTCUSDT',
    'ETHUSD': 'ETHUSDT',
    'ETH': 'ETHUSDT',
    'SOLUSD': 'SOLUSDT',
    'SOL': 'SOLUSDT',
    'XAUUSD': 'PAXGUSDT',
  };

  const binanceSymbol = binanceMap[symbol.toUpperCase()];
  if (!binanceSymbol) return null;

  const intervalMap: Record<string, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '1H': '1h',
    '4h': '4h',
    '4H': '4h',
    '1D': '1d',
    '1d': '1d'
  };
  const tf = intervalMap[interval] || '15m';

  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${tf}&limit=${limit}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return data.map((item: any) => ({
      time: Math.floor(item[0] / 1000),
      open: parseFloat(parseFloat(item[1]).toFixed(symbol.includes('EUR') ? 5 : 2)),
      high: parseFloat(parseFloat(item[2]).toFixed(symbol.includes('EUR') ? 5 : 2)),
      low: parseFloat(parseFloat(item[3]).toFixed(symbol.includes('EUR') ? 5 : 2)),
      close: parseFloat(parseFloat(item[4]).toFixed(symbol.includes('EUR') ? 5 : 2)),
      volume: Math.round(parseFloat(item[5]))
    }));
  } catch (err) {
    console.warn('[Replay API Binance Klines Error]:', err);
    return null;
  }
}

/**
 * Fetch real historical candles from Yahoo Finance API for Forex & Indices
 */
async function fetchYahooKlines(symbol: string, interval: string, count: number = 300): Promise<CandlestickRow[] | null> {
  const yahooMap: Record<string, string> = {
    'XAUUSD': 'GC=F',
    'EURUSD': 'EURUSD=X',
    'GBPUSD': 'GBPUSD=X',
    'USDJPY': 'JPY=X',
    'AUDUSD': 'AUDUSD=X',
    'USDCAD': 'CAD=X',
    'USDCHF': 'CHF=X',
    'NAS100': '^NDX',
    'US30': '^DJI',
    'SPX500': '^GSPC',
    'BTCUSD': 'BTC-USD',
    'AAPL': 'AAPL',
    'TSLA': 'TSLA',
    'NVDA': 'NVDA',
  };

  const ticker = yahooMap[symbol.toUpperCase()] || `${symbol}=X`;
  const intervalMap: Record<string, { interval: string; range: string }> = {
    '1m': { interval: '1m', range: '5d' },
    '5m': { interval: '5m', range: '1mo' },
    '15m': { interval: '15m', range: '1mo' },
    '1h': { interval: '60m', range: '3mo' },
    '1H': { interval: '60m', range: '3mo' },
    '4h': { interval: '60m', range: '6mo' },
    '4H': { interval: '60m', range: '6mo' },
    '1D': { interval: '1d', range: '1y' },
    '1d': { interval: '1d', range: '1y' },
  };

  const config = intervalMap[interval] || { interval: '15m', range: '1mo' };

  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${config.interval}&range=${config.range}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) return null;
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const timestamps = result.timestamp;
    const quotes = result.indicators?.quote?.[0];
    if (!timestamps || !quotes) return null;

    const bars: CandlestickRow[] = [];
    const len = timestamps.length;
    const startIndex = Math.max(0, len - count);

    for (let i = startIndex; i < len; i++) {
      const open = quotes.open?.[i];
      const high = quotes.high?.[i];
      const low = quotes.low?.[i];
      const close = quotes.close?.[i];
      const vol = quotes.volume?.[i] || 0;

      if (open != null && high != null && low != null && close != null) {
        bars.push({
          time: timestamps[i],
          open: parseFloat(open.toFixed(symbol.includes('EUR') ? 5 : 2)),
          high: parseFloat(high.toFixed(symbol.includes('EUR') ? 5 : 2)),
          low: parseFloat(low.toFixed(symbol.includes('EUR') ? 5 : 2)),
          close: parseFloat(close.toFixed(symbol.includes('EUR') ? 5 : 2)),
          volume: Math.round(vol)
        });
      }
    }

    return bars.length > 0 ? bars : null;
  } catch (err) {
    console.warn('[Replay API Yahoo Finance Error]:', err);
    return null;
  }
}

/**
 * Fallback deterministic high-fidelity realistic candlestick generator
 */
function generateRealisticCandlesticks(
  symbol: string,
  timeframe: string,
  count: number = 300,
  startTime?: number,
  endTime?: number
): CandlestickRow[] {
  const sym = symbol.toUpperCase();
  let basePrice = 2520.50; // XAUUSD
  let volatility = 2.15;
  let decimals = 2;

  if (sym === 'EURUSD') {
    basePrice = 1.08450;
    volatility = 0.00045;
    decimals = 5;
  } else if (sym === 'GBPUSD') {
    basePrice = 1.28400;
    volatility = 0.00055;
    decimals = 5;
  } else if (sym === 'USDJPY') {
    basePrice = 154.20;
    volatility = 0.35;
    decimals = 2;
  } else if (sym === 'BTCUSD' || sym === 'BTC' || sym === 'BTCUSDT') {
    basePrice = 67850.00;
    volatility = 135.0;
    decimals = 2;
  } else if (sym === 'ETHUSD' || sym === 'ETH') {
    basePrice = 2640.00;
    volatility = 14.5;
    decimals = 2;
  } else if (sym === 'SOLUSD' || sym === 'SOL') {
    basePrice = 152.50;
    volatility = 1.95;
    decimals = 2;
  } else if (sym === 'NAS100' || sym === 'NDX') {
    basePrice = 19780.00;
    volatility = 32.5;
    decimals = 2;
  } else if (sym === 'US30' || sym === 'DJI') {
    basePrice = 42650.00;
    volatility = 55.0;
    decimals = 2;
  } else if (sym === 'SPX500' || sym === 'SPX') {
    basePrice = 5790.00;
    volatility = 9.5;
    decimals = 2;
  }

  const tfSeconds = getSecondsForTimeframe(timeframe);
  const now = Math.floor(Date.now() / 1000);
  const end = endTime ? Number(endTime) : now;
  const start = startTime ? Number(startTime) : (end - count * tfSeconds);

  const bars: CandlestickRow[] = [];
  let currentPrice = basePrice;

  let seed = 123456789;
  for (let i = 0; i < sym.length; i++) {
    seed = (seed * 31 + sym.charCodeAt(i)) >>> 0;
  }

  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const total = Math.max(20, Math.min(1000, count));
  for (let i = 0; i < total; i++) {
    const barTime = start + i * tfSeconds;
    const delta = (rand() - 0.485) * volatility * 2.5;
    const open = +(currentPrice).toFixed(decimals);
    const close = +(open + delta).toFixed(decimals);
    const highWick = rand() * volatility * 1.5;
    const lowWick = rand() * volatility * 1.5;
    const high = +(Math.max(open, close) + highWick).toFixed(decimals);
    const low = +(Math.min(open, close) - lowWick).toFixed(decimals);
    const volume = Math.round(300 + rand() * 850 + Math.abs(delta / volatility) * 400);

    bars.push({
      time: barTime,
      open,
      high,
      low,
      close,
      volume
    });

    currentPrice = close;
  }

  return bars;
}

export async function GET(request: Request) {
  const supabaseAdmin = createAdminClient();

  try {
    const { searchParams } = new URL(request.url);
    const symbol = (searchParams.get('symbol') || 'XAUUSD').toUpperCase();
    const timeframe = searchParams.get('timeframe') || '15m';
    const startParam = searchParams.get('start') || searchParams.get('startTime');
    const endParam = searchParams.get('end') || searchParams.get('endTime');
    const count = parseInt(searchParams.get('count') || '300', 10);

    const startTime = parseTimeParam(startParam);
    const endTime = parseTimeParam(endParam);

    // 1. Try querying Database table `candlesticks` via Supabase if available
    try {
      if (supabaseAdmin) {
        let query = supabaseAdmin
          .from('candlesticks')
          .select('time, open, high, low, close, volume')
          .eq('symbol', symbol)
          .eq('timeframe', timeframe)
          .order('time', { ascending: true })
          .limit(count);

        if (startTime) {
          query = query.gte('time', startTime);
        }
        if (endTime) {
          query = query.lte('time', endTime);
        }

        const { data: dbBars, error: dbError } = await query;
        if (!dbError && dbBars && Array.isArray(dbBars) && dbBars.length > 5) {
          return NextResponse.json({
            success: true,
            source: 'database',
            symbol,
            timeframe,
            count: dbBars.length,
            bars: dbBars
          });
        }
      }
    } catch (dbErr) {
      console.warn('[Replay API] DB query skipped/failed, proceeding to market feed:', dbErr);
    }

    // 2. Try Live/Historical Market Feeds (Binance for Crypto/Gold, Yahoo Finance for Forex/Indices)
    let marketBars: CandlestickRow[] | null = null;
    if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL')) {
      marketBars = await fetchBinanceKlines(symbol, timeframe, count);
    }

    if (!marketBars) {
      marketBars = await fetchYahooKlines(symbol, timeframe, count);
    }

    if (marketBars && marketBars.length > 0) {
      let filtered = marketBars;
      if (startTime) {
        filtered = filtered.filter(b => b.time >= startTime);
      }
      if (endTime) {
        filtered = filtered.filter(b => b.time <= endTime);
      }

      if (filtered.length > 0) {
        return NextResponse.json({
          success: true,
          source: 'market_feed',
          symbol,
          timeframe,
          count: filtered.length,
          bars: filtered
        });
      }
    }

    // 3. Fallback High-Fidelity Historical Engine for All Pairs
    const fallbackBars = generateRealisticCandlesticks(symbol, timeframe, count, startTime, endTime);

    return NextResponse.json({
      success: true,
      source: 'simulated_historical',
      symbol,
      timeframe,
      count: fallbackBars.length,
      bars: fallbackBars
    });
  } catch (error: any) {
    console.error('[Replay Bars API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error fetching candlestick bars' },
      { status: 500 }
    );
  }
}
