'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Percent, 
  BarChart3, 
  Award, 
  ShieldAlert,
  Zap
} from 'lucide-react';
import { JournalMetricsSummary } from '../../types/journal';

interface JournalMetricsProps {
  metrics: JournalMetricsSummary;
}

export default function JournalMetrics({ metrics }: JournalMetricsProps) {
  const isNetPositive = metrics.netPnl >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {/* 1. Net PnL Card */}
      <div className={`col-span-2 md:col-span-2 lg:col-span-2 rounded-2xl p-4 border transition-all shadow-xs ${
        isNetPositive 
          ? 'bg-gradient-to-br from-emerald-50/70 via-white to-white dark:from-emerald-950/40 dark:via-[#1E1E1E] dark:to-[#1E1E1E] border-emerald-200 dark:border-emerald-800/60' 
          : 'bg-gradient-to-br from-rose-50/70 via-white to-white dark:from-rose-950/40 dark:via-[#1E1E1E] dark:to-[#1E1E1E] border-rose-200 dark:border-rose-800/60'
      }`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-gray-500 dark:text-neutral-400 capitalize flex items-center gap-1.5">
            <Zap className={`w-3.5 h-3.5 ${isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
            Net Realized P&L
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            isNetPositive 
              ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' 
              : 'bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
          }`}>
            {metrics.winningTrades}W - {metrics.losingTrades}L
          </span>
        </div>
        
        <div className="flex items-baseline gap-2">
          <div className={`text-2xl lg:text-3xl font-mono font-extrabold  ${
            isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {isNetPositive ? '+' : ''}${metrics.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-gray-500 dark:text-neutral-400 font-mono">USD</span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-gray-600 dark:text-neutral-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Profit: <strong className="text-emerald-700 dark:text-emerald-400">+${metrics.grossProfit.toFixed(0)}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Loss: <strong className="text-rose-700 dark:text-rose-400">-${metrics.grossLoss.toFixed(0)}</strong>
          </span>
        </div>
      </div>

      {/* 2. Win Rate */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-gray-300 dark:hover:border-neutral-700 transition-colors shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-neutral-400 capitalize">
          <span>Win Rate</span>
          <Percent className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="my-1">
          <div className="text-2xl font-mono font-bold text-gray-900 dark:text-neutral-100">
            {metrics.winRate}%
          </div>
          <div className="w-full bg-gray-100 dark:bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, metrics.winRate)}%` }}
            />
          </div>
        </div>
        <div className="text-[10.5px] text-gray-500 dark:text-neutral-400 font-mono">
          Total: <span className="text-gray-900 dark:text-neutral-100 font-semibold">{metrics.totalTrades}</span> trades
        </div>
      </div>

      {/* 3. Profit Factor */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-gray-300 dark:hover:border-neutral-700 transition-colors shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-neutral-400 capitalize">
          <span>Profit Factor</span>
          <BarChart3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="my-1">
          <div className={`text-2xl font-mono font-bold ${
            metrics.profitFactor >= 2.0 ? 'text-emerald-600 dark:text-emerald-400' : metrics.profitFactor >= 1.0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {metrics.profitFactor > 50 ? '50.0+' : metrics.profitFactor.toFixed(2)}
          </div>
        </div>
        <div className="text-[10.5px] text-gray-500 dark:text-neutral-400 font-mono">
          Expectancy: <span className={`font-semibold ${metrics.expectancy >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
            ${metrics.expectancy > 0 ? '+' : ''}{metrics.expectancy.toFixed(1)}/t
          </span>
        </div>
      </div>

      {/* 4. Average R:R */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-gray-300 dark:hover:border-neutral-700 transition-colors shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-neutral-400 capitalize">
          <span>Avg Realized R:R</span>
          <Target className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="my-1">
          <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">
            1 : {metrics.avgRR > 0 ? metrics.avgRR.toFixed(2) : '0.00'}
          </div>
        </div>
        <div className="text-[10.5px] text-gray-500 dark:text-neutral-400 font-mono truncate">
          Avg Win: <span className="text-emerald-700 dark:text-emerald-400 font-semibold">+${metrics.avgWin.toFixed(0)}</span>
        </div>
      </div>

      {/* 5. Best Trade */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-gray-300 dark:hover:border-neutral-700 transition-colors shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-neutral-400 capitalize">
          <span>Best Trade</span>
          <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="my-1">
          <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate">
            +${metrics.bestTrade.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="text-[10.5px] text-gray-500 dark:text-neutral-400 font-mono truncate">
          Avg Loss: <span className="text-rose-700 dark:text-rose-400 font-semibold">-${metrics.avgLoss.toFixed(0)}</span>
        </div>
      </div>

      {/* 6. Worst Trade / Max Drawdown */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-3.5 flex flex-col justify-between hover:border-gray-300 dark:hover:border-neutral-700 transition-colors shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-neutral-400 capitalize">
          <span>Max Loss</span>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
        </div>
        <div className="my-1">
          <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 truncate">
            {metrics.worstTrade < 0 ? `-$${Math.abs(metrics.worstTrade).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '$0'}
          </div>
        </div>
        <div className="text-[10.5px] text-gray-500 dark:text-neutral-400 font-mono">
          BE Trades: <span className="text-gray-900 dark:text-neutral-100 font-semibold">{metrics.beTrades}</span>
        </div>
      </div>
    </div>
  );
}
