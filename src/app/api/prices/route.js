import { NextResponse } from 'next/server';

let cryptoCache = {
  data: null,
  timestamp: 0
};
const CRYPTO_CACHE_TTL_MS = 10000;

export async function GET() {
  const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json'
  };

  try {
    const stockSymbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META'];
    const binanceSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'PAXGUSDT'];
    const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(binanceSymbols))}`;

    const now = Date.now();
    const shouldFetchCrypto = !cryptoCache.data || (now - cryptoCache.timestamp > CRYPTO_CACHE_TTL_MS);

    const [cryptoRes, forexRes, stocksRes] = await Promise.allSettled([
      shouldFetchCrypto
        ? fetch(binanceUrl, { headers: commonHeaders, cache: 'no-store' }).then(async r => {
            if (!r.ok) throw new Error(`Binance 24hr API HTTP ${r.status}`);
            return { type: 'binance', data: await r.json() };
          })
        : Promise.resolve(cryptoCache.data),
      fetch('https://open.er-api.com/v6/latest/USD', { headers: commonHeaders, cache: 'no-store' }).then(async r => {
        if (!r.ok) throw new Error(`ER-API HTTP ${r.status}`);
        return r.json();
      }),
      Promise.allSettled(
        stockSymbols.map(sym =>
          fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1m&range=1d`, { 
            headers: commonHeaders,
            cache: 'no-store'
          }).then(async r => {
            if (!r.ok) throw new Error(`Yahoo Finance ${sym} HTTP ${r.status}`);
            return r.json();
          })
        )
      )
    ]);

    let isCryptoLive = false;
    let isForexLive = false;
    let isStockLive = false;

    // Default Crypto Data (Latest Market Fallbacks)
    const cryptoData = {
      BTC: { price: 80055.00, change: 0.55, high: 80200.00, low: 79440.00, volume: '18.4K BTC' },
      ETH: { price: 2512.00, change: 2.39, high: 2515.00, low: 2445.00, volume: '142K ETH' },
      SOL: { price: 106.45, change: 4.41, high: 107.00, low: 101.60, volume: '840K SOL' },
      BNB: { price: 765.20, change: 5.61, high: 780.00, low: 720.00, volume: '120K BNB' },
      XRP: { price: 1.4290, change: 2.05, high: 1.4330, low: 1.3950, volume: '45M XRP' },
      ADA: { price: 0.2230, change: 5.73, high: 0.2240, low: 0.2100, volume: '22M ADA' },
      DOGE: { price: 0.0915, change: 8.11, high: 0.0950, low: 0.0845, volume: '180M DOGE' }
    };

    // Default Forex and Commodities Data
    const forexData = {
      'EUR/USD': { price: 1.0845, change: 0.12, high: 1.0890, low: 1.0812, volume: '85K Lots' },
      'GBP/USD': { price: 1.2825, change: 0.18, high: 1.2910, low: 1.2780, volume: '62K Lots' },
      'USD/JPY': { price: 155.60, change: -0.22, high: 156.40, low: 154.80, volume: '98K Lots' },
      'AUD/USD': { price: 0.6650, change: 0.05, high: 0.6690, low: 0.6610, volume: '44K Lots' },
      'USD/CAD': { price: 1.3720, change: 0.15, high: 1.3780, low: 1.3680, volume: '38K Lots' },
      'USD/CHF': { price: 0.9020, change: -0.10, high: 0.9065, low: 0.8980, volume: '31K Lots' },
      'XAU/USD': { price: 4431.50, change: -0.07, high: 4435.00, low: 4427.00, volume: '38K Lots' }
    };

    const binanceSymbolMap = {
      'BTCUSDT': 'BTC',
      'ETHUSDT': 'ETH',
      'SOLUSDT': 'SOL',
      'BNBUSDT': 'BNB',
      'XRPUSDT': 'XRP',
      'ADAUSDT': 'ADA',
      'DOGEUSDT': 'DOGE'
    };

    let rawCrypto = null;
    if (cryptoRes.status === 'fulfilled' && cryptoRes.value && cryptoRes.value.data) {
      rawCrypto = cryptoRes.value;
      if (shouldFetchCrypto) {
        cryptoCache = { data: rawCrypto, timestamp: now };
      }
    } else if (cryptoCache.data) {
      rawCrypto = cryptoCache.data;
    } else {
      console.error('[Prices API Binance Error]:', cryptoRes.reason || cryptoRes.value);
    }

    if (rawCrypto && Array.isArray(rawCrypto.data)) {
      isCryptoLive = true;
      rawCrypto.data.forEach(item => {
        const lastPrice = parseFloat(item.lastPrice);
        const change = parseFloat(parseFloat(item.priceChangePercent || 0).toFixed(2));
        const high = parseFloat(item.highPrice);
        const low = parseFloat(item.lowPrice);
        const volumeUnits = parseFloat(item.volume);

        if (item.symbol === 'PAXGUSDT') {
          if (lastPrice) {
            forexData['XAU/USD'] = {
              price: lastPrice,
              change: change,
              high: high || forexData['XAU/USD'].high,
              low: low || forexData['XAU/USD'].low,
              volume: volumeUnits ? `${(volumeUnits / 1000).toFixed(1)}K oz` : forexData['XAU/USD'].volume
            };
          }
        } else {
          const baseSymbol = binanceSymbolMap[item.symbol];
          if (baseSymbol && cryptoData[baseSymbol] && lastPrice) {
            const volumeStr = volumeUnits >= 1000000 
              ? `${(volumeUnits / 1000000).toFixed(1)}M ${baseSymbol}`
              : `${(volumeUnits / 1000).toFixed(1)}K ${baseSymbol}`;

            cryptoData[baseSymbol] = {
              price: lastPrice,
              change: change,
              high: high || cryptoData[baseSymbol].high,
              low: low || cryptoData[baseSymbol].low,
              volume: volumeStr || cryptoData[baseSymbol].volume
            };
          }
        }
      });
    }

    // 2. Parse Forex and Commodities
    if (forexRes.status === 'fulfilled' && forexRes.value && forexRes.value.rates) {
      isForexLive = true;
      const rates = forexRes.value.rates;
      
      const updateRate = (pair, rateVal, invert = false) => {
        if (!rateVal) return;
        const rate = invert ? 1 / rateVal : rateVal;
        const decimals = pair.includes('JPY') || pair.includes('XAU') ? 2 : 4;
        
        forexData[pair] = {
          price: parseFloat(rate.toFixed(decimals)),
          change: forexData[pair].change,
          high: parseFloat((rate * (1 + (decimals === 2 ? 0.005 : 0.0025))).toFixed(decimals)),
          low: parseFloat((rate * (1 - (decimals === 2 ? 0.005 : 0.0025))).toFixed(decimals)),
          volume: forexData[pair].volume
        };
      };
      
      updateRate('EUR/USD', rates.EUR, true);
      updateRate('GBP/USD', rates.GBP, true);
      updateRate('USD/JPY', rates.JPY, false);
      updateRate('AUD/USD', rates.AUD, true);
      updateRate('USD/CAD', rates.CAD, false);
      updateRate('USD/CHF', rates.CHF, false);
      if (!rawCrypto) {
        updateRate('XAU/USD', rates.XAU, true);
      }
    } else {
      console.error('[Prices API Forex Error]:', forexRes.reason || forexRes.value);
    }

    // 3. Parse Stocks
    const stockData = {
      AAPL: { price: 189.84, change: 1.85, high: 191.20, low: 188.10, volume: '42.5M Shares' },
      TSLA: { price: 180.20, change: -0.85, high: 184.50, low: 178.10, volume: '88M Shares' },
      NVDA: { price: 125.50, change: 4.25, high: 128.90, low: 122.10, volume: '145M Shares' },
      MSFT: { price: 420.10, change: 0.65, high: 423.80, low: 417.20, volume: '22M Shares' },
      AMZN: { price: 185.30, change: 1.15, high: 188.40, low: 183.10, volume: '35M Shares' },
      GOOGL: { price: 175.40, change: -0.32, high: 177.80, low: 174.10, volume: '28M Shares' },
      META: { price: 475.20, change: 2.18, high: 482.50, low: 468.90, volume: '18M Shares' }
    };

    let liveStockCount = 0;
    if (stocksRes.status === 'fulfilled' && Array.isArray(stocksRes.value)) {
      stocksRes.value.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.chart?.result?.[0]?.meta) {
          const meta = res.value.chart.result[0].meta;
          const sym = meta.symbol;
          if (sym && stockData[sym] && meta.regularMarketPrice !== undefined) {
            const price = parseFloat(meta.regularMarketPrice);
            const prevClose = meta.previousClose || meta.chartPreviousClose;
            const change = prevClose ? parseFloat((((price - prevClose) / prevClose) * 100).toFixed(2)) : stockData[sym].change;
            const high = parseFloat(meta.regularMarketDayHigh) || stockData[sym].high;
            const low = parseFloat(meta.regularMarketDayLow) || stockData[sym].low;
            const volume = meta.regularMarketVolume ? `${(meta.regularMarketVolume / 1000000).toFixed(1)}M Shares` : stockData[sym].volume;

            stockData[sym] = { price, change, high, low, volume };
            liveStockCount++;
          }
        } else {
          console.error('[Prices API Stock Symbol Error]:', res.reason || res.value);
        }
      });
    } else {
      console.error('[Prices API Stock Error]:', stocksRes.reason || stocksRes.value);
    }

    if (liveStockCount > 0) {
      isStockLive = true;
    }

    return NextResponse.json({
      _meta: {
        isLiveData: isCryptoLive && isForexLive && isStockLive,
        isCryptoLive,
        isForexLive,
        isStockLive,
        timestamp: new Date().toISOString()
      },
      ...cryptoData,
      ...forexData,
      ...stockData
    });
  } catch (error) {
    console.error('[Prices API Error]:', error);
    
    // Fallback payload
    return NextResponse.json({
      _meta: {
        isLiveData: false,
        isCryptoLive: false,
        isForexLive: false,
        isStockLive: false,
        timestamp: new Date().toISOString()
      },
      BTC: { price: 67240.50, change: 2.45, high: 68100.00, low: 65890.00, volume: '18.4K BTC' },
      ETH: { price: 3482.15, change: -1.20, high: 3560.40, low: 3410.20, volume: '142K ETH' },
      SOL: { price: 152.40, change: 3.12, high: 156.20, low: 148.50, volume: '840K SOL' },
      BNB: { price: 585.20, change: 1.45, high: 592.10, low: 575.80, volume: '120K BNB' },
      XRP: { price: 0.6250, change: -0.45, high: 0.6380, low: 0.6120, volume: '45M XRP' },
      ADA: { price: 0.4450, change: -1.15, high: 0.4580, low: 0.4350, volume: '22M ADA' },
      DOGE: { price: 0.1250, change: 4.85, high: 0.1320, low: 0.1180, volume: '180M DOGE' },
      'EUR/USD': { price: 1.0845, change: 0.12, high: 1.0890, low: 1.0812, volume: '85K Lots' },
      'GBP/USD': { price: 1.2825, change: 0.18, high: 1.2910, low: 1.2780, volume: '62K Lots' },
      'USD/JPY': { price: 155.60, change: -0.22, high: 156.40, low: 154.80, volume: '98K Lots' },
      'AUD/USD': { price: 0.6650, change: 0.05, high: 0.6690, low: 0.6610, volume: '44K Lots' },
      'USD/CAD': { price: 1.3720, change: 0.15, high: 1.3780, low: 1.3680, volume: '38K Lots' },
      'USD/CHF': { price: 0.9020, change: -0.10, high: 0.9065, low: 0.8980, volume: '31K Lots' },
      'XAU/USD': { price: 2380.50, change: 0.79, high: 2405.00, low: 2368.00, volume: '38K Lots' },
      AAPL: { price: 189.84, change: 1.85, high: 191.20, low: 188.10, volume: '42.5M Shares' },
      TSLA: { price: 180.20, change: -0.85, high: 184.50, low: 178.10, volume: '88M Shares' },
      NVDA: { price: 125.50, change: 4.25, high: 128.90, low: 122.10, volume: '145M Shares' },
      MSFT: { price: 420.10, change: 0.65, high: 423.80, low: 417.20, volume: '22M Shares' },
      AMZN: { price: 185.30, change: 1.15, high: 188.40, low: 183.10, volume: '35M Shares' },
      GOOGL: { price: 175.40, change: -0.32, high: 177.80, low: 174.10, volume: '28M Shares' },
      META: { price: 475.20, change: 2.18, high: 482.50, low: 468.90, volume: '18M Shares' }
    });
  }
}
