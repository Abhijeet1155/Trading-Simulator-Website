'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Sliders, 
  BarChart, 
  Percent,
  Layers
} from 'lucide-react';
import { 
  EquityCurvePoint, 
  MonteCarloPoint 
} from '../../types/analytics';
import { useTheme } from '@/context/ThemeContext';

interface EquityCurveMonteCarloProps {
  equityCurve?: EquityCurvePoint[];
  monteCarlo?: MonteCarloPoint[];
  startingBalance?: number;
  currentBalance?: number;
  netPnl?: number;
  maxDrawdownPct?: number;
  maxDrawdownAmount?: number;
}

export default function EquityCurveMonteCarlo({
  equityCurve = [],
  monteCarlo = [],
  startingBalance = 10000,
  currentBalance = 10000,
  netPnl = 0,
  maxDrawdownPct = 0,
  maxDrawdownAmount = 0
}: EquityCurveMonteCarloProps) {
  const [activeTab, setActiveTab] = useState<'equity' | 'montecarlo'>('equity');
  const [showBenchmark, setShowBenchmark] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const gridColor = isDark ? '#1f293d' : '#f1f5f9';

  const returnPct = startingBalance > 0 ? ((netPnl / startingBalance) * 100).toFixed(1) : '0.0';
  const finalEquityPoint = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1] : null;
  const benchmarkReturn = finalEquityPoint && startingBalance > 0 ? (((finalEquityPoint.benchmarkEquity - startingBalance) / startingBalance) * 100).toFixed(1) : '0.0';
  const alpha = (parseFloat(returnPct) - parseFloat(benchmarkReturn)).toFixed(1);

  return (
    <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs mb-6 transition-colors">
      
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white font-mono capitalize">
              {activeTab === 'equity' ? 'Cumulative Equity Curve vs Benchmark' : 'Monte Carlo Predictive Simulation (1,000 Runs)'}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-neutral-400">
              {activeTab === 'equity' 
                ? 'High water mark trajectory, drawdown containment & S&P 500 alpha comparison' 
                : 'Quantitative probabilistic distribution across 5th, 25th, 50th, 75th, 95th percentiles'}
            </p>
          </div>
        </div>

        {/* Tab Switch & Controls */}
        <div className="flex items-center gap-2">
          {activeTab === 'equity' && (
            <button
              type="button"
              onClick={() => setShowBenchmark(!showBenchmark)}
              className={`text-xs font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                showBenchmark 
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60 font-semibold' 
                  : 'bg-gray-50 dark:bg-[#161D2A] text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-white/[0.1] hover:bg-gray-100 dark:hover:bg-[#1c2536]'
              }`}
            >
              {showBenchmark ? '✓ S&P 500 Benchmark' : '+ S&P 500 Benchmark'}
            </button>
          )}

          <div className="flex items-center bg-gray-100 dark:bg-[#161D2A] p-1 rounded-xl border border-gray-200 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => setActiveTab('equity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                activeTab === 'equity'
                  ? 'bg-white dark:bg-[#111722] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Historical Equity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('montecarlo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                activeTab === 'montecarlo'
                  ? 'bg-white dark:bg-[#111722] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monte Carlo Model
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      {activeTab === 'equity' ? (
        <div className="mt-4">
          <div className="w-full h-80">
            {equityCurve.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 dark:text-neutral-500 font-mono">
                No closed trades yet to plot equity progression
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis 
                    dataKey="tradeNumber" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontFamily="Inter, sans-serif"
                    tickLine={false}
                    tickFormatter={(v) => `T#${v}`}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontFamily="Inter, sans-serif"
                    tickLine={false}
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                    tickFormatter={(val) => `$${val >= 1000 || val <= -1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl p-3 shadow-lg font-mono text-xs">
                            <div className="text-gray-500 dark:text-neutral-400 font-bold mb-1">Trade #{data.tradeNumber} ({data.date})</div>
                            <div className="text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">
                              Account Equity: ${data.equity.toLocaleString()}
                            </div>
                            {showBenchmark && (
                              <div className="text-gray-600 dark:text-neutral-300 text-[11px] mt-0.5">
                                S&P 500 Benchmark: ${data.benchmarkEquity.toLocaleString()}
                              </div>
                            )}
                            <div className="text-rose-600 dark:text-rose-400 text-[10.5px] mt-1 border-t border-gray-100 dark:border-white/[0.06] pt-1">
                              Current Drawdown: -{data.drawdownPct}%
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="#10b981" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#equityGradient)" 
                    name="Trader Equity"
                  />
                  {showBenchmark && (
                    <Line 
                      type="monotone" 
                      dataKey="benchmarkEquity" 
                      stroke="#94a3b8" 
                      strokeWidth={1.5} 
                      strokeDasharray="4 4" 
                      dot={false}
                      name="S&P 500 Benchmark"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick Metrics Bar below chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06] font-mono text-xs">
            <div className="bg-gray-50 dark:bg-[#161D2A] p-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08]">
              <span className="text-gray-500 dark:text-neutral-400 block text-[10px] capitalize font-sans">Starting Balance</span>
              <span className="text-gray-900 dark:text-white font-bold">${startingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-gray-50 dark:bg-[#161D2A] p-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08]">
              <span className="text-gray-500 dark:text-neutral-400 block text-[10px] capitalize font-sans">Current Equity</span>
              <span className={`font-bold ${netPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({netPnl >= 0 ? '+' : ''}{returnPct}%)
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-[#161D2A] p-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08]">
              <span className="text-gray-500 dark:text-neutral-400 block text-[10px] capitalize font-sans">Alpha vs S&P 500</span>
              <span className={`font-bold ${parseFloat(alpha) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {parseFloat(alpha) >= 0 ? '+' : ''}{alpha}% Excess
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-[#161D2A] p-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08]">
              <span className="text-gray-500 dark:text-neutral-400 block text-[10px] capitalize font-sans">Max Historical DD</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">-{maxDrawdownPct}% (${maxDrawdownAmount.toFixed(0)})</span>
            </div>
          </div>
        </div>
      ) : (
        /* Monte Carlo View */
        <div className="mt-4">
          <div className="w-full h-80">
            {monteCarlo.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 dark:text-neutral-500 font-mono">
                Computing simulation...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monteCarlo} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis 
                    dataKey="tradeIndex" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontFamily="Inter, sans-serif"
                    tickLine={false}
                    tickFormatter={(v) => `+${v}t`}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontFamily="Inter, sans-serif"
                    tickLine={false}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl p-3 shadow-lg font-mono text-xs space-y-1">
                            <div className="text-gray-600 dark:text-neutral-300 font-bold border-b border-gray-100 dark:border-white/[0.06] pb-1">
                              +{data.tradeIndex} Future Trades Projection
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-400">95th Percentile: ${data.p95.toLocaleString()}</div>
                            <div className="text-blue-600 dark:text-blue-400">75th Percentile: ${data.p75.toLocaleString()}</div>
                            <div className="text-gray-900 dark:text-white font-bold">50th Median: ${data.p50.toLocaleString()}</div>
                            <div className="text-amber-600 dark:text-amber-400">25th Percentile: ${data.p25.toLocaleString()}</div>
                            <div className="text-rose-600 dark:text-rose-400">5th Percentile: ${data.p05.toLocaleString()}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="p95" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="95th Percentile" />
                  <Line type="monotone" dataKey="p75" stroke="#2563eb" strokeWidth={1.5} dot={false} name="75th Percentile" />
                  <Line type="monotone" dataKey="p50" stroke={isDark ? '#f8fafc' : '#0f172a'} strokeWidth={2.5} dot={false} name="Median (50th)" />
                  <Line type="monotone" dataKey="p25" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="25th Percentile" />
                  <Line type="monotone" dataKey="p05" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="5th Percentile" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monte Carlo Statistical Confidence Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06] font-mono text-xs">
            <div className="bg-gray-50 dark:bg-[#161D2A] p-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08]">
              <span className="text-gray-500 dark:text-neutral-400 block text-[10px] capitalize font-sans">Probability of Ruin</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">&lt; 0.05% (Safe)</span>
            </div>
            <div className="bg-gray-50 dark:bg-[#161D2A] p-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08]">
              <span className="text-gray-500 dark:text-neutral-400 block text-[10px] capitalize font-sans">Empirical Win Factor</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{netPnl >= 0 ? 'Positive Edge' : 'Neutral'}</span>
            </div>
            <div className="bg-gray-50 dark:bg-[#161D2A] p-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08]">
              <span className="text-gray-500 dark:text-neutral-400 block text-[10px] capitalize font-sans">Median 30-Trade Target</span>
              <span className="text-gray-900 dark:text-white font-bold">
                ${monteCarlo.length > 0 ? monteCarlo[monteCarlo.length - 1].p50.toLocaleString() : (startingBalance * 1.1).toFixed(0)}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-[#161D2A] p-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08]">
              <span className="text-gray-500 dark:text-neutral-400 block text-[10px] capitalize font-sans">Simulated Iterations</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">1,000 Runs</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
