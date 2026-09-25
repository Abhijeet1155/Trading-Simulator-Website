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
  DailyPnLPoint, 
  HourlyPnLPoint, 
  RRScatterPoint, 
  DayOfWeekPoint 
} from '../../types/analytics';
import { useTheme } from '@/context/ThemeContext';

interface AnalyticsChartsProps {
  dailyPnL?: DailyPnLPoint[];
  hourlyData?: HourlyPnLPoint[];
  scatterPoints?: RRScatterPoint[];
  dayOfWeek?: DayOfWeekPoint[];
}

export default function AnalyticsCharts({
  dailyPnL = [],
  hourlyData = [],
  scatterPoints = [],
  dayOfWeek = []
}: AnalyticsChartsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const gridColor = isDark ? '#1f293d' : '#f1f5f9';

  const totalDailyPnl = dailyPnL.reduce((acc, d) => acc + d.pnl, 0);
  const bestDay = dayOfWeek.length > 0 ? [...dayOfWeek].sort((a, b) => b.pnl - a.pnl)[0]?.day : 'Wednesday';

  // Calculate average realized RR
  const validRRs = scatterPoints.map(s => s.realizedRR).filter(r => typeof r === 'number' && !isNaN(r));
  const avgRealizedRR = validRRs.length > 0 ? (validRRs.reduce((a, b) => a + b, 0) / validRRs.length).toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      
      {/* CHART 1: Daily Net PnL & Cumulative Growth (Composed Bar + Line) */}
      <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-4.5 flex flex-col justify-between shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white capitalize font-mono">
                Daily Net P&L & Cumulative Curve
              </h3>
              <p className="text-[10.5px] text-gray-500 dark:text-neutral-400">Real trade daily distribution and cumulative growth</p>
            </div>
          </div>
          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
            totalDailyPnl >= 0 
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' 
              : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
          }`}>
            {totalDailyPnl >= 0 ? '+' : ''}${totalDailyPnl.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="w-full h-64">
          {dailyPnL.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400 dark:text-neutral-500 font-mono">
              No closed trade history to plot daily P&L
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyPnL} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontFamily="Inter, sans-serif"
                  tickLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontFamily="Inter, sans-serif"
                  tickLine={false}
                  tickFormatter={(val) => `$${val >= 1000 || val <= -1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl p-2.5 shadow-xl font-mono text-xs">
                          <div className="text-gray-500 dark:text-neutral-400 font-bold mb-1">{data.date}</div>
                          <div className={`text-sm font-extrabold ${data.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            Daily: {data.pnl >= 0 ? '+' : ''}${data.pnl.toLocaleString()}
                          </div>
                          <div className="text-blue-600 dark:text-blue-400 text-[11px] mt-0.5">
                            Cumulative: {data.cumulativePnl >= 0 ? '+' : ''}${data.cumulativePnl.toLocaleString()}
                          </div>
                          <div className="text-gray-500 dark:text-neutral-400 text-[10px] mt-1 border-t border-gray-100 dark:border-white/[0.06] pt-1">
                            Trades: {data.tradesCount} | Win Rate: {data.winRate}% | Vol: {data.volumeLots} lots
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {dailyPnL.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} 
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="cumulativePnl"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* CHART 2: Hourly Performance (00:00 - 23:00 UTC) */}
      <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-4.5 flex flex-col justify-between shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white capitalize font-mono">
                Hourly Performance (00:00 - 23:00 UTC)
              </h3>
              <p className="text-[10.5px] text-gray-500 dark:text-neutral-400">Volume and edge cluster analysis across market sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 dark:text-neutral-400">
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
            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis 
                dataKey="hour" 
                stroke="#94a3b8" 
                fontSize={9} 
                fontFamily="Inter, sans-serif"
                tickLine={false}
                interval={2}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                fontFamily="Inter, sans-serif"
                tickLine={false}
                tickFormatter={(val) => `$${val >= 1000 || val <= -1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl p-2.5 shadow-xl font-mono text-xs">
                        <div className="flex items-center justify-between gap-3 text-gray-600 dark:text-neutral-300 font-bold mb-1">
                          <span>{data.hour} UTC</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300">{data.session}</span>
                        </div>
                        <div className={`text-sm font-extrabold ${data.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          P&L: {data.pnl >= 0 ? '+' : ''}${data.pnl.toLocaleString()}
                        </div>
                        <div className="text-gray-500 dark:text-neutral-400 text-[10px] mt-1 border-t border-gray-100 dark:border-white/[0.06] pt-1">
                          Trades: {data.tradesCount} | Win Rate: {data.winRate}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1} />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, index) => {
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
      <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-4.5 flex flex-col justify-between shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ScatterIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white capitalize font-mono">
                R:R Scatter Plot (Planned vs Realized)
              </h3>
              <p className="text-[10.5px] text-gray-500 dark:text-neutral-400">Institutional threshold: 1:2+ target capture validation</p>
            </div>
          </div>
          <span className="text-[10.5px] font-mono text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800/60">
            Avg Realized: {avgRealizedRR}R
          </span>
        </div>

        <div className="w-full h-64">
          {scatterPoints.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-400 dark:text-neutral-500 font-mono">
              No trade data to plot R:R distribution
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                  type="number" 
                  dataKey="riskAmount" 
                  name="Risk ($)" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontFamily="Inter, sans-serif"
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                />
                <YAxis 
                  type="number" 
                  dataKey="realizedRR" 
                  name="Realized R:R" 
                  domain={[-2, 6]}
                  stroke="#94a3b8" 
                  fontSize={10} 
                  fontFamily="Inter, sans-serif"
                  tickFormatter={(v) => `${v}R`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl p-2.5 shadow-xl font-mono text-xs">
                          <div className="flex items-center justify-between text-gray-900 dark:text-white font-bold mb-1">
                            <span>{data.symbol}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              data.status === 'WIN' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                            }`}>
                              {data.status}
                            </span>
                          </div>
                          <div className="text-gray-700 dark:text-neutral-300">
                            Realized R:R: <strong className={data.realizedRR > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{data.realizedRR}R</strong>
                          </div>
                          <div className="text-gray-500 dark:text-neutral-400 text-[10.5px]">
                            Planned R:R: {data.plannedRR}R | PnL: ${data.pnl}
                          </div>
                          <div className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1">
                            Risk: ${data.riskAmount} | Reward: ${data.rewardAmount}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={2.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: '2.0R Target', fill: '#10b981', fontSize: 10, fontFamily: 'Inter, sans-serif' }} />
                <ReferenceLine y={0} stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1} />
                <ReferenceLine y={-1.0} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: '-1.0R Stop', fill: '#f43f5e', fontSize: 10, fontFamily: 'Inter, sans-serif' }} />
                <Scatter name="Trades" data={scatterPoints}>
                  {scatterPoints.map((entry, index) => {
                    const isWinAbove2R = entry.realizedRR >= 2.0;
                    const isLoss = entry.realizedRR < 0;
                    return (
                      <Cell 
                        key={`scatter-${index}`} 
                        fill={isWinAbove2R ? '#10b981' : isLoss ? '#f43f5e' : '#0284c7'} 
                        stroke={isDark ? '#0B0E14' : '#ffffff'}
                        strokeWidth={1}
                        fillOpacity={0.85}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* CHART 4: Day of Week Distribution (Mon - Fri) */}
      <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-4.5 flex flex-col justify-between shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <CalendarDays className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white capitalize font-mono">
                Day of Week Performance
              </h3>
              <p className="text-[10.5px] text-gray-500 dark:text-neutral-400">Profitability & Win-rate matrix from Monday to Friday</p>
            </div>
          </div>
          <span className="text-[10.5px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/60">
            Best Day: {bestDay}
          </span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dayOfWeek} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#94a3b8" 
                fontSize={11} 
                fontFamily="Inter, sans-serif"
                tickLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                fontFamily="Inter, sans-serif"
                tickLine={false}
                tickFormatter={(val) => `$${val >= 1000 || val <= -1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] rounded-xl p-2.5 shadow-xl font-mono text-xs">
                        <div className="text-gray-900 dark:text-white font-bold mb-1">{data.day}day Performance</div>
                        <div className={`text-sm font-extrabold ${data.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          Total P&L: {data.pnl >= 0 ? '+' : ''}${data.pnl.toLocaleString()}
                        </div>
                        <div className="text-gray-700 dark:text-neutral-300 text-[11px] mt-0.5">
                          Win Rate: <strong>{data.winRate}%</strong> ({data.tradesCount} trades)
                        </div>
                        <div className="text-gray-500 dark:text-neutral-400 text-[10px] mt-1 border-t border-gray-100 dark:border-white/[0.06] pt-1">
                          Avg Trade: ${data.avgPnl.toFixed(2)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke={isDark ? '#334155' : '#cbd5e1'} strokeWidth={1} />
              <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                {dayOfWeek.map((entry, index) => (
                  <Cell 
                    key={`day-${index}`} 
                    fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} 
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
