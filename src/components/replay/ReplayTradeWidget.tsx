'use client';

import React, { useState } from 'react';
import { 
  OrderDirection, 
  ReplayPosition, 
  ReplayAccountStats,
  CandleData
} from '../../types/replay';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ReplayTradeWidgetProps {
  currentPrice: number;
  currentBar: CandleData;
  symbol: string;
  activePosition: ReplayPosition | null;
  onOpenPosition: (direction: OrderDirection, lots: number, sl?: number, tp?: number) => void;
  onClosePosition: () => void;
  stats: ReplayAccountStats;
  tradeHistory?: ReplayPosition[];
}

export default function ReplayTradeWidget({
  currentPrice,
  currentBar,
  symbol,
  activePosition,
  onOpenPosition,
  onClosePosition,
  stats,
}: ReplayTradeWidgetProps) {
  const [direction, setDirection] = useState<OrderDirection>('BUY');
  const [lots, setLots] = useState(1.0);
  const [useSlTp, setUseSlTp] = useState(true);
  const [slPips, setSlPips] = useState(20);
  const [tpPips, setTpPips] = useState(40);

  const decimals = symbol === 'EURUSD' ? 5 : 2;
  const pipMultiplier = symbol === 'EURUSD' ? 0.0001 : symbol === 'XAUUSD' ? 0.1 : 1.0;
  const pipValuePerLot = symbol === 'EURUSD' ? 10 : symbol === 'XAUUSD' ? 100 : 20;

  // Spread calculation for Bid/Ask display
  const spread = symbol === 'EURUSD' ? 0.00012 : symbol === 'XAUUSD' ? 0.25 : 1.5;
  const bidPrice = +(currentPrice - spread / 2).toFixed(decimals);
  const askPrice = +(currentPrice + spread / 2).toFixed(decimals);

  // Calculated SL & TP prices for current selected direction
  const isBuy = direction === 'BUY';
  const targetSlPrice = isBuy
    ? +(currentPrice - slPips * pipMultiplier).toFixed(decimals)
    : +(currentPrice + slPips * pipMultiplier).toFixed(decimals);

  const targetTpPrice = isBuy
    ? +(currentPrice + tpPips * pipMultiplier).toFixed(decimals)
    : +(currentPrice - tpPips * pipMultiplier).toFixed(decimals);

  const riskAmount = (slPips * pipValuePerLot * lots).toFixed(2);
  const rewardAmount = (tpPips * pipValuePerLot * lots).toFixed(2);
  const rrRatio = slPips > 0 ? (tpPips / slPips).toFixed(1) : '0';

  const handleSimulateTrade = () => {
    onOpenPosition(
      direction, 
      lots, 
      useSlTp ? targetSlPrice : undefined, 
      useSlTp ? targetTpPrice : undefined
    );
  };

  return (
    <div className="w-full h-full bg-white dark:bg-[#131722] border-l border-gray-200 dark:border-slate-800 flex flex-col justify-between text-gray-900 dark:text-slate-100 font-mono select-none overflow-y-auto custom-scrollbar transition-colors duration-200">
      
      {/* SECTION 1: ACCOUNT STATUS (TOP) */}
      <div className="p-3.5 border-b border-gray-200 dark:border-slate-800/80 bg-gray-50/70 dark:bg-[#0f1117]/60">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] capitalize text-cyan-600 dark:text-cyan-400 font-bold font-sans flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            Account Status
          </span>
          <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold bg-gray-200/60 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700/60">
            Apex Sim
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white dark:bg-[#131722] p-2 rounded-lg border border-gray-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] text-gray-500 dark:text-slate-400 font-sans block">Equity</span>
            <span className={`font-bold text-sm ${stats.equity >= stats.startingBalance ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              ${stats.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-white dark:bg-[#131722] p-2 rounded-lg border border-gray-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] text-gray-500 dark:text-slate-400 font-sans block">Realized P&L</span>
            <span className={`font-bold text-sm ${stats.realizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {stats.realizedPnl >= 0 ? '+' : ''}${stats.realizedPnl.toFixed(2)}
            </span>
          </div>

          <div className="bg-white dark:bg-[#131722] p-2 rounded-lg border border-gray-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] text-gray-500 dark:text-slate-400 font-sans block">Win Rate</span>
            <span className="font-bold text-sm text-cyan-600 dark:text-cyan-400">
              {stats.winRate}% <span className="text-[10px] text-gray-400 dark:text-slate-500 font-normal">({stats.winTrades}W/{stats.lossTrades}L)</span>
            </span>
          </div>

          <div className="bg-white dark:bg-[#131722] p-2 rounded-lg border border-gray-200 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] text-gray-500 dark:text-slate-400 font-sans block">Closed Trades</span>
            <span className="font-bold text-sm text-gray-800 dark:text-slate-200">
              {stats.totalTrades}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: MARKET DATA (MIDDLE) */}
      <div className="p-3.5 border-b border-gray-200 dark:border-slate-800/80 bg-white dark:bg-[#131722] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] capitalize text-gray-500 dark:text-slate-400 font-bold font-sans">
            Market Data
          </span>
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{symbol}</span>
        </div>

        {/* Current Price Big Display */}
        <div className="bg-gray-50 dark:bg-[#0f1117] p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 block capitalize">Last Price</span>
            <div className={`text-xl font-extrabold ${currentBar && currentBar.close >= currentBar.open ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {currentPrice.toFixed(decimals)}
            </div>
          </div>
          <div className="text-right text-[11px]">
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Bid: {bidPrice}</div>
            <div className="text-rose-600 dark:text-rose-400 font-semibold">Ask: {askPrice}</div>
          </div>
        </div>

        {/* OHLC & Session Info */}
        <div className="bg-gray-50 dark:bg-[#0f1117] p-2 rounded-lg border border-gray-200 dark:border-slate-800 text-[11px] space-y-1">
          <div className="flex justify-between text-gray-600 dark:text-slate-400">
            <span>Open: <strong className="text-gray-900 dark:text-slate-200 font-normal">{currentBar?.open?.toFixed(decimals) || '—'}</strong></span>
            <span>High: <strong className="text-emerald-600 dark:text-emerald-400 font-normal">{currentBar?.high?.toFixed(decimals) || '—'}</strong></span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-slate-400">
            <span>Low: <strong className="text-rose-600 dark:text-rose-400 font-normal">{currentBar?.low?.toFixed(decimals) || '—'}</strong></span>
            <span>Close: <strong className="text-gray-900 dark:text-slate-200 font-normal">{currentBar?.close?.toFixed(decimals) || '—'}</strong></span>
          </div>
          <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-slate-800/60 text-gray-600 dark:text-slate-400">
            <span>Session:</span>
            <span className="capitalize text-amber-600 dark:text-amber-400 font-bold text-[10px]">
              {currentBar?.session ? `${currentBar.session} session` : 'Active Session'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: TRADE SETUP & EXECUTION (BOTTOM) */}
      <div className="p-3.5 space-y-3 bg-gray-50/70 dark:bg-[#0f1117]/50 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] capitalize text-cyan-600 dark:text-cyan-400 font-bold font-sans">
              Trade Setup
            </span>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-sans">Instant Execution</span>
          </div>

          {/* Active Open Position Banner */}
          {activePosition && activePosition.status === 'OPEN' ? (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                  activePosition.type === 'BUY' ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40' : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40'
                }`}>
                  {activePosition.type} {activePosition.lots}L
                </span>
                <button
                  type="button"
                  onClick={onClosePosition}
                  className="px-2.5 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                >
                  Close Position
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                <div>
                  <span className="text-gray-400 dark:text-slate-500 block text-[10px]">Entry:</span>
                  <span className="text-gray-800 dark:text-slate-200 font-bold">{activePosition.entryPrice.toFixed(decimals)}</span>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-slate-500 block text-[10px]">Current:</span>
                  <span className="text-gray-800 dark:text-slate-200 font-bold">{currentPrice.toFixed(decimals)}</span>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-slate-500 block text-[10px]">SL:</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold">{activePosition.sl ? activePosition.sl.toFixed(decimals) : 'None'}</span>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-slate-500 block text-[10px]">TP:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activePosition.tp ? activePosition.tp.toFixed(decimals) : 'None'}</span>
                </div>
              </div>

              {/* Floating Net PnL */}
              <div className={`mt-2.5 p-2 rounded border flex items-center justify-between font-bold ${
                activePosition.pnl >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300'
              }`}>
                <span className="text-[11px] font-sans">Unrealized P&L:</span>
                <span className="text-sm">
                  {activePosition.pnl >= 0 ? '+' : ''}${activePosition.pnl.toFixed(2)} ({activePosition.pnlPips >= 0 ? '+' : ''}{activePosition.pnlPips.toFixed(1)} p)
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Direction Tabs (BUY vs SELL) */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 dark:bg-[#0f1117] rounded-lg border border-gray-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDirection('BUY')}
                  className={`py-1.5 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    direction === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Buy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('SELL')}
                  className={`py-1.5 rounded-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    direction === 'SELL'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Sell</span>
                </button>
              </div>

              {/* Lot Size Selection */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
                  <span>Volume (Lots)</span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400">1.00 Lot = 100k</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0.1, 0.5, 1.0, 5.0].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLots(preset)}
                      className={`flex-1 py-1 rounded text-xs border transition-all cursor-pointer ${
                        lots === preset
                          ? 'bg-cyan-600 dark:bg-cyan-500 border-cyan-600 dark:border-cyan-400 text-white dark:text-slate-950 font-bold shadow-xs'
                          : 'bg-white dark:bg-[#0f1117] border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="50"
                    value={lots}
                    onChange={(e) => setLots(parseFloat(e.target.value) || 0.1)}
                    className="w-16 bg-white dark:bg-[#0f1117] border border-gray-200 dark:border-slate-800 rounded px-2 py-1 text-xs text-center text-gray-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
              </div>

              {/* Bracket SL / TP */}
              <div className="bg-white dark:bg-[#0f1117] p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={useSlTp}
                      onChange={(e) => setUseSlTp(e.target.checked)}
                      className="rounded bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="font-semibold text-[11px]">Bracket SL / TP</span>
                  </label>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">1 : {rrRatio} R:R</span>
                </div>

                {useSlTp && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block mb-0.5">SL (Pips)</span>
                      <input
                        type="number"
                        value={slPips}
                        onChange={(e) => setSlPips(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-rose-50/50 dark:bg-[#131722] border border-rose-200 dark:border-rose-500/40 rounded px-2 py-1 text-xs text-rose-700 dark:text-rose-300 focus:outline-none focus:border-rose-500 font-bold"
                      />
                      <span className="text-[9px] text-gray-400 dark:text-slate-500 mt-0.5 block">Risk: -${riskAmount}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mb-0.5">TP (Pips)</span>
                      <input
                        type="number"
                        value={tpPips}
                        onChange={(e) => setTpPips(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full bg-emerald-50/50 dark:bg-[#131722] border border-emerald-200 dark:border-emerald-500/40 rounded px-2 py-1 text-xs text-emerald-700 dark:text-emerald-300 focus:outline-none focus:border-emerald-500 font-bold"
                      />
                      <span className="text-[9px] text-gray-400 dark:text-slate-500 mt-0.5 block">Reward: +${rewardAmount}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* APEX STYLE "SIMULATE TRADE" EXECUTION BUTTON */}
        {!activePosition || activePosition.status !== 'OPEN' ? (
          <button
            type="button"
            onClick={handleSimulateTrade}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 mt-2 ${
              direction === 'BUY'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-rose-500/20'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>SIMULATE {direction} TRADE</span>
          </button>
        ) : null}
      </div>

    </div>
  );
}


