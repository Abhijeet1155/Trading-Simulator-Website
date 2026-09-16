'use client';

import { useState, useEffect, useMemo } from 'react';
import { CandleData } from '../types/replay';
import { 
  IndicatorSettings, 
  DEFAULT_INDICATOR_SETTINGS, 
  FVGZone, 
  OrderBlockZone, 
  LiquidityLevel, 
  KillzoneBand, 
  EMAData 
} from '../types/indicators';
import { 
  calculateFVGs, 
  calculateOrderBlocks, 
  calculateLiquidityLevels, 
  calculateKillzones, 
  calculateEMAs,
  calculateMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands
} from '../utils/indicatorCalculations';


const STORAGE_KEY = 'paperpulse_replay_indicators_v1';

export function useICTIndicators(candles: CandleData[], visibleIndex: number) {
  // Sliced candles strictly up to visibleIndex (eliminates forward-looking bias)
  const visibleCandles = useMemo(() => {
    return candles.slice(0, visibleIndex + 1);
  }, [candles, visibleIndex]);

  // Indicator Settings state
  const [settings, setSettings] = useState<IndicatorSettings>(DEFAULT_INDICATOR_SETTINGS);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Failed to load indicator settings from localStorage', e);
    } finally {
      setIsLoadedFromStorage(true);
    }
  }, []);

  // Save to localStorage
  const saveSettings = (newSettings: IndicatorSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed to save indicator settings to localStorage', e);
    }
  };

  // Reset to default settings
  const resetToDefaults = () => {
    saveSettings(DEFAULT_INDICATOR_SETTINGS);
  };

  // Calculate active indicator data dynamically
  const fvgs: FVGZone[] = useMemo(() => {
    return calculateFVGs(visibleCandles, settings.fvg);
  }, [visibleCandles, settings.fvg]);

  const orderBlocks: OrderBlockZone[] = useMemo(() => {
    return calculateOrderBlocks(visibleCandles, settings.orderBlocks);
  }, [visibleCandles, settings.orderBlocks]);

  const liquidityLevels: LiquidityLevel[] = useMemo(() => {
    return calculateLiquidityLevels(visibleCandles, settings.liquiditySweeps);
  }, [visibleCandles, settings.liquiditySweeps]);

  const killzones: KillzoneBand[] = useMemo(() => {
    return calculateKillzones(visibleCandles, settings.killzones);
  }, [visibleCandles, settings.killzones]);

  const emas: EMAData[] = useMemo(() => {
    return calculateEMAs(visibleCandles, settings.emaRibbon);
  }, [visibleCandles, settings.emaRibbon]);

  const ma = useMemo(() => {
    return calculateMA(visibleCandles, settings.ma);
  }, [visibleCandles, settings.ma]);

  const rsi = useMemo(() => {
    return calculateRSI(visibleCandles, settings.rsi);
  }, [visibleCandles, settings.rsi]);

  const macd = useMemo(() => {
    return calculateMACD(visibleCandles, settings.macd);
  }, [visibleCandles, settings.macd]);

  const bollinger = useMemo(() => {
    return calculateBollingerBands(visibleCandles, settings.bollinger);
  }, [visibleCandles, settings.bollinger]);

  // Count active enabled indicators
  const activeCount = useMemo(() => {
    let count = 0;
    if (settings.ma?.enabled) count++;
    if (settings.rsi?.enabled) count++;
    if (settings.macd?.enabled) count++;
    if (settings.bollinger?.enabled) count++;
    if (settings.volume?.enabled) count++;
    if (settings.fvg?.enabled) count++;
    if (settings.orderBlocks?.enabled) count++;
    if (settings.liquiditySweeps?.enabled) count++;
    if (settings.killzones?.enabled) count++;
    if (settings.emaRibbon?.enabled) count++;
    return count;
  }, [settings]);

  return {
    settings,
    setSettings,
    saveSettings,
    resetToDefaults,
    activeCount,
    fvgs,
    orderBlocks,
    liquidityLevels,
    killzones,
    emas,
    ma,
    rsi,
    macd,
    bollinger
  };
}

