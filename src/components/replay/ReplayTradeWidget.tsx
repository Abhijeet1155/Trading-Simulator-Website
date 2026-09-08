'use client';

import React, { useState } from 'react';
import { 
  OrderDirection, 
  ReplayPosition, 
  ReplayAccountStats 
} from '../../types/replay';
import { 
  TrendingUp, 
  TrendingDown, 
  X, 
  ShieldAlert, 
  Target, 
  DollarSign, 
  History, 
  Percent, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Calculator
} from 'lucide-react';

interface ReplayTradeWidgetProps {
  currentPrice: number;
  symbol: string;
  activePosition: ReplayPosition | null;
  onOpenPosition: (direction: OrderDirection, lots: number, sl?: number, tp?: number) => void;
  onClosePosition: () => void;
  stats: ReplayAccountStats;
  tradeHistory: ReplayPosition[];
}

export default function ReplayTradeWidget({
  currentPrice,
  symbol,
  activePosition,
  onOpenPosition,
  onClosePosition,
  stats,
  tradeHistory
}: ReplayTradeWidgetProps) {
  const [lots, setLots] = useState(1.0);
  const [useSlTp, setUseSlTp] = useState(true);
  const [slPips, setSlPips] = useState(20);
  const [tpPips, setTpPips] = useState(40);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const decimals = symbol === 'EURUSD' ? 5 : 2;
  const pipMultiplier = symbol === 'EURUSD' ? 0.0001 : symbol === 'XAUUSD' ? 0.1 : 1.0;
  const pipValuePerLot = symbol === 'EURUSD' ? 10 : symbol === 'XAUUSD' ? 100 : 20;

  // Calculated SL & TP prices for BUY
  const buySlPrice = +(currentPrice - slPips * pipMultiplier).toFixed(decimals);
  const buyTpPrice = +(currentPrice + tpPips * pipMultiplier).toFixed(decimals);

  // Calculated SL & TP prices for SELL
  const sellSlPrice = +(currentPrice + slPips * pipMultiplier).toFixed(decimals);
  const sellTpPrice = +(currentPrice - tpPips * pipMultiplier).toFixed(decimals);

  const riskAmount = (slPips * pipValuePerLot * lots).toFixed(2);
  const rewardAmount = (tpPips * pipValuePerLot * lots).toFixed(2);
  const rrRatio = slPips > 0 ? (tpPips / slPips).toFixed(1) : '0';

  const handleBuy = () => {
    onOpenPosition('BUY', lots, useSlTp ? buySlPrice : undefined, useSlTp ? buyTpPrice : undefined);
  };

  const handleSell = () => {
    onOpenPosition('SELL', lots, useSlTp ? sellSlPrice : undefined, useSlTp ? sellTpPrice : undefined);
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-4 shadow-xs flex flex-col gap-4 text-gray-900 dark:text-neutral-100 font-mono transition-colors">
      
      {/* Account Performance Micro-Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-3 border-b border-gray-100 dark:border-neutral-800 text-xs">
        <div className="bg-gray-50 dark:bg-neutral-800/80 p-2 rounded-xl border border-gray-100 dark:border-neutral-700">
          <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-sans block uppercase">Equity</span>
          <span className={`font-bold text-sm ${stats.equity >= stats.startingBalance ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            ${stats.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-neutral-800/80 p-2 rounded-xl border border-gray-100 dark:border-neutral-700">
          <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-sans block uppercase">Realized PnL</span>
          <span className={`font-bold text-sm ${stats.realizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {stats.realizedPnl >= 0 ? '+' : ''}${stats.realizedPnl.toFixed(2)}
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-neutral-800/80 p-2 rounded-xl border border-gray-100 dark:border-neutral-700">
          <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-sans block uppercase">Win Rate</span>
          <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
            {stats.winRate}% ({stats.winTrades}W / {stats.lossTrades}L)
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-neutral-800/80 p-2 rounded-xl border border-gray-100 dark:border-neutral-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-sans block uppercase">Replay Trades</span>
            <span className="font-bold text-sm text-gray-900 dark:text-white">{stats.totalTrades}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="p-1.5 rounded-lg bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-600 text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
            title="Inspect Replay Trade History"
          >
            <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </button>
        </div>
      </div>

      {/* ACTIVE POSITION PANEL (If Open) */}
      {activePosition && activePosition.status === 'OPEN' ? (
        <div className="bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                activePosition.type === 'BUY' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {activePosition.type} {activePosition.lots}L
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{activePosition.symbol}</span>
            </div>

            <button
              type="button"
              onClick={onClosePosition}
              className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-bold transition-all cursor-pointer"
            >
              Close Position
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 dark:text-neutral-400 block">Entry Price:</span>
              <span className="text-gray-900 dark:text-white font-bold">{activePosition.entryPrice.toFixed(decimals)}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-neutral-400 block">Current Price:</span>
              <span className="text-gray-900 dark:text-white font-bold">{currentPrice.toFixed(decimals)}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-neutral-400 block">Stop Loss:</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">{activePosition.sl ? activePosition.sl.toFixed(decimals) : 'None'}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-neutral-400 block">Take Profit:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activePosition.tp ? activePosition.tp.toFixed(decimals) : 'None'}</span>
            </div>
          </div>

          {/* Floating PnL Live Banner */}
          <div className={`mt-3 p-2.5 rounded-lg border flex items-center justify-between font-bold ${
            activePosition.pnl >= 0 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' 
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}>
            <span className="text-xs font-sans">Floating Net P&L:</span>
            <div className="text-right">
              <div className="text-sm">
                {activePosition.pnl >= 0 ? '+' : ''}${activePosition.pnl.toFixed(2)}
              </div>
              <div className="text-[10px] opacity-80">
                {activePosition.pnlPips >= 0 ? '+' : ''}{activePosition.pnlPips.toFixed(1)} pips
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ORDER ENTRY FORM (When No Active Position) */
        <div className="space-y-3">
          {/* Lot Size Selector */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-neutral-400 mb-1">
              <span>Lot Size</span>
              <span className="text-[10px] text-gray-400 dark:text-neutral-500">1.00 Lot = 100k units</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0.1, 0.5, 1.0, 2.0, 5.0].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLots(preset)}
                  className={`flex-1 py-1 rounded-lg text-xs border transition-colors cursor-pointer ${
                    lots === preset 
                      ? 'bg-[#2563EB] border-[#2563EB] text-white font-bold shadow-2xs' 
                      : 'bg-gray-50 dark:bg-neutral-800/80 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
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
                className="w-16 bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-xs text-center text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* SL / TP Controls */}
          <div className="bg-gray-50 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={useSlTp}
                  onChange={(e) => setUseSlTp(e.target.checked)}
                  className="rounded bg-white dark:bg-neutral-700 border-gray-300 dark:border-neutral-600 text-blue-600 focus:ring-0"
                />
                <span className="font-semibold">Bracket SL / TP</span>
              </label>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">1 : {rrRatio} R:R</span>
            </div>

            {useSlTp && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block mb-0.5">Stop Loss (Pips)</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={slPips}
                      onChange={(e) => setSlPips(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-white dark:bg-neutral-800 border border-rose-200 dark:border-rose-900/50 rounded-lg px-2 py-1 text-xs text-rose-700 dark:text-rose-300 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <span className="text-[9.5px] text-gray-500 dark:text-neutral-400 mt-0.5 block">Risk: -${riskAmount}</span>
                </div>

                <div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mb-0.5">Take Profit (Pips)</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={tpPips}
                      onChange={(e) => setTpPips(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-white dark:bg-neutral-800 border border-emerald-200 dark:border-emerald-900/50 rounded-lg px-2 py-1 text-xs text-emerald-700 dark:text-emerald-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <span className="text-[9.5px] text-gray-500 dark:text-neutral-400 mt-0.5 block">Reward: +${rewardAmount}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Execution Buy / Sell Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleSell}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <TrendingDown className="w-4 h-4" />
              <span>SELL {lots}L</span>
            </button>

            <button
              type="button"
              onClick={handleBuy}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <TrendingUp className="w-4 h-4" />
              <span>BUY {lots}L</span>
            </button>
          </div>
        </div>
      )}

      {/* CLOSED TRADE HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-700 rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in scale-95 text-gray-900 dark:text-neutral-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Replay Session Trade Log</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Trades List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {tradeHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-neutral-500 text-xs">
                  No trades executed in this replay session yet.
                </div>
              ) : (
                tradeHistory.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className="bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 p-3 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.type === 'BUY' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {t.type} {t.lots}L
                      </span>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {t.symbol} @ {t.entryPrice.toFixed(decimals)} → {t.closePrice?.toFixed(decimals)}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-neutral-400">
                          Exit: {t.closeReason || 'MANUAL'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-bold">
                      <div className={`text-sm ${(t.realizedPnl ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {(t.realizedPnl ?? 0) >= 0 ? '+' : ''}${(t.realizedPnl ?? 0).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-neutral-400">
                        {t.pnlPips >= 0 ? '+' : ''}{t.pnlPips.toFixed(1)} pips
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-100 dark:border-neutral-800 flex justify-between items-center text-xs text-gray-500 dark:text-neutral-400">
              <span>Total Session Net: <strong className={stats.realizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>${stats.realizedPnl.toFixed(2)}</strong></span>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-200 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
