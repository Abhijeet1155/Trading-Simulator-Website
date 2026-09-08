'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CandleData, 
  ReplayPosition, 
  ReplayAccountStats, 
  SpeedMultiplier,
  OrderDirection,
  SessionJumpPoint
} from '../../types/replay';
import { 
  generateReplayDataset, 
  AVAILABLE_SYMBOLS, 
  AVAILABLE_TIMEFRAMES 
} from '../../data/mockReplayCandles';
import { useICTIndicators } from '../../hooks/useICTIndicators';
import ReplayChartCanvas from './ReplayChartCanvas';
import ReplayControls from './ReplayControls';
import ReplayTradeWidget from './ReplayTradeWidget';
import IndicatorManagerModal from './IndicatorManagerModal';
import { 
  PlayCircle, 
  Layers, 
  Maximize2, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Settings2,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export default function BarReplayEngine() {
  const [mounted, setMounted] = useState(false);

  // Symbol & Timeframe
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m');

  // Candle Data & Replay State
  const [dataset, setDataset] = useState<{ candles: CandleData[]; jumpPoints: SessionJumpPoint[] }>(() => 
    generateReplayDataset('XAUUSD', '5m', 300)
  );

  // Default initial visible bars = 65% of dataset so user can immediately test replay
  const [visibleIndex, setVisibleIndex] = useState(() => Math.floor(300 * 0.65));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<SpeedMultiplier>(2);
  const [isScissorsActive, setIsScissorsActive] = useState(false);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Indicators Engine Hook (Calculates FVGs, OBs, Liquidity, Killzones, EMAs strictly up to visibleIndex)
  const {
    settings: indicatorSettings,
    setSettings: setIndicatorSettings,
    saveSettings: saveIndicatorSettings,
    resetToDefaults: resetIndicatorDefaults,
    activeCount: activeIndicatorCount,
    fvgs,
    orderBlocks,
    liquidityLevels,
    killzones,
    emas
  } = useICTIndicators(dataset.candles, visibleIndex);

  // Trading & Position State
  const [activePosition, setActivePosition] = useState<ReplayPosition | null>(null);
  const [tradeHistory, setTradeHistory] = useState<ReplayPosition[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'danger' | 'info' } | null>(null);

  // Account Stats
  const [stats, setStats] = useState<ReplayAccountStats>({
    startingBalance: 100000,
    currentBalance: 100000,
    equity: 100000,
    floatingPnl: 0,
    realizedPnl: 0,
    totalTrades: 0,
    winTrades: 0,
    lossTrades: 0,
    winRate: 0
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Show auto-dismiss toast
  const showToast = (text: string, type: 'success' | 'danger' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Re-generate dataset when Symbol or Timeframe changes
  const handleSymbolChange = (sym: string) => {
    setSelectedSymbol(sym);
    const newDataset = generateReplayDataset(sym, selectedTimeframe, 300);
    setDataset(newDataset);
    setVisibleIndex(Math.floor(newDataset.candles.length * 0.65));
    setIsPlaying(false);
    setActivePosition(null);
    showToast(`Loaded ${sym} historical market feed`, 'info');
  };

  const handleTimeframeChange = (tf: string) => {
    setSelectedTimeframe(tf);
    const newDataset = generateReplayDataset(selectedSymbol, tf, 300);
    setDataset(newDataset);
    setVisibleIndex(Math.floor(newDataset.candles.length * 0.65));
    setIsPlaying(false);
    setActivePosition(null);
    showToast(`Switched to ${tf} timeframe`, 'info');
  };

  // Quick toggle helper for header pills
  const toggleIndicatorQuick = (key: 'fvg' | 'orderBlocks' | 'liquiditySweeps' | 'killzones' | 'emaRibbon') => {
    const updated = {
      ...indicatorSettings,
      [key]: {
        ...indicatorSettings[key],
        enabled: !indicatorSettings[key].enabled
      }
    };
    saveIndicatorSettings(updated);
  };

  // Current bar reference
  const currentBar = dataset.candles[visibleIndex] || dataset.candles[0];
  const symbolMeta = AVAILABLE_SYMBOLS.find(s => s.id === selectedSymbol) || AVAILABLE_SYMBOLS[0];

  // Advance 1 Bar Logic (checks SL/TP triggers and updates floating PnL)
  const stepForward = useCallback(() => {
    setVisibleIndex((prevIndex) => {
      if (prevIndex >= dataset.candles.length - 1) {
        setIsPlaying(false);
        showToast('Reached end of live candle dataset', 'info');
        return prevIndex;
      }

      const nextIndex = prevIndex + 1;
      const nextBar = dataset.candles[nextIndex];

      // Check Active Position for SL / TP hits
      if (activePosition && activePosition.status === 'OPEN') {
        const isBuy = activePosition.type === 'BUY';
        let isClosed = false;
        let closePrice = nextBar.close;
        let closeReason: 'TP' | 'SL' | 'MANUAL' = 'MANUAL';

        // Long SL / TP Check
        if (isBuy) {
          if (activePosition.sl && nextBar.low <= activePosition.sl) {
            isClosed = true;
            closePrice = activePosition.sl;
            closeReason = 'SL';
          } else if (activePosition.tp && nextBar.high >= activePosition.tp) {
            isClosed = true;
            closePrice = activePosition.tp;
            closeReason = 'TP';
          }
        }
        // Short SL / TP Check
        else {
          if (activePosition.sl && nextBar.high >= activePosition.sl) {
            isClosed = true;
            closePrice = activePosition.sl;
            closeReason = 'SL';
          } else if (activePosition.tp && nextBar.low <= activePosition.tp) {
            isClosed = true;
            closePrice = activePosition.tp;
            closeReason = 'TP';
          }
        }

        if (isClosed) {
          const deltaPrice = isBuy ? (closePrice - activePosition.entryPrice) : (activePosition.entryPrice - closePrice);
          const pips = deltaPrice / symbolMeta.pipSize;
          const realizedPnl = pips * symbolMeta.pipValuePerLot * activePosition.lots;

          const closedTrade: ReplayPosition = {
            ...activePosition,
            status: 'CLOSED',
            closePrice,
            closeTime: nextBar.timestamp,
            closeBarIndex: nextIndex,
            closeReason,
            realizedPnl,
            pnl: realizedPnl,
            pnlPips: pips
          };

          setActivePosition(null);
          setTradeHistory(prev => [closedTrade, ...prev]);

          // Update Account Stats
          setStats(prev => {
            const newBalance = prev.currentBalance + realizedPnl;
            const newRealized = prev.realizedPnl + realizedPnl;
            const total = prev.totalTrades + 1;
            const wins = realizedPnl > 0 ? prev.winTrades + 1 : prev.winTrades;
            const losses = realizedPnl <= 0 ? prev.lossTrades + 1 : prev.lossTrades;
            const winRate = +((wins / total) * 100).toFixed(0);

            return {
              ...prev,
              currentBalance: newBalance,
              equity: newBalance,
              floatingPnl: 0,
              realizedPnl: newRealized,
              totalTrades: total,
              winTrades: wins,
              lossTrades: losses,
              winRate
            };
          });

          if (closeReason === 'TP') {
            showToast(`🎯 Take Profit Hit! +$${realizedPnl.toFixed(2)} (+${pips.toFixed(1)} pips)`, 'success');
          } else {
            showToast(`🛑 Stop Loss Triggered: -$${Math.abs(realizedPnl).toFixed(2)} (${pips.toFixed(1)} pips)`, 'danger');
          }
        } else {
          // Update Floating PnL on open position
          const deltaPrice = isBuy ? (nextBar.close - activePosition.entryPrice) : (activePosition.entryPrice - nextBar.close);
          const pips = deltaPrice / symbolMeta.pipSize;
          const floatingPnl = pips * symbolMeta.pipValuePerLot * activePosition.lots;

          setActivePosition(prev => prev ? {
            ...prev,
            pnl: floatingPnl,
            pnlPips: pips
          } : null);

          setStats(prev => ({
            ...prev,
            floatingPnl,
            equity: prev.currentBalance + floatingPnl
          }));
        }
      }

      return nextIndex;
    });
  }, [dataset.candles, activePosition, symbolMeta]);

  // Replay continuous playback loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(100, Math.floor(1000 / speed));
      timerRef.current = setInterval(() => {
        stepForward();
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, stepForward]);

  // Cut Bar Truncate Logic
  const handleCutAt = (targetIndex: number) => {
    setVisibleIndex(targetIndex);
    setIsScissorsActive(false);
    setIsPlaying(false);
    showToast(`Chart truncated to bar #${targetIndex + 1} (${dataset.candles[targetIndex]?.time})`, 'info');
  };

  // Jump to Session Anchor
  const handleJumpToSession = (targetIndex: number) => {
    setVisibleIndex(targetIndex);
    setIsPlaying(false);
    showToast(`Jumped to ${dataset.candles[targetIndex]?.time}`, 'info');
  };

  // Reset to live
  const handleReset = () => {
    setVisibleIndex(dataset.candles.length - 1);
    setIsPlaying(false);
    showToast('Replay restored to live end', 'info');
  };

  // Open Replay Position (Paper Execution in Replay)
  const handleOpenPosition = (direction: OrderDirection, lots: number, sl?: number, tp?: number) => {
    const entryPrice = currentBar.close;
    const newPos: ReplayPosition = {
      id: `rep_${Date.now()}`,
      symbol: selectedSymbol,
      type: direction,
      entryPrice,
      entryTime: currentBar.timestamp,
      entryBarIndex: visibleIndex,
      lots,
      sl,
      tp,
      pnl: 0,
      pnlPips: 0,
      status: 'OPEN'
    };

    setActivePosition(newPos);
    showToast(`Executed ${direction} ${lots}L @ ${entryPrice.toFixed(symbolMeta.precision)}`, 'success');
  };

  // Manual Close Position
  const handleClosePosition = () => {
    if (!activePosition) return;
    const isBuy = activePosition.type === 'BUY';
    const closePrice = currentBar.close;
    const deltaPrice = isBuy ? (closePrice - activePosition.entryPrice) : (activePosition.entryPrice - closePrice);
    const pips = deltaPrice / symbolMeta.pipSize;
    const realizedPnl = pips * symbolMeta.pipValuePerLot * activePosition.lots;

    const closedTrade: ReplayPosition = {
      ...activePosition,
      status: 'CLOSED',
      closePrice,
      closeTime: currentBar.timestamp,
      closeBarIndex: visibleIndex,
      closeReason: 'MANUAL',
      realizedPnl,
      pnl: realizedPnl,
      pnlPips: pips
    };

    setActivePosition(null);
    setTradeHistory(prev => [closedTrade, ...prev]);

    setStats(prev => {
      const newBalance = prev.currentBalance + realizedPnl;
      const newRealized = prev.realizedPnl + realizedPnl;
      const total = prev.totalTrades + 1;
      const wins = realizedPnl > 0 ? prev.winTrades + 1 : prev.winTrades;
      const losses = realizedPnl <= 0 ? prev.lossTrades + 1 : prev.lossTrades;
      const winRate = +((wins / total) * 100).toFixed(0);

      return {
        ...prev,
        currentBalance: newBalance,
        equity: newBalance,
        floatingPnl: 0,
        realizedPnl: newRealized,
        totalTrades: total,
        winTrades: wins,
        lossTrades: losses,
        winRate
      };
    });

    showToast(`Closed position: ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toFixed(2)}`, realizedPnl >= 0 ? 'success' : 'danger');
  };

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsScissorsActive(prev => !prev);
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReset();
      } else if (e.key.toLowerCase() === 'b' && !activePosition) {
        e.preventDefault();
        handleOpenPosition('BUY', 1.0);
      } else if (e.key.toLowerCase() === 's' && !activePosition) {
        e.preventDefault();
        handleOpenPosition('SELL', 1.0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepForward, activePosition]);

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none">
      
      {/* 1. Header Toolbar (Symbol, Timeframe, Indicator Manager Button, Quick Toggles) */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 shadow-xs transition-colors">
        
        {/* Left: Symbol & Timeframe Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Symbol Selector Pills */}
          <div className="flex items-center bg-gray-50 dark:bg-neutral-800/80 p-1 rounded-xl border border-gray-200 dark:border-neutral-700">
            {AVAILABLE_SYMBOLS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSymbolChange(s.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedSymbol === s.id
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {s.id}
              </button>
            ))}
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex items-center bg-gray-50 dark:bg-neutral-800/80 p-1 rounded-xl border border-gray-200 dark:border-neutral-700">
            {AVAILABLE_TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => handleTimeframeChange(tf.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  selectedTimeframe === tf.id
                    ? 'bg-amber-500 text-white font-bold shadow-2xs'
                    : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-[1px] bg-gray-200 dark:bg-neutral-700 hidden md:block" />

          {/* Master Indicators Drawer Button */}
          <button
            type="button"
            onClick={() => setIsIndicatorModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/50 text-[#2563EB] dark:text-blue-300 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Indicators ({activeIndicatorCount})</span>
            <Settings2 className="w-3 h-3 opacity-60 ml-0.5" />
          </button>
        </div>

        {/* Center/Right: Quick Indicator Toggle Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          {/* FVG Pill */}
          <button
            type="button"
            onClick={() => toggleIndicatorQuick('fvg')}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              indicatorSettings.fvg.enabled
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold'
                : 'bg-gray-50 dark:bg-neutral-800/80 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            FVG: {indicatorSettings.fvg.enabled ? 'ON' : 'OFF'}
          </button>

          {/* OB Pill */}
          <button
            type="button"
            onClick={() => toggleIndicatorQuick('orderBlocks')}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              indicatorSettings.orderBlocks.enabled
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-bold'
                : 'bg-gray-50 dark:bg-neutral-800/80 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            OB: {indicatorSettings.orderBlocks.enabled ? 'ON' : 'OFF'}
          </button>

          {/* Killzones Pill */}
          <button
            type="button"
            onClick={() => toggleIndicatorQuick('killzones')}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              indicatorSettings.killzones.enabled
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-bold'
                : 'bg-gray-50 dark:bg-neutral-800/80 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Killzones: {indicatorSettings.killzones.enabled ? 'ON' : 'OFF'}
          </button>

          {/* Liquidity Pill */}
          <button
            type="button"
            onClick={() => toggleIndicatorQuick('liquiditySweeps')}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              indicatorSettings.liquiditySweeps.enabled
                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 font-bold'
                : 'bg-gray-50 dark:bg-neutral-800/80 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Liquidity: {indicatorSettings.liquiditySweeps.enabled ? 'ON' : 'OFF'}
          </button>

          {/* EMA Pill */}
          <button
            type="button"
            onClick={() => toggleIndicatorQuick('emaRibbon')}
            className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              indicatorSettings.emaRibbon.enabled
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-bold'
                : 'bg-gray-50 dark:bg-neutral-800/80 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            EMA: {indicatorSettings.emaRibbon.enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Far Right: Replay Live Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-800/80 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-amber-500' : 'bg-emerald-600'}`}></span>
            </span>
            <span className="text-gray-700 dark:text-neutral-200 font-bold">
              {isPlaying ? 'REPLAY PLAYING' : 'REPLAY PAUSED'}
            </span>
          </div>
        </div>

      </div>

      {/* 2. Main Grid: Chart Canvas (Left 75%) + Trade Execution Widget (Right 25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Chart Container (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          
          {/* Chart Canvas Card */}
          <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl overflow-hidden h-[540px] relative shadow-xs transition-colors">
            <ReplayChartCanvas
              candles={dataset.candles}
              visibleIndex={visibleIndex}
              isScissorsActive={isScissorsActive}
              onCutAt={handleCutAt}
              activePosition={activePosition}
              symbol={selectedSymbol}
              timeframe={selectedTimeframe}
              fvgs={fvgs}
              orderBlocks={orderBlocks}
              liquidityLevels={liquidityLevels}
              killzones={killzones}
              emas={emas}
              indicatorSettings={indicatorSettings}
            />

            {/* In-Chart Toast Notification Banner */}
            {toastMessage && (
              <div className={`absolute bottom-4 right-4 z-40 px-3.5 py-2 rounded-xl text-xs font-mono font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-500 text-slate-950'
                  : toastMessage.type === 'danger'
                  ? 'bg-rose-500 text-white'
                  : 'bg-blue-600 text-white'
              }`}>
                {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{toastMessage.text}</span>
              </div>
            )}
          </div>

          {/* Floating Dock Replay Controls */}
          <ReplayControls
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onStepForward={stepForward}
            speed={speed}
            onChangeSpeed={setSpeed}
            isScissorsActive={isScissorsActive}
            onToggleScissors={() => setIsScissorsActive(!isScissorsActive)}
            onReset={handleReset}
            visibleIndex={visibleIndex}
            totalCandles={dataset.candles.length}
            onScrub={setVisibleIndex}
            jumpPoints={dataset.jumpPoints}
            onJumpToSession={handleJumpToSession}
          />

        </div>

        {/* Trade Execution & Position Sidebar (1 Col) */}
        <div className="lg:col-span-1">
          <ReplayTradeWidget
            currentPrice={currentBar.close}
            symbol={selectedSymbol}
            activePosition={activePosition}
            onOpenPosition={handleOpenPosition}
            onClosePosition={handleClosePosition}
            stats={stats}
            tradeHistory={tradeHistory}
          />
        </div>

      </div>

      {/* 3. Indicator Manager Drawer Modal */}
      <IndicatorManagerModal
        isOpen={isIndicatorModalOpen}
        onClose={() => setIsIndicatorModalOpen(false)}
        settings={indicatorSettings}
        onSave={saveIndicatorSettings}
        onReset={resetIndicatorDefaults}
      />

    </div>
  );
}
