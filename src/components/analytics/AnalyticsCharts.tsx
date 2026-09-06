'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  Line,
  ComposedChart
} from 'recharts';
import { 
  BarChart3, 
  Clock, 
  ScatterChart as ScatterIcon, 
  CalendarDays, 
  TrendingUp, 
  TrendingDown,
  Info
} from 'lucide-react';
import { 
  MOCK_DAILY_PNL, 
  MOCK_HOURLY_DATA, 
  MOCK_SCATTER_POINTS, 
  MOCK_DAY_OF_WEEK 
} from '../../data/mockAnalyticsData';

export default function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      
      {/* CHART 1: Daily Net PnL & Cumulative Growth (Composed Bar + Line) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                Daily Net P&L & Cumulative Curve
              </h3>
              <p className="text-[10.5px] text-gray-500">Green / Red daily distribution with cumulative equity progression</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            +$62.1K / 30d
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={MOCK_DAILY_PNL} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                stroke="#94a3b8" 
                fontSize={10} 
                fontFamily="monospace"
                tickLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                fontFamily="monospace"
                tickLine={false}
                tickFormatter={(val) => `$${val >= 1000 || val <= -1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-xl font-mono text-xs">
                        <div className="text-gray-500 font-bold mb-1">{data.date}</div>
                        <div className={`text-sm font-extrabold ${data.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          Daily: {data.pnl >= 0 ? '+' : ''}${data.pnl.toLocaleString()}
                        </div>
                        <div className="text-blue-600 text-[11px] mt-0.5">
                          Cumulative: +${data.cumulativePnl.toLocaleString()}
                        </div>
                        <div className="text-gray-500 text-[10px] mt-1 border-t border-gray-100 pt-1">
                          Trades: {data.tradesCount} | Win Rate: {data.winRate}% | Vol: {data.volumeLots} lots
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {MOCK_DAILY_PNL.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} 
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Hourly Performance (00:00 - 23:00 UTC) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                Hourly Performance (00:00 - 23:00 UTC)
              </h3>
              <p className="text-[10.5px] text-gray-500">Volume and edge cluster analysis across market sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-blue-500" /> London
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-500" /> NY
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-amber-500" /> Asia
            </span>
          </div>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_HOURLY_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="hour" 
                stroke="#94a3b8" 
                fontSize={9} 
                fontFamily="monospace"
                tickLine={false}
                interval={2}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                fontFamily="monospace"
                tickLine={false}
                tickFormatter={(val) => `$${val >= 1000 || val <= -1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-xl font-mono text-xs">
                        <div className="flex items-center justify-between gap-3 text-gray-600 font-bold mb-1">
                          <span>{data.hour} UTC</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-700">{data.session}</span>
                        </div>
                        <div className={`text-sm font-extrabold ${data.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          P&L: {data.pnl >= 0 ? '+' : ''}${data.pnl.toLocaleString()}
                        </div>
                        <div className="text-gray-500 text-[10px] mt-1 border-t border-gray-100 pt-1">
                          Trades: {data.tradesCount} | Win Rate: {data.winRate}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {MOCK_HOURLY_DATA.map((entry, index) => {
                  let barColor = '#94a3b8';
                  if (entry.session === 'LONDON') barColor = '#2563eb';
                  else if (entry.session === 'NEW_YORK') barColor = '#10b981';
                  else if (entry.session === 'ASIA') barColor = '#f59e0b';
                  if (entry.pnl < 0) barColor = '#f43f5e';

                  return (
                    <Cell 
                      key={`hour-${index}`} 
                      fill={barColor}
                      fillOpacity={0.85}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 3: R:R Scatter Plot (Planned vs Realized) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ScatterIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                R:R Scatter Plot (Planned vs Realized)
              </h3>
              <p className="text-[10.5px] text-gray-500">Institutional threshold: 1:2+ target capture validation</p>
            </div>
          </div>
          <span className="text-[10.5px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
            Avg Realized: 2.15R
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                type="number" 
                dataKey="plannedRR" 
                name="Planned R:R" 
                domain={[0, 5]}
                stroke="#94a3b8" 
                fontSize={10} 
                fontFamily="monospace"
                tickFormatter={(v) => `${v}R`}
              />
              <YAxis 
                type="number" 
                dataKey="realizedRR" 
                name="Realized R:R" 
                domain={[-1.5, 5]}
                stroke="#94a3b8" 
                fontSize={10} 
                fontFamily="monospace"
                tickFormatter={(v) => `${v}R`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-xl font-mono text-xs">
                        <div className="flex items-center justify-between text-gray-900 font-bold mb-1">
                          <span>{data.symbol}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            data.status === 'WIN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {data.status}
                          </span>
                        </div>
                        <div className="text-gray-700">
                          Realized R:R: <strong className={data.realizedRR > 0 ? 'text-emerald-600' : 'text-rose-600'}>{data.realizedRR}R</strong>
                        </div>
                        <div className="text-gray-500 text-[10.5px]">
                          Planned R:R: {data.plannedRR}R | PnL: ${data.pnl}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          Risk: ${data.riskAmount} | Reward: ${data.rewardAmount}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={2.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: '2.0R Target', fill: '#10b981', fontSize: 10, fontFamily: 'monospace' }} />
              <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={1} />
              <ReferenceLine y={-1.0} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: '-1.0R Stop', fill: '#f43f5e', fontSize: 10, fontFamily: 'monospace' }} />
              <Scatter name="Trades" data={MOCK_SCATTER_POINTS}>
                {MOCK_SCATTER_POINTS.map((entry, index) => {
                  const isWinAbove2R = entry.realizedRR >= 2.0;
                  const isLoss = entry.realizedRR < 0;
                  return (
                    <Cell 
                      key={`scatter-${index}`} 
                      fill={isWinAbove2R ? '#10b981' : isLoss ? '#f43f5e' : '#0284c7'} 
                      stroke="#ffffff"
                      strokeWidth={1}
                      fillOpacity={0.85}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 4: Day of Week Distribution (Mon - Fri) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
                Day of Week Performance
              </h3>
              <p className="text-[10.5px] text-gray-500">Profitability & Win-rate matrix from Monday to Friday</p>
            </div>
          </div>
          <span className="text-[10.5px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
            Best Day: Wednesday
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_DAY_OF_WEEK} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#94a3b8" 
                fontSize={11} 
                fontFamily="monospace"
                tickLine={false}
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
                      <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-xl font-mono text-xs">
                        <div className="text-gray-900 font-bold mb-1">{data.day}day Performance</div>
                        <div className="text-emerald-600 text-sm font-extrabold">
                          Total P&L: +${data.pnl.toLocaleString()}
                        </div>
                        <div className="text-gray-700 text-[11px] mt-0.5">
                          Win Rate: <strong>{data.winRate}%</strong> ({data.tradesCount} trades)
                        </div>
                        <div className="text-gray-500 text-[10px] mt-1 border-t border-gray-100 pt-1">
                          Avg Trade: +${data.avgPnl.toFixed(2)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                {MOCK_DAY_OF_WEEK.map((entry, index) => (
                  <Cell 
                    key={`day-${index}`} 
                    fill={entry.day === 'Wed' ? '#10b981' : '#2563eb'} 
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
