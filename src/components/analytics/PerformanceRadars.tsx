'use client';

import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { Shield, Target, Clock, Zap, Award } from 'lucide-react';
import { RadarDataPoint } from '../../types/analytics';
import { useTheme } from '@/context/ThemeContext';

interface PerformanceRadarsProps {
  showBenchmark?: boolean;
  radars?: {
    discipline: RadarDataPoint[];
    riskManagement: RadarDataPoint[];
    execution: RadarDataPoint[];
    edgeConsistency: RadarDataPoint[];
    scores?: { discipline: number; risk: number; execution: number; edge: number };
  };
}

export default function PerformanceRadars({ showBenchmark = true, radars }: PerformanceRadarsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const defaultDisc = [
    { axis: 'Rule Adherence', traderScore: 85, benchmarkScore: 70, fullMark: 100 },
    { axis: 'Plan Execution', traderScore: 82, benchmarkScore: 65, fullMark: 100 },
    { axis: 'FOMO Resistance', traderScore: 80, benchmarkScore: 60, fullMark: 100 },
    { axis: 'Loss Acceptance', traderScore: 88, benchmarkScore: 75, fullMark: 100 },
    { axis: 'No Revenge Trade', traderScore: 90, benchmarkScore: 68, fullMark: 100 },
    { axis: 'Overtrade Control', traderScore: 84, benchmarkScore: 72, fullMark: 100 },
  ];

  const defaultRisk = [
    { axis: 'SL Discipline', traderScore: 88, benchmarkScore: 75, fullMark: 100 },
    { axis: 'Pos Sizing Consistency', traderScore: 85, benchmarkScore: 70, fullMark: 100 },
    { axis: 'Max DD Control', traderScore: 89, benchmarkScore: 68, fullMark: 100 },
    { axis: 'R:R Realization', traderScore: 82, benchmarkScore: 65, fullMark: 100 },
    { axis: 'Profit Scaling', traderScore: 78, benchmarkScore: 60, fullMark: 100 },
    { axis: 'Capital Preservation', traderScore: 90, benchmarkScore: 72, fullMark: 100 },
  ];

  const defaultExec = [
    { axis: 'Killzone Precision', traderScore: 86, benchmarkScore: 65, fullMark: 100 },
    { axis: 'Entry Slippage', traderScore: 84, benchmarkScore: 70, fullMark: 100 },
    { axis: 'Limit Fill Rate', traderScore: 87, benchmarkScore: 68, fullMark: 100 },
    { axis: 'Macro Timing', traderScore: 80, benchmarkScore: 62, fullMark: 100 },
    { axis: 'Exit Timing', traderScore: 85, benchmarkScore: 66, fullMark: 100 },
    { axis: 'Spread Efficiency', traderScore: 88, benchmarkScore: 74, fullMark: 100 },
  ];

  const defaultEdge = [
    { axis: 'Setup Expectancy', traderScore: 89, benchmarkScore: 70, fullMark: 100 },
    { axis: 'Win Rate Stability', traderScore: 84, benchmarkScore: 65, fullMark: 100 },
    { axis: 'Profit Factor', traderScore: 90, benchmarkScore: 68, fullMark: 100 },
    { axis: 'Market Regime Adapt', traderScore: 78, benchmarkScore: 60, fullMark: 100 },
    { axis: 'Confluence Depth', traderScore: 86, benchmarkScore: 72, fullMark: 100 },
    { axis: 'Volume Profile Fit', traderScore: 82, benchmarkScore: 66, fullMark: 100 },
  ];

  const discData = radars?.discipline || defaultDisc;
  const riskData = radars?.riskManagement || defaultRisk;
  const execData = radars?.execution || defaultExec;
  const edgeData = radars?.edgeConsistency || defaultEdge;

  const getAvgScore = (data: RadarDataPoint[]) => {
    return Math.round(data.reduce((a, b) => a + b.traderScore, 0) / (data.length || 1));
  };

  const radarConfigs = [
    {
      title: 'Discipline & Psychology',
      score: radars?.scores?.discipline ?? getAvgScore(discData),
      color: '#10b981', // emerald
      icon: Shield,
      data: discData,
      summary: 'Evaluated from win-rate stability, stop loss execution, and revenge trading avoidance.',
    },
    {
      title: 'Risk Management',
      score: radars?.scores?.risk ?? getAvgScore(riskData),
      color: '#2563eb', // blue
      icon: Target,
      data: riskData,
      summary: 'Evaluated from drawdown containment, position sizing, and realized R:R efficiency.',
    },
    {
      title: 'Execution Timing',
      score: radars?.scores?.execution ?? getAvgScore(execData),
      color: '#0284c7', // sky
      icon: Clock,
      data: execData,
      summary: 'Evaluated from London / NY session killzones, hold times, and fill efficiency.',
    },
    {
      title: 'Edge & Consistency',
      score: radars?.scores?.edge ?? getAvgScore(edgeData),
      color: '#7c3aed', // purple
      icon: Zap,
      data: edgeData,
      summary: 'Evaluated from profit factor, positive trade expectancy, and setup repeatability.',
    },
  ];

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider font-mono">
            Institutional Performance Radar (4-Pillar Evaluation)
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Trader Profile (Live Data)
          </span>
          {showBenchmark && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-neutral-600 border border-gray-300 dark:border-neutral-500 border-dashed" />
              Institutional Benchmark (70th %ile)
            </span>
          )}
        </div>
      </div>

      {/* 4-Column Grid of Radar Visualizations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {radarConfigs.map((config) => {
          const Icon = config.icon;

          return (
            <div
              key={config.title}
              className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-gray-300 dark:hover:border-white/[0.15] transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center border"
                    style={{
                      backgroundColor: `${config.color}15`,
                      borderColor: `${config.color}30`,
                      color: config.color,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white">{config.title}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-neutral-400 font-mono">Score: <strong style={{ color: config.color }}>{config.score}/100</strong></p>
                  </div>
                </div>
                <span
                  className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg border"
                  style={{
                    backgroundColor: `${config.color}15`,
                    borderColor: `${config.color}30`,
                    color: config.color,
                  }}
                >
                  {config.score >= 85 ? 'Top 10%' : config.score >= 70 ? 'Top 25%' : 'Developing'}
                </span>
              </div>

              {/* Radar Chart */}
              <div className="w-full h-52 my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={config.data}>
                    <PolarGrid stroke={isDark ? '#262f40' : '#e2e8f0'} />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 9, fontFamily: 'monospace', fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    {showBenchmark && (
                      <Radar
                        name="Benchmark"
                        dataKey="benchmarkScore"
                        stroke="#94a3b8"
                        strokeDasharray="3 3"
                        fill="#94a3b8"
                        fillOpacity={0.12}
                      />
                    )}
                    <Radar
                      name="Trader"
                      dataKey="traderScore"
                      stroke={config.color}
                      strokeWidth={2}
                      fill={config.color}
                      fillOpacity={0.25}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#161D2A' : '#ffffff',
                        borderColor: isDark ? '#262f40' : '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                      }}
                      formatter={(val: any, name: any) => [`${val}/100`, name === 'traderScore' ? 'Trader Score' : 'Benchmark'] as any}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Insight */}
              <div className="bg-gray-50 dark:bg-[#161D2A] p-2 rounded-xl border border-gray-100 dark:border-white/[0.06] text-[10.5px] text-gray-600 dark:text-neutral-300">
                <span className="text-gray-900 dark:text-white font-semibold">Insight: </span>
                {config.summary}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
