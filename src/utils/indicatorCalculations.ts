import { CandleData } from '../types/replay';
import { 
  FVGZone, 
  OrderBlockZone, 
  LiquidityLevel, 
  KillzoneBand, 
  EMAData, 
  IndicatorSettings 
} from '../types/indicators';

/**
 * 1. Calculate ICT Fair Value Gaps (FVG / Imbalances)
 * 3-Candle Pattern:
 * - Bullish FVG: Bar 1 High < Bar 3 Low (Displacement up)
 * - Bearish FVG: Bar 1 Low > Bar 3 High (Displacement down)
 * Tracks horizontal extension & mitigation against future visible bars.
 */
export function calculateFVGs(
  candles: CandleData[],
  settings: IndicatorSettings['fvg']
): FVGZone[] {
  if (!settings.enabled || candles.length < 3) return [];

  const fvgs: FVGZone[] = [];
  const minGapThreshold = 0.00005; // filter microscopic noise

  for (let i = 2; i < candles.length; i++) {
    const bar1 = candles[i - 2];
    const bar2 = candles[i - 1]; // displacement candle
    const bar3 = candles[i];

    // Bullish FVG (Gap between Bar 1 High and Bar 3 Low)
    if (bar3.low > bar1.high + minGapThreshold && bar2.close > bar2.open) {
      const topPrice = bar3.low;
      const bottomPrice = bar1.high;
      const midPrice = +( (topPrice + bottomPrice) / 2 );

      // Check subsequent candles for mitigation
      let isMitigated = false;
      let endBarIndex = candles.length - 1;
      let mitigatedBarIndex: number | undefined = undefined;

      for (let k = i + 1; k < candles.length; k++) {
        // If price dips into or below the FVG 50% Consequent Encroachment (or full fill)
        if (candles[k].low <= (settings.showCE ? midPrice : bottomPrice)) {
          isMitigated = true;
          endBarIndex = k;
          mitigatedBarIndex = k;
          break;
        }
      }

      if (!settings.showUnmitigatedOnly || !isMitigated) {
        fvgs.push({
          id: `fvg_bull_${i}`,
          type: 'BULLISH',
          startBarIndex: i - 1,
          endBarIndex,
          topPrice,
          bottomPrice,
          midPrice,
          isMitigated,
          mitigatedBarIndex
        });
      }
    }

    // Bearish FVG (Gap between Bar 1 Low and Bar 3 High)
    else if (bar1.low > bar3.high + minGapThreshold && bar2.close < bar2.open) {
      const topPrice = bar1.low;
      const bottomPrice = bar3.high;
      const midPrice = +( (topPrice + bottomPrice) / 2 );

      let isMitigated = false;
      let endBarIndex = candles.length - 1;
      let mitigatedBarIndex: number | undefined = undefined;

      for (let k = i + 1; k < candles.length; k++) {
        // If price rallies into or above the FVG 50% Consequent Encroachment (or full fill)
        if (candles[k].high >= (settings.showCE ? midPrice : topPrice)) {
          isMitigated = true;
          endBarIndex = k;
          mitigatedBarIndex = k;
          break;
        }
      }

      if (!settings.showUnmitigatedOnly || !isMitigated) {
        fvgs.push({
          id: `fvg_bear_${i}`,
          type: 'BEARISH',
          startBarIndex: i - 1,
          endBarIndex,
          topPrice,
          bottomPrice,
          midPrice,
          isMitigated,
          mitigatedBarIndex
        });
      }
    }
  }

  return fvgs;
}

/**
 * 2. Calculate SMC Institutional Order Blocks (OB)
 * Bullish Order Block (+OB): The last down-close candle before a strong upward displacement break.
 * Bearish Order Block (-OB): The last up-close candle before a strong downward displacement break.
 */
export function calculateOrderBlocks(
  candles: CandleData[],
  settings: IndicatorSettings['orderBlocks']
): OrderBlockZone[] {
  if (!settings.enabled || candles.length < 5) return [];

  const orderBlocks: OrderBlockZone[] = [];

  for (let i = 2; i < candles.length - 2; i++) {
    const obCandidate = candles[i];
    const disp1 = candles[i + 1];
    const disp2 = candles[i + 2];

    const avgBody = Math.abs(obCandidate.close - obCandidate.open) || 0.1;

    // Bullish OB (+OB): Down-close candle followed by 2 strong expansion up candles
    const isBullishDisplacement = 
      obCandidate.close < obCandidate.open && // down candle
      disp1.close > disp1.open &&
      disp2.close > disp2.open &&
      disp2.close > obCandidate.high && // breaks above OB high
      (disp1.close - disp1.open + disp2.close - disp2.open) > avgBody * 2.2;

    if (isBullishDisplacement) {
      const topPrice = obCandidate.high;
      const bottomPrice = obCandidate.low;
      const meanThreshold = +( (topPrice + bottomPrice) / 2 );

      let isMitigated = false;
      let endBarIndex = candles.length - 1;
      let mitigatedBarIndex: number | undefined = undefined;

      // Track future mitigation
      for (let k = i + 3; k < candles.length; k++) {
        if (candles[k].low <= (settings.showMeanThreshold ? meanThreshold : bottomPrice)) {
          isMitigated = true;
          endBarIndex = k;
          mitigatedBarIndex = k;
          break;
        }
      }

      if (!settings.showUnmitigatedOnly || !isMitigated) {
        orderBlocks.push({
          id: `ob_bull_${i}`,
          type: 'BULLISH',
          barIndex: i,
          endBarIndex,
          topPrice,
          bottomPrice,
          meanThreshold,
          isMitigated,
          mitigatedBarIndex
        });
      }
    }

    // Bearish OB (-OB): Up-close candle followed by 2 strong expansion down candles
    const isBearishDisplacement =
      obCandidate.close > obCandidate.open && // up candle
      disp1.close < disp1.open &&
      disp2.close < disp2.open &&
      disp2.close < obCandidate.low && // breaks below OB low
      (disp1.open - disp1.close + disp2.open - disp2.close) > avgBody * 2.2;

    if (isBearishDisplacement) {
      const topPrice = obCandidate.high;
      const bottomPrice = obCandidate.low;
      const meanThreshold = +( (topPrice + bottomPrice) / 2 );

      let isMitigated = false;
      let endBarIndex = candles.length - 1;
      let mitigatedBarIndex: number | undefined = undefined;

      for (let k = i + 3; k < candles.length; k++) {
        if (candles[k].high >= (settings.showMeanThreshold ? meanThreshold : topPrice)) {
          isMitigated = true;
          endBarIndex = k;
          mitigatedBarIndex = k;
          break;
        }
      }

      if (!settings.showUnmitigatedOnly || !isMitigated) {
        orderBlocks.push({
          id: `ob_bear_${i}`,
          type: 'BEARISH',
          barIndex: i,
          endBarIndex,
          topPrice,
          bottomPrice,
          meanThreshold,
          isMitigated,
          mitigatedBarIndex
        });
      }
    }
  }

  return orderBlocks;
}

/**
 * 3. Calculate Session Liquidity Levels & Sweeps (BSL / SSL)
 * Finds Asian Session (00:00 - 07:00 UTC) High/Low and London Session High/Low.
 * Flags wicks that pierce the level without closing beyond it as a "Sweep".
 */
export function calculateLiquidityLevels(
  candles: CandleData[],
  settings: IndicatorSettings['liquiditySweeps']
): LiquidityLevel[] {
  if (!settings.enabled || candles.length === 0) return [];

  const levels: LiquidityLevel[] = [];

  // Group bars by session
  let asiaStartIndex = -1;
  let asiaEndIndex = -1;
  let asiaHigh = -Infinity;
  let asiaLow = Infinity;

  candles.forEach((c, idx) => {
    if (c.session === 'asia') {
      if (asiaStartIndex === -1) asiaStartIndex = idx;
      asiaEndIndex = idx;
      if (c.high > asiaHigh) asiaHigh = c.high;
      if (c.low < asiaLow) asiaLow = c.low;
    }
  });

  // Asian High (BSL)
  if (settings.showAsia && asiaStartIndex !== -1 && asiaHigh !== -Infinity) {
    let isSwept = false;
    let sweptBarIndex: number | undefined = undefined;
    let sweptPrice: number | undefined = undefined;
    let endBarIndex = candles.length - 1;

    for (let k = asiaEndIndex + 1; k < candles.length; k++) {
      if (candles[k].high > asiaHigh) {
        isSwept = true;
        sweptBarIndex = k;
        sweptPrice = candles[k].high;
        endBarIndex = k;
        break;
      }
    }

    levels.push({
      id: 'asia_bsl',
      name: 'Asia High (BSL)',
      price: asiaHigh,
      startBarIndex: asiaStartIndex,
      endBarIndex,
      type: 'BSL',
      isSwept,
      sweptBarIndex,
      sweptPrice
    });

    // Asian Low (SSL)
    let isLowSwept = false;
    let sweptLowBarIndex: number | undefined = undefined;
    let sweptLowPrice: number | undefined = undefined;
    let endLowBarIndex = candles.length - 1;

    for (let k = asiaEndIndex + 1; k < candles.length; k++) {
      if (candles[k].low < asiaLow) {
        isLowSwept = true;
        sweptLowBarIndex = k;
        sweptLowPrice = candles[k].low;
        endLowBarIndex = k;
        break;
      }
    }

    levels.push({
      id: 'asia_ssl',
      name: 'Asia Low (SSL)',
      price: asiaLow,
      startBarIndex: asiaStartIndex,
      endBarIndex: endLowBarIndex,
      type: 'SSL',
      isSwept: isLowSwept,
      sweptBarIndex: sweptLowBarIndex,
      sweptPrice: sweptLowPrice
    });
  }

  return levels;
}

/**
 * 4. Calculate Killzones Bands (Asian, London Open, NY AM)
 */
export function calculateKillzones(
  candles: CandleData[],
  settings: IndicatorSettings['killzones']
): KillzoneBand[] {
  if (!settings.enabled || candles.length === 0) return [];

  const bands: KillzoneBand[] = [];
  let currentSession: string | null = null;
  let sessionStart = -1;

  candles.forEach((c, idx) => {
    if (c.session !== currentSession) {
      if (currentSession && sessionStart !== -1) {
        if (
          (currentSession === 'asia' && settings.showAsia) ||
          (currentSession === 'london' && settings.showLondon) ||
          (currentSession === 'ny' && settings.showNY)
        ) {
          bands.push({
            id: `kz_${currentSession}_${sessionStart}`,
            name: currentSession.toUpperCase(),
            startBarIndex: sessionStart,
            endBarIndex: idx - 1,
            color: currentSession === 'london' ? '#2563eb' : currentSession === 'ny' ? '#f59e0b' : '#64748b',
            label: currentSession === 'london' ? 'LONDON KZ' : currentSession === 'ny' ? 'NY AM KZ' : 'ASIA RANGE'
          });
        }
      }
      currentSession = c.session || null;
      sessionStart = idx;
    }
  });

  // Finish trailing session
  if (currentSession && sessionStart !== -1) {
    if (
      (currentSession === 'asia' && settings.showAsia) ||
      (currentSession === 'london' && settings.showLondon) ||
      (currentSession === 'ny' && settings.showNY)
    ) {
      bands.push({
        id: `kz_${currentSession}_${sessionStart}`,
        name: currentSession.toUpperCase(),
        startBarIndex: sessionStart,
        endBarIndex: candles.length - 1,
        color: currentSession === 'london' ? '#2563eb' : currentSession === 'ny' ? '#f59e0b' : '#64748b',
        label: currentSession === 'london' ? 'LONDON KZ' : currentSession === 'ny' ? 'NY AM KZ' : 'ASIA RANGE'
      });
    }
  }

  return bands;
}

/**
 * 5. Exponential Moving Average (EMA) Calculation
 * Formula: EMA_t = Price_t * alpha + EMA_{t-1} * (1 - alpha)
 * where alpha = 2 / (period + 1)
 */
export function calculateEMAs(
  candles: CandleData[],
  settings: IndicatorSettings['emaRibbon']
): EMAData[] {
  if (!settings.enabled || candles.length === 0) return [];

  const results: EMAData[] = [];
  const periods = [
    { period: 20, enabled: settings.ema20, color: settings.ema20Color },
    { period: 50, enabled: settings.ema50, color: settings.ema50Color },
    { period: 200, enabled: settings.ema200, color: settings.ema200Color },
  ];

  periods.forEach(({ period, enabled, color }) => {
    if (!enabled) return;

    const values: (number | null)[] = new Array(candles.length).fill(null);
    if (candles.length < period) {
      results.push({ period, color, values });
      return;
    }

    const alpha = 2 / (period + 1);

    // Initial SMA for first value
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += candles[i].close;
    }
    let prevEma = sum / period;
    values[period - 1] = prevEma;

    // Recursive calculation
    for (let i = period; i < candles.length; i++) {
      const currentEma = candles[i].close * alpha + prevEma * (1 - alpha);
      values[i] = currentEma;
      prevEma = currentEma;
    }

    results.push({ period, color, values });
  });

  return results;
}

/**
 * 6. Simple / Exponential Moving Average Calculation
 */
export function calculateMA(
  candles: CandleData[],
  settings: IndicatorSettings['ma']
): { period: number; color: string; values: (number | null)[] } | null {
  if (!settings.enabled || candles.length === 0) return null;
  const period = settings.period || 20;
  const values: (number | null)[] = new Array(candles.length).fill(null);
  
  if (candles.length < period) return { period, color: settings.color, values };

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  values[period - 1] = sum / period;

  for (let i = period; i < candles.length; i++) {
    sum += candles[i].close - candles[i - period].close;
    values[i] = sum / period;
  }

  return { period, color: settings.color, values };
}

/**
 * 7. RSI (Relative Strength Index) Calculation
 */
export function calculateRSI(
  candles: CandleData[],
  settings: IndicatorSettings['rsi']
): { period: number; color: string; values: (number | null)[] } | null {
  if (!settings.enabled || candles.length === 0) return null;
  const period = settings.period || 14;
  const values: (number | null)[] = new Array(candles.length).fill(null);

  if (candles.length <= period) return { period, color: settings.color, values };

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  values[period] = 100 - (100 / (1 + rs));

  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    values[i] = +(100 - (100 / (1 + rs))).toFixed(2);
  }

  return { period, color: settings.color, values };
}

/**
 * 8. MACD (Moving Average Convergence Divergence) Calculation
 */
export function calculateMACD(
  candles: CandleData[],
  settings: IndicatorSettings['macd']
): { fastPeriod: number; slowPeriod: number; signalPeriod: number; macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } | null {
  if (!settings.enabled || candles.length === 0) return null;
  const { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = settings;

  const macdValues: (number | null)[] = new Array(candles.length).fill(null);
  const signalValues: (number | null)[] = new Array(candles.length).fill(null);
  const histValues: (number | null)[] = new Array(candles.length).fill(null);

  if (candles.length < slowPeriod) {
    return { fastPeriod, slowPeriod, signalPeriod, macd: macdValues, signal: signalValues, histogram: histValues };
  }

  // Calculate Fast EMA & Slow EMA
  const calcEmaArray = (p: number) => {
    const arr: (number | null)[] = new Array(candles.length).fill(null);
    const alpha = 2 / (p + 1);
    let s = 0;
    for (let i = 0; i < p; i++) s += candles[i].close;
    let prev = s / p;
    arr[p - 1] = prev;
    for (let i = p; i < candles.length; i++) {
      const cur = candles[i].close * alpha + prev * (1 - alpha);
      arr[i] = cur;
      prev = cur;
    }
    return arr;
  };

  const fastEma = calcEmaArray(fastPeriod);
  const slowEma = calcEmaArray(slowPeriod);

  for (let i = slowPeriod - 1; i < candles.length; i++) {
    if (fastEma[i] !== null && slowEma[i] !== null) {
      macdValues[i] = (fastEma[i] as number) - (slowEma[i] as number);
    }
  }

  // Signal line EMA of MACD
  const signalAlpha = 2 / (signalPeriod + 1);
  let sigSum = 0;
  const startSigIdx = slowPeriod - 1 + signalPeriod - 1;
  if (candles.length > startSigIdx) {
    for (let i = slowPeriod - 1; i <= startSigIdx; i++) {
      sigSum += macdValues[i] || 0;
    }
    let prevSig = sigSum / signalPeriod;
    signalValues[startSigIdx] = prevSig;
    histValues[startSigIdx] = (macdValues[startSigIdx] || 0) - prevSig;

    for (let i = startSigIdx + 1; i < candles.length; i++) {
      const curMacd = macdValues[i] || 0;
      const curSig = curMacd * signalAlpha + prevSig * (1 - signalAlpha);
      signalValues[i] = curSig;
      histValues[i] = curMacd - curSig;
      prevSig = curSig;
    }
  }

  return { fastPeriod, slowPeriod, signalPeriod, macd: macdValues, signal: signalValues, histogram: histValues };
}

/**
 * 9. Bollinger Bands Calculation
 */
export function calculateBollingerBands(
  candles: CandleData[],
  settings: IndicatorSettings['bollinger']
): { period: number; stdDev: number; color: string; upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } | null {
  if (!settings.enabled || candles.length === 0) return null;
  const period = settings.period || 20;
  const mult = settings.stdDev || 2;

  const upper: (number | null)[] = new Array(candles.length).fill(null);
  const middle: (number | null)[] = new Array(candles.length).fill(null);
  const lower: (number | null)[] = new Array(candles.length).fill(null);

  if (candles.length < period) {
    return { period, stdDev: mult, color: settings.color, upper, middle, lower };
  }

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let k = i - period + 1; k <= i; k++) {
      sum += candles[k].close;
    }
    const sma = sum / period;
    middle[i] = sma;

    let varianceSum = 0;
    for (let k = i - period + 1; k <= i; k++) {
      varianceSum += Math.pow(candles[k].close - sma, 2);
    }
    const std = Math.sqrt(varianceSum / period);
    upper[i] = sma + mult * std;
    lower[i] = sma - mult * std;
  }

  return { period, stdDev: mult, color: settings.color, upper, middle, lower };
}

