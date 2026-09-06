'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Percent, 
  Zap, 
  ShieldAlert, 
  Award, 
  Clock, 
  Activity, 
  DollarSign, 
  BarChart2, 
  Scale, 
  Flame,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { PerformanceMetrics } from '../../types/analytics';

interface MetricsOverviewProps {
  metrics: PerformanceMetrics;
}

export default function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const isNetPositive = metrics.netPnl >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* BOX 1: Win / Loss Statistics */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Percent className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono">
              Win / Loss Engine
            </span>
          </div>
          <span className="text-[10.5px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {metrics.winRate}% Win
          </span>
        </div>

        <div className="my-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-mono font-extrabold text-gray-900">
              {metrics.winningTrades}W <span className="text-gray-400 text-lg font-normal">/</span> {metrics.losingTrades}L
            </span>
            <span className="text-xs font-mono text-gray-500">
              {metrics.beTrades} BE
            </span>
          </div>

          {/* Win/Loss Dual Bar */}
          <div className="w-full bg-gray-100 h-2 rounded-full mt-2.5 overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${metrics.winRate}%` }} 
              title={`Win: ${metrics.winRate}%`}
            />
            <div 
              className="bg-rose-500 h-full transition-all duration-500" 
              style={{ width: `${metrics.lossRate}%` }} 
              title={`Loss: ${metrics.lossRate}%`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px] font-mono">
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Avg Win</span>
            <span className="text-emerald-600 font-bold">+${metrics.avgWin.toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Avg Loss</span>
            <span className="text-rose-600 font-bold">-${metrics.avgLoss.toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Win/Loss Ratio</span>
            <span className="text-blue-700 font-bold">{metrics.winLossRatio.toFixed(2)} : 1</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Current Streak</span>
            <span className="text-amber-700 font-bold">{metrics.currentStreak.count} {metrics.currentStreak.type}s</span>
          </div>
        </div>
      </div>

      {/* BOX 2: Risk & Quant Efficiency */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono">
              Risk & Efficiency
            </span>
          </div>
          <span className="text-[10.5px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Sharpe {metrics.sharpeRatio}
          </span>
        </div>

        <div className="my-3">
          <span className="text-[10px] text-gray-500 uppercase block font-mono font-semibold">Profit Factor</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl lg:text-3xl font-mono font-extrabold ${
              metrics.profitFactor >= 2.0 ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {metrics.profitFactor.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              (Sortino {metrics.sortinoRatio})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px] font-mono">
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Trade Expectancy</span>
            <span className="text-emerald-600 font-bold">+${metrics.expectancy.toFixed(2)} / t</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Max Drawdown</span>
            <span className="text-rose-600 font-bold">-{metrics.maxDrawdownPct}% (${metrics.maxDrawdownAmount})</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Recovery Factor</span>
            <span className="text-blue-700 font-bold">{metrics.recoveryFactor.toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Calmar Ratio</span>
            <span className="text-indigo-700 font-bold">{metrics.calmarRatio.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* BOX 3: Capital Growth & Streaks */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono">
              Net Net Capital
            </span>
          </div>
          <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
            isNetPositive ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'
          }`}>
            {isNetPositive ? '+97.7% YTD' : '-'}
          </span>
        </div>

        <div className="my-3">
          <span className="text-[10px] text-gray-500 uppercase block font-mono font-semibold">Total Realized P&L</span>
          <div className={`text-2xl lg:text-3xl font-mono font-extrabold tracking-tight ${
            isNetPositive ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {isNetPositive ? '+' : ''}${metrics.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px] font-mono">
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Gross Profit</span>
            <span className="text-emerald-600 font-bold">+${metrics.grossProfit.toFixed(0)}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Gross Loss</span>
            <span className="text-rose-600 font-bold">-${metrics.grossLoss.toFixed(0)}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Max Win Streak</span>
            <span className="text-emerald-700 font-bold">{metrics.maxWinStreak} Wins 🔥</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Max Loss Streak</span>
            <span className="text-rose-700 font-bold">{metrics.maxLossStreak} Losses</span>
          </div>
        </div>
      </div>

      {/* BOX 4: Trade Execution & Outliers */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono">
              Execution & Outliers
            </span>
          </div>
          <span className="text-[10.5px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
            {metrics.totalLots} Lots Traded
          </span>
        </div>

        <div className="my-3">
          <span className="text-[10px] text-gray-500 uppercase block font-mono font-semibold">Average Hold Time</span>
          <div className="text-2xl lg:text-3xl font-mono font-extrabold text-gray-900">
            {Math.floor(metrics.avgHoldTimeMinutes / 60)}h {metrics.avgHoldTimeMinutes % 60}m
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-[11px] font-mono">
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Largest Win</span>
            <span className="text-emerald-600 font-bold truncate block" title={`${metrics.largestWinTrade.symbol} +$${metrics.largestWinTrade.amount}`}>
              +${metrics.largestWinTrade.amount} ({metrics.largestWinTrade.symbol})
            </span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Largest Loss</span>
            <span className="text-rose-600 font-bold truncate block" title={`${metrics.largestLossTrade.symbol} $${metrics.largestLossTrade.amount}`}>
              ${metrics.largestLossTrade.amount} ({metrics.largestLossTrade.symbol})
            </span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Avg Win Hold</span>
            <span className="text-gray-800 font-bold">{Math.floor(metrics.avgHoldTimeWinMinutes / 60)}h {metrics.avgHoldTimeWinMinutes % 60}m</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-gray-500 block text-[9.5px] uppercase font-sans font-semibold">Commissions</span>
            <span className="text-amber-700 font-bold">${metrics.commissionsPaid}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
