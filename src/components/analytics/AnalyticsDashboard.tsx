'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Download, 
  Share2, 
  Sparkles, 
  Layers, 
  RotateCcw, 
  Check, 
  Sliders,
  DollarSign,
  ChevronDown
} from 'lucide-react';
import { AnalyticsFilterState } from '../../types/analytics';
import { MOCK_METRICS } from '../../data/mockAnalyticsData';
import { PREDEFINED_SETUP_MODELS, POPULAR_SYMBOLS } from '../../data/mockJournalData';
import MetricsOverview from './MetricsOverview';
import PerformanceRadars from './PerformanceRadars';
import AnalyticsCharts from './AnalyticsCharts';
import PnLCalendar from './PnLCalendar';
import EquityCurveMonteCarlo from './EquityCurveMonteCarlo';

export default function AnalyticsDashboard() {
  // Filter state
  const [filters, setFilters] = useState<AnalyticsFilterState>({
    accountId: 'acc-1',
    dateRange: 'LAST_30D',
    compareBenchmark: true,
    benchmarkAsset: 'SP500',
    selectedSymbol: 'ALL',
    selectedSession: 'ALL',
    selectedModel: 'ALL',
    selectedDayOfWeek: 'ALL',
  });

  const accounts = [
    { id: 'acc-1', name: 'Standard Demo #849201 ($100,000)', balance: 197680 },
    { id: 'acc-2', name: 'Institutional MT5 #294810 ($50,000)', balance: 64200 },
    { id: 'acc-3', name: 'Swing Crypto Portfolio ($25,000)', balance: 38400 },
  ];

  const handleFilterUpdate = (newFilters: Partial<AnalyticsFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      accountId: 'acc-1',
      dateRange: 'LAST_30D',
      compareBenchmark: true,
      benchmarkAsset: 'SP500',
      selectedSymbol: 'ALL',
      selectedSession: 'ALL',
      selectedModel: 'ALL',
      selectedDayOfWeek: 'ALL',
    });
  };

  const isFiltered = Boolean(
    filters.selectedSymbol !== 'ALL' ||
    filters.selectedSession !== 'ALL' ||
    filters.selectedModel !== 'ALL' ||
    filters.selectedDayOfWeek !== 'ALL' ||
    filters.dateRange !== 'LAST_30D'
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. INSTITUTIONAL HEADER & GLOBAL FILTERS */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Title & Badge */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    Quantitative Analytics Suite
                  </h1>
                  <span className="text-[10.5px] font-mono font-bold bg-blue-50 text-[#2563EB] border border-blue-200 px-2 py-0.5 rounded-full">
                    INSTITUTIONAL
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Deep quantitative edge analysis, risk-adjusted performance ratios, execution clusters, and Monte Carlo projections.
                </p>
              </div>
            </div>

            {/* Quick Actions & Account Selector */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Account Selector */}
              <select
                value={filters.accountId}
                onChange={(e) => handleFilterUpdate({ accountId: e.target.value })}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:border-[#2563EB] font-mono font-semibold cursor-pointer shadow-2xs"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>

              {/* Date Range Picker */}
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterUpdate({ dateRange: e.target.value as any })}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:bg-white focus:border-[#2563EB] font-mono font-semibold cursor-pointer shadow-2xs"
              >
                <option value="LAST_7D">Last 7 Days</option>
                <option value="LAST_30D">Last 30 Days (Default)</option>
                <option value="LAST_90D">Last 90 Days</option>
                <option value="YTD">Year to Date (YTD)</option>
                <option value="ALL_TIME">All Time History</option>
              </select>

              {/* Benchmark Toggle */}
              <button
                type="button"
                onClick={() => handleFilterUpdate({ compareBenchmark: !filters.compareBenchmark })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                  filters.compareBenchmark
                    ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{filters.compareBenchmark ? '✓ S&P 500 Alpha' : '+ Benchmark'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title="Export PDF Report"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Secondary Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 text-xs">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-gray-400" /> Filters:
            </span>

            {/* Symbol Filter */}
            <select
              value={filters.selectedSymbol}
              onChange={(e) => handleFilterUpdate({ selectedSymbol: e.target.value })}
              className="bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB] font-mono shadow-2xs"
            >
              <option value="ALL">All Symbols</option>
              {POPULAR_SYMBOLS.map(s => (
                <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
              ))}
            </select>

            {/* Session Filter */}
            <select
              value={filters.selectedSession}
              onChange={(e) => handleFilterUpdate({ selectedSession: e.target.value as any })}
              className="bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB] font-mono shadow-2xs"
            >
              <option value="ALL">All Sessions</option>
              <option value="LONDON">🇬🇧 London Session</option>
              <option value="NEW_YORK">🇺🇸 New York Session</option>
              <option value="ASIA">🇯🇵 Asia Session</option>
            </select>

            {/* Setup Model Filter */}
            <select
              value={filters.selectedModel}
              onChange={(e) => handleFilterUpdate({ selectedModel: e.target.value })}
              className="bg-white border border-gray-200 text-gray-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB] max-w-[180px] truncate shadow-2xs"
            >
              <option value="ALL">All Playbook Models</option>
              {PREDEFINED_SETUP_MODELS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Day of week filter */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200 font-mono">
              {(['ALL', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleFilterUpdate({ selectedDayOfWeek: d })}
                  className={`px-2 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                    filters.selectedDayOfWeek === d
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg ml-auto cursor-pointer transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. INSTITUTIONAL METRICS GRID (4-Column Data Box) */}
        <MetricsOverview metrics={MOCK_METRICS} />

        {/* 3. PERFORMANCE RADAR / SPIDER CHARTS (Row of 4) */}
        <PerformanceRadars showBenchmark={filters.compareBenchmark} />

        {/* 4. MULTI-CHART ANALYTICS ROW (2x2 Grid) */}
        <AnalyticsCharts />

        {/* 5. PNL CALENDAR HEATMAP & MONTHLY MATRIX TABLE */}
        <PnLCalendar />

        {/* 6. CUMULATIVE EQUITY CURVE & MONTE CARLO SIMULATION */}
        <EquityCurveMonteCarlo />

      </div>
    </div>
  );
}
