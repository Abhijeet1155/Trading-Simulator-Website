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
import { 
  RADAR_DISCIPLINE, 
  RADAR_RISK_MGMT, 
  RADAR_EXECUTION, 
  RADAR_EDGE_CONSISTENCY 
} from '../../data/mockAnalyticsData';
import { RadarDataPoint } from '../../types/analytics';

interface PerformanceRadarsProps {
  showBenchmark?: boolean;
}

export default function PerformanceRadars({ showBenchmark = true }: PerformanceRadarsProps) {
  const radarConfigs = [
    {
      title: 'Discipline & Psychology',
      score: 92,
      color: '#10b981', // emerald
      icon: Shield,
      data: RADAR_DISCIPLINE,
      summary: 'Excellent rule compliance and zero revenge trades.',
    },
    {
      title: 'Risk Management',
      score: 90,
      color: '#2563eb', // blue
      icon: Target,
      data: RADAR_RISK_MGMT,
      summary: 'Strict stop loss usage with consistent position sizing.',
    },
    {
      title: 'Execution Timing',
      score: 88,
      color: '#0284c7', // sky
      icon: Clock,
      data: RADAR_EXECUTION,
      summary: 'High precision inside London & NY Killzones.',
    },
    {
      title: 'Edge & Consistency',
      score: 91,
      color: '#7c3aed', // purple
      icon: Zap,
      data: RADAR_EDGE_CONSISTENCY,
      summary: 'High expectancy setup model with strong confluence.',
    },
  ];

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">
            Institutional Performance Radar (4-Pillar Evaluation)
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Trader Profile
          </span>
          {showBenchmark && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 border border-gray-300 border-dashed" />
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
              className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-gray-300 transition-colors"
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
                    <h3 className="text-xs font-bold text-gray-900">{config.title}</h3>
                    <p className="text-[10px] text-gray-500 font-mono">Score: <strong style={{ color: config.color }}>{config.score}/100</strong></p>
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
                  {config.score >= 90 ? 'Top 5%' : 'Top 15%'}
                </span>
              </div>

              {/* Radar Chart */}
              <div className="w-full h-52 my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={config.data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace', fontWeight: 600 }}
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
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: '#0f172a',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(val: any, name: any) => [`${val}/100`, name === 'traderScore' ? 'Trader' : 'Benchmark']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom Insight */}
              <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-[10.5px] text-gray-600">
                <span className="text-gray-900 font-semibold">Insight: </span>
                {config.summary}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
