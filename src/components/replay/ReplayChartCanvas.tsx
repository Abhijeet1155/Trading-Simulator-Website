'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  createChart, 
  CandlestickSeries, 
  HistogramSeries, 
  LineStyle,
  createSeriesMarkers,
  IChartApi, 
  ISeriesApi, 
  IPriceLine,
  UTCTimestamp,
  Time,
  SeriesMarker
} from 'lightweight-charts';
import { CandleData, ReplayPosition } from '../../types/replay';
import { useTheme } from '@/context/ThemeContext';
import { Scissors } from 'lucide-react';

interface ReplayChartCanvasProps {
  candles: CandleData[];
  visibleIndex: number;
  isScissorsActive: boolean;
  onCutAt: (index: number) => void;
  activePosition: ReplayPosition | null;
  tradeHistory?: ReplayPosition[];
  symbol: string;
  timeframe: string;
}

export default function ReplayChartCanvas({
  candles,
  visibleIndex,
  isScissorsActive,
  onCutAt,
  activePosition,
  tradeHistory = [],
  symbol,
  timeframe,
}: ReplayChartCanvasProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick', Time> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram', Time> | null>(null);
  const markersPluginRef = useRef<any>(null);

  // Active position price lines
  const entryLineRef = useRef<IPriceLine | null>(null);
  const slLineRef = useRef<IPriceLine | null>(null);
  const tpLineRef = useRef<IPriceLine | null>(null);

  // Track previously rendered visibleIndex to detect single-step vs seek
  const prevVisibleIndexRef = useRef<number>(-1);
  const prevDatasetLengthRef = useRef<number>(0);
  const prevSymbolRef = useRef<string>('');

  // Hovered bar state for legend display
  const [hoveredCandle, setHoveredCandle] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    time: string;
  } | null>(null);

  // Helper to format candle for Lightweight Charts
  const formatCandleForChart = useCallback((c: CandleData) => {
    return {
      time: (c.timestamp || Math.floor(new Date(c.time).getTime() / 1000)) as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    };
  }, []);

  const formatVolumeForChart = useCallback((c: CandleData) => {
    const isUp = c.close >= c.open;
    return {
      time: (c.timestamp || Math.floor(new Date(c.time).getTime() / 1000)) as UTCTimestamp,
      value: c.volume || 0,
      color: isUp ? 'rgba(8, 153, 129, 0.5)' : 'rgba(242, 54, 69, 0.5)',
    };
  }, []);

  // 1. Initialize TradingView Lightweight Chart
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const chart = createChart(container, {
      width,
      height,
      layout: {
        background: { color: isDark ? '#131722' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#475569',
        fontSize: 11,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
      grid: {
        vertLines: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
        horzLines: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: {
          color: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
          width: 1,
          style: LineStyle.Dashed,
        },
      },
      rightPriceScale: {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        scaleMargins: {
          top: 0.08,
          bottom: 0.22, // leaves room for bottom volume bars
        },
      },
      timeScale: {
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 8,
        minBarSpacing: 3,
      },
    });

    // Main Candlestick Series (Professional Emerald Green & Crimson Red)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#089981',
      downColor: '#f23645',
      borderUpColor: '#089981',
      borderDownColor: '#f23645',
      wickUpColor: '#089981',
      wickDownColor: '#f23645',
    });

    // Volume Histogram Series (Bottom overlay)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // overlay mode
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.80, // Volume occupies bottom 20%
        bottom: 0,
      },
    });

    // Initialize Markers Plugin for Entry / Exit Markers
    const markersPlugin = createSeriesMarkers(candleSeries, []);

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    markersPluginRef.current = markersPlugin;

    // Crosshair Move Subscription (Legend update)
    chart.subscribeCrosshairMove((param) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        setHoveredCandle(null);
      } else {
        const cData = param.seriesData.get(candleSeries) as any;
        const vData = param.seriesData.get(volumeSeries) as any;
        if (cData) {
          const date = new Date((param.time as number) * 1000);
          const timeStr = `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')} UTC`;
          setHoveredCandle({
            open: cData.open,
            high: cData.high,
            low: cData.low,
            close: cData.close,
            volume: vData?.value || 0,
            time: timeStr,
          });
        }
      }
    });

    // Scissors Click Subscription
    chart.subscribeClick((param) => {
      if (!param.time) return;
      const clickedTimestamp = param.time as number;
      
      // Find index in candles
      const idx = candles.findIndex((c) => {
        const cTime = c.timestamp || Math.floor(new Date(c.time).getTime() / 1000);
        return cTime === clickedTimestamp;
      });

      if (idx !== -1) {
        onCutAt(idx);
      }
    });

    // Handle Container Resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartRef.current) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      if (newWidth > 0 && newHeight > 0) {
        chartRef.current.applyOptions({ width: newWidth, height: newHeight });
      }
    });

    resizeObserver.observe(container);

    // Initial population
    if (candles.length > 0 && visibleIndex >= 0) {
      const initialSlice = candles.slice(0, visibleIndex + 1);
      const formattedCandles = initialSlice.map(formatCandleForChart);
      const formattedVolumes = initialSlice.map(formatVolumeForChart);
      candleSeries.setData(formattedCandles);
      volumeSeries.setData(formattedVolumes);
      chart.timeScale().scrollToRealTime();
      prevVisibleIndexRef.current = visibleIndex;
      prevDatasetLengthRef.current = candles.length;
      prevSymbolRef.current = symbol;
    }

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      markersPluginRef.current = null;
      entryLineRef.current = null;
      slLineRef.current = null;
      tpLineRef.current = null;
    };
  }, [isDark]); // Re-create if theme changes

  // 2. Handle Replay Sync: Smooth updates (update() vs setData())
  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    const chart = chartRef.current;
    if (!candleSeries || !volumeSeries || !chart || candles.length === 0) return;

    const isSameDataset = prevDatasetLengthRef.current === candles.length && prevSymbolRef.current === symbol;
    const isSingleStepForward = isSameDataset && visibleIndex === prevVisibleIndexRef.current + 1;

    if (isSingleStepForward && candles[visibleIndex]) {
      // SMOOTH ANIMATION: Add exactly one bar via update() - Zero flickering!
      const newCandle = formatCandleForChart(candles[visibleIndex]);
      const newVol = formatVolumeForChart(candles[visibleIndex]);
      candleSeries.update(newCandle);
      volumeSeries.update(newVol);
      chart.timeScale().scrollToPosition(0, false);
    } else {
      // Seek / Scrub / Cut / Symbol Change: Set full sliced dataset up to visibleIndex
      const sliced = candles.slice(0, visibleIndex + 1);
      const formattedCandles = sliced.map(formatCandleForChart);
      const formattedVolumes = sliced.map(formatVolumeForChart);
      candleSeries.setData(formattedCandles);
      volumeSeries.setData(formattedVolumes);
      
      if (!isSameDataset) {
        // Fit all bars in view on new symbol/dataset load
        chart.timeScale().fitContent();
      } else {
        chart.timeScale().scrollToPosition(0, false);
      }
    }

    prevVisibleIndexRef.current = visibleIndex;
    prevDatasetLengthRef.current = candles.length;
    prevSymbolRef.current = symbol;
  }, [candles, visibleIndex, symbol, formatCandleForChart, formatVolumeForChart]);

  // 3. Handle Active Position Lines (ENTRY / SL / TP)
  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    if (!candleSeries) return;

    // Clean up previous price lines
    if (entryLineRef.current) {
      try { candleSeries.removePriceLine(entryLineRef.current); } catch {}
      entryLineRef.current = null;
    }
    if (slLineRef.current) {
      try { candleSeries.removePriceLine(slLineRef.current); } catch {}
      slLineRef.current = null;
    }
    if (tpLineRef.current) {
      try { candleSeries.removePriceLine(tpLineRef.current); } catch {}
      tpLineRef.current = null;
    }

    // If active open position exists, draw new price lines
    if (activePosition && activePosition.status === 'OPEN') {
      const decimals = symbol.includes('EUR') ? 5 : 2;
      
      // Entry Line
      entryLineRef.current = candleSeries.createPriceLine({
        price: activePosition.entryPrice,
        color: '#00b4d8',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `${activePosition.type} ${activePosition.lots}L @ ${activePosition.entryPrice.toFixed(decimals)}`,
      });

      // Stop Loss Line
      if (activePosition.sl) {
        slLineRef.current = candleSeries.createPriceLine({
          price: activePosition.sl,
          color: '#ef4444',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `SL: ${activePosition.sl.toFixed(decimals)}`,
        });
      }

      // Take Profit Line
      if (activePosition.tp) {
        tpLineRef.current = candleSeries.createPriceLine({
          price: activePosition.tp,
          color: '#10b981',
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `TP: ${activePosition.tp.toFixed(decimals)}`,
        });
      }
    }
  }, [activePosition, symbol]);

  // 4. Handle Entry / Exit Markers on Candlestick Series
  useEffect(() => {
    const markersPlugin = markersPluginRef.current;
    if (!markersPlugin || candles.length === 0) return;

    const markers: SeriesMarker<Time>[] = [];
    const allTrades = [...(activePosition ? [activePosition] : []), ...tradeHistory];

    allTrades.forEach((trade) => {
      const openIdx = trade.openBarIndex ?? 0;
      const closeIdx = trade.closeBarIndex;
      const openCandle = candles[openIdx];

      // Entry Marker (Green Up Arrow for BUY / Blue for SELL)
      if (openCandle && openIdx <= visibleIndex) {
        const time = (openCandle.timestamp || Math.floor(new Date(openCandle.time).getTime() / 1000)) as UTCTimestamp;
        markers.push({
          time,
          position: trade.type === 'BUY' ? 'belowBar' : 'aboveBar',
          color: trade.type === 'BUY' ? '#10b981' : '#3b82f6',
          shape: trade.type === 'BUY' ? 'arrowUp' : 'arrowDown',
          text: `${trade.type} ${trade.lots}L @ ${trade.entryPrice.toFixed(symbol.includes('EUR') ? 5 : 2)}`,
        });
      }

      // Exit Marker (Red / Green Arrow at Close bar)
      if (closeIdx !== undefined && closeIdx <= visibleIndex && candles[closeIdx]) {
        const closeCandle = candles[closeIdx];
        const time = (closeCandle.timestamp || Math.floor(new Date(closeCandle.time).getTime() / 1000)) as UTCTimestamp;
        const isProfit = (trade.pnl || 0) >= 0;
        markers.push({
          time,
          position: trade.type === 'BUY' ? 'aboveBar' : 'belowBar',
          color: isProfit ? '#10b981' : '#ef4444',
          shape: 'circle',
          text: `EXIT (${isProfit ? '+' : ''}$${(trade.pnl || 0).toFixed(2)})`,
        });
      }
    });

    // Sort markers by time ASC (Required by Lightweight Charts)
    markers.sort((a, b) => (a.time as number) - (b.time as number));

    try {
      markersPlugin.setMarkers(markers);
    } catch (err) {
      console.warn('[Replay Markers Plugin Error]:', err);
    }
  }, [activePosition, tradeHistory, visibleIndex, candles, symbol]);

  const currentBar = candles[visibleIndex] || candles[0];
  const displayCandle = hoveredCandle || (currentBar ? {
    open: currentBar.open,
    high: currentBar.high,
    low: currentBar.low,
    close: currentBar.close,
    volume: currentBar.volume,
    time: currentBar.time,
  } : null);

  const decimals = symbol.includes('EUR') ? 5 : 2;
  const isUp = displayCandle ? displayCandle.close >= displayCandle.open : true;
  const priceChange = displayCandle ? displayCandle.close - displayCandle.open : 0;
  const priceChangePercent = displayCandle && displayCandle.open > 0 ? (priceChange / displayCandle.open) * 100 : 0;

  return (
    <div className="w-full h-full relative flex flex-col bg-white dark:bg-[#131722] select-none overflow-hidden">
      
      {/* Top Legend Overlay */}
      <div className="absolute top-2 left-3 z-20 flex flex-wrap items-center gap-3 text-[11px] font-mono pointer-events-none bg-white/85 dark:bg-[#131722]/85 backdrop-blur-sm px-2.5 py-1 rounded-md border border-gray-200/60 dark:border-white/[0.06] shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-gray-900 dark:text-neutral-100">{symbol}</span>
          <span className="text-gray-400 dark:text-neutral-500">•</span>
          <span className="text-[#2563EB] dark:text-blue-400">{timeframe}</span>
        </div>

        {displayCandle && (
          <div className="flex items-center gap-2 text-[10px]">
            <span>O: <span className={isUp ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>{displayCandle.open.toFixed(decimals)}</span></span>
            <span>H: <span className={isUp ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>{displayCandle.high.toFixed(decimals)}</span></span>
            <span>L: <span className={isUp ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>{displayCandle.low.toFixed(decimals)}</span></span>
            <span>C: <span className={isUp ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>{displayCandle.close.toFixed(decimals)}</span></span>
            <span>Vol: <span className="text-gray-700 dark:text-neutral-300 font-semibold">{displayCandle.volume.toLocaleString()}</span></span>
            <span className={`font-bold ml-1 ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(decimals)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>

      {/* Scissors Cut Tool Active Floating Banner */}
      {isScissorsActive && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-slate-950 px-3.5 py-1 rounded-full shadow-lg text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
          <Scissors className="w-3.5 h-3.5 rotate-90" />
          <span>Click any candle on the chart to cut replay timeline to that point</span>
        </div>
      )}

      {/* Lightweight Chart DOM Container */}
      <div 
        ref={containerRef} 
        className={`w-full h-full flex-1 ${isScissorsActive ? 'cursor-crosshair' : 'cursor-default'}`} 
      />
    </div>
  );
}
