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
  Legend,
  AreaChart,
  Area,
  ReferenceLine
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
  MOCK_EQUITY_CURVE, 
  MOCK_MONTE_CARLO 
} from '../../data/mockAnalyticsData';

export default function EquityCurveMonteCarlo() {
  const [activeTab, setActiveTab] = useState<'equity' | 'montecarlo'>('equity');
  const [showBenchmark, setShowBenchmark] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs mb-6">
      
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-mono uppercase tracking-wider">
              {activeTab === 'equity' ? 'Cumulative Equity Curve vs Benchmark' : 'Monte Carlo Predictive Simulation (1,000 Runs)'}
            </h3>
            <p className="text-[11px] text-gray-500">
              {activeTab === 'equity' 
                ? 'High water mark trajectory, drawdown containment & S&P 500 alpha' 
                : 'Quantitative probabilistic distribution across 25th, 50th, 75th, 95th percentiles'}
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
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' 
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {showBenchmark ? '✓ S&P 500 Benchmark' : '+ S&P 500 Benchmark'}
            </button>
          )}

          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('equity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                activeTab === 'equity'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Historical Equity
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('montecarlo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                activeTab === 'montecarlo'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_EQUITY_CURVE} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="tradeNumber" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false}
                  tickFormatter={(v) => `T#${v}`}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false}
                  domain={['dataMin - 5000', 'dataMax + 5000']}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg font-mono text-xs">
                          <div className="text-gray-500 font-bold mb-1">Trade #{data.tradeNumber}</div>
                          <div className="text-emerald-600 text-sm font-extrabold">
                            Account Equity: ${data.equity.toLocaleString()}
                          </div>
                          {showBenchmark && (
                            <div className="text-gray-600 text-[11px] mt-0.5">
                              S&P 500: ${data.benchmarkEquity.toLocaleString()}
                            </div>
                          )}
                          <div className="text-rose-600 text-[10.5px] mt-1 border-t border-gray-100 pt-1">
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
          </div>

          {/* Quick Metrics Bar below chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-100 font-mono text-xs">
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-sans">Starting Balance</span>
              <span className="text-gray-900 font-bold">$100,000.00</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-sans">Current Equity</span>
              <span className="text-emerald-600 font-bold">$197,680.00 (+97.7%)</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-sans">Alpha vs S&P 500</span>
              <span className="text-blue-600 font-bold">+81.2% Excess</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-sans">Max Historical DD</span>
              <span className="text-rose-600 font-bold">-4.82% ($5,120)</span>
            </div>
          </div>
        </div>
      ) : (
        /* Monte Carlo View */
        <div className="mt-4">
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_MONTE_CARLO} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="tradeIndex" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false}
                  tickFormatter={(v) => `+${v}t`}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg font-mono text-xs space-y-1">
                          <div className="text-gray-600 font-bold border-b border-gray-100 pb-1">
                            +{data.tradeIndex} Future Trades Projection
                          </div>
                          <div className="text-emerald-600">95th Percentile: ${data.p95.toLocaleString()}</div>
                          <div className="text-blue-600">75th Percentile: ${data.p75.toLocaleString()}</div>
                          <div className="text-gray-900 font-bold">50th Median: ${data.p50.toLocaleString()}</div>
                          <div className="text-amber-600">25th Percentile: ${data.p25.toLocaleString()}</div>
                          <div className="text-rose-600">5th Percentile: ${data.p05.toLocaleString()}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="p95" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="95th Percentile" />
                <Line type="monotone" dataKey="p75" stroke="#2563eb" strokeWidth={1.5} dot={false} name="75th Percentile" />
                <Line type="monotone" dataKey="p50" stroke="#0f172a" strokeWidth={2.5} dot={false} name="Median (50th)" />
                <Line type="monotone" dataKey="p25" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="25th Percentile" />
                <Line type="monotone" dataKey="p05" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="5th Percentile" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monte Carlo Statistical Confidence Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-100 font-mono text-xs">
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-sans">Probability of Ruin</span>
              <span className="text-emerald-600 font-bold">&lt; 0.01% (Safe)</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-sans">Prob. of 2x Account</span>
              <span className="text-blue-600 font-bold">84.6%</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-sans">Median 30-Trade Target</span>
              <span className="text-gray-900 font-bold">$119,500 (+19.5%)</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="text-gray-500 block text-[10px] uppercase font-sans">Simulated Iterations</span>
              <span className="text-indigo-600 font-bold">1,000 Runs</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
