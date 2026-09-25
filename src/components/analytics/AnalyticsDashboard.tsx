'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Download, 
  Sparkles, 
  RotateCcw, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { AnalyticsFilterState } from '../../types/analytics';
import { Trade } from '../../types/journal';
import { 
  normalizeTrade,
  calculatePerformanceMetrics,
  calculatePerformanceRadars,
  calculateDailyPnL,
  calculateHourlyPnL,
  calculateDayOfWeek,
  calculateRRScatterPoints,
  calculateMonthlyReturnsMatrix,
  calculateEquityCurve,
  calculateMonteCarloSimulation,
  exportTradesToCSV
} from '../../utils/analyticsEngine';
import { MOCK_TRADES, PREDEFINED_SETUP_MODELS } from '../../data/mockJournalData';
import MetricsOverview from './MetricsOverview';
import PerformanceRadars from './PerformanceRadars';
import AnalyticsCharts from './AnalyticsCharts';
import PnLCalendar from './PnLCalendar';
import EquityCurveMonteCarlo from './EquityCurveMonteCarlo';

interface AccountOption {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
}

export default function AnalyticsDashboard() {
  // Accounts & Trades state
  const [accounts, setAccounts] = useState<AccountOption[]>([
    { id: 'ALL', name: 'All Accounts Combined', balance: 10000, initialBalance: 10000 }
  ]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Global Filter state
  const [filters, setFilters] = useState<AnalyticsFilterState>({
    accountId: 'ALL',
    dateRange: 'ALL_TIME',
    compareBenchmark: true,
    benchmarkAsset: 'SP500',
    selectedSymbol: 'ALL',
    selectedSession: 'ALL',
    selectedModel: 'ALL',
    selectedDayOfWeek: 'ALL',
  });

  // Fetch Accounts and Trades from Database API
  const fetchData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);

      // 1. Fetch user accounts
      const accRes = await fetch('/api/user/account', { cache: 'no-store' });
      let accountsList: AccountOption[] = [];
      let totalBal = 0;
      let totalInitBal = 0;

      if (accRes.ok) {
        const accData = await accRes.json();
        if (Array.isArray(accData.accounts) && accData.accounts.length > 0) {
          accountsList = accData.accounts.map((a: any) => {
            const bal = parseFloat(a.balance || 0);
            const initBal = parseFloat(a.initialBalance || 10000);
            totalBal += bal;
            totalInitBal += initBal;
            return {
              id: a.id,
              name: `${a.nickname || a.accountName || 'Demo'} ($${bal.toLocaleString()})`,
              balance: bal,
              initialBalance: initBal
            };
          });
        }
      }

      setAccounts([
        { id: 'ALL', name: `All Accounts Combined ($${totalBal.toLocaleString()})`, balance: totalBal || 10000, initialBalance: totalInitBal || 10000 },
        ...accountsList
      ]);

      // 2. Fetch all real trades
      const tradesRes = await fetch('/api/trades?status=all&all_wallets=true', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (tradesRes.ok) {
        const rawTrades = await tradesRes.json();
        if (Array.isArray(rawTrades)) {
          const normalized = rawTrades.map(normalizeTrade);
          setAllTrades(normalized);
          if (showToast) {
            setStatusMessage({ type: 'success', text: `Synchronized ${normalized.length} trades across all accounts` });
            setTimeout(() => setStatusMessage(null), 3000);
          }
        }
      }
    } catch (err: any) {
      console.error('[AnalyticsDashboard] Error fetching data:', err);
      // Fallback to cached trades
      try {
        const cached = localStorage.getItem('paperpulse_journal_cached_trades');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAllTrades(parsed.map(normalizeTrade));
          }
        }
      } catch (e) {}

      if (showToast) {
        setStatusMessage({ type: 'error', text: err.message || 'Failed to sync data' });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Load sample demo trades for demonstration if user has 0 trades
  const handleLoadSampleData = () => {
    if (window.confirm('Load sample demo trades to view institutional analytics?')) {
      const samples = MOCK_TRADES.map(normalizeTrade);
      setAllTrades(samples);
      setStatusMessage({ type: 'success', text: 'Loaded sample institutional trades' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleFilterUpdate = (newFilters: Partial<AnalyticsFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      accountId: 'ALL',
      dateRange: 'ALL_TIME',
      compareBenchmark: true,
      benchmarkAsset: 'SP500',
      selectedSymbol: 'ALL',
      selectedSession: 'ALL',
      selectedModel: 'ALL',
      selectedDayOfWeek: 'ALL',
    });
  };

  // Resolve starting and current balance
  const activeAccountObj = useMemo(() => {
    return accounts.find(a => a.id === filters.accountId) || accounts[0] || { balance: 10000, initialBalance: 10000 };
  }, [accounts, filters.accountId]);

  const startingBalance = activeAccountObj?.initialBalance || 10000;
  const currentBalance = activeAccountObj?.balance || 10000;

  // Extract unique symbols from real trades
  const uniqueSymbols = useMemo(() => {
    const list = Array.from(new Set(allTrades.map(t => t.symbol))).filter(Boolean);
    return list.sort();
  }, [allTrades]);

  // Filter real trades based on selected filters
  const filteredTrades = useMemo(() => {
    return allTrades.filter(trade => {
      // 1. Account Filter
      if (filters.accountId !== 'ALL' && (trade as any).wallet_id && (trade as any).wallet_id !== filters.accountId) {
        return false;
      }

      // 2. Symbol Filter
      if (filters.selectedSymbol !== 'ALL') {
        const cleanTrade = trade.symbol.replace('/', '').toUpperCase();
        const cleanFilter = filters.selectedSymbol.replace('/', '').toUpperCase();
        if (cleanTrade !== cleanFilter) return false;
      }

      // 3. Session Filter
      if (filters.selectedSession !== 'ALL' && trade.session !== filters.selectedSession) {
        return false;
      }

      // 4. Setup Model Filter
      if (filters.selectedModel !== 'ALL' && trade.setupModel !== filters.selectedModel) {
        return false;
      }

      // 5. Day of Week Filter
      if (filters.selectedDayOfWeek !== 'ALL') {
        const d = new Date(trade.exitDate || trade.entryDate);
        const dayNum = !isNaN(d.getTime()) ? d.getUTCDay() : 1;
        const map = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri' } as const;
        if ((map as any)[dayNum] !== filters.selectedDayOfWeek) return false;
      }

      // 6. Date Range Filter
      if (filters.dateRange !== 'ALL_TIME') {
        const tradeTime = new Date(trade.exitDate || trade.entryDate).getTime();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (filters.dateRange === 'LAST_7D' && now - tradeTime > 7 * oneDay) return false;
        if (filters.dateRange === 'LAST_30D' && now - tradeTime > 30 * oneDay) return false;
        if (filters.dateRange === 'LAST_90D' && now - tradeTime > 90 * oneDay) return false;
        if (filters.dateRange === 'YTD') {
          const tradeYear = new Date(tradeTime).getFullYear();
          const currentYear = new Date().getFullYear();
          if (tradeYear !== currentYear) return false;
        }
      }

      return true;
    });
  }, [allTrades, filters]);

  // REAL CALCULATED ANALYTICS VIA ENGINE
  const metrics = useMemo(() => {
    return calculatePerformanceMetrics(filteredTrades, startingBalance);
  }, [filteredTrades, startingBalance]);

  const radars = useMemo(() => {
    return calculatePerformanceRadars(filteredTrades);
  }, [filteredTrades]);

  const dailyPnL = useMemo(() => {
    return calculateDailyPnL(filteredTrades);
  }, [filteredTrades]);

  const hourlyPnL = useMemo(() => {
    return calculateHourlyPnL(filteredTrades);
  }, [filteredTrades]);

  const dayOfWeek = useMemo(() => {
    return calculateDayOfWeek(filteredTrades);
  }, [filteredTrades]);

  const rrScatter = useMemo(() => {
    return calculateRRScatterPoints(filteredTrades);
  }, [filteredTrades]);

  const monthlyMatrix = useMemo(() => {
    return calculateMonthlyReturnsMatrix(filteredTrades, startingBalance);
  }, [filteredTrades, startingBalance]);

  const equityCurve = useMemo(() => {
    return calculateEquityCurve(filteredTrades, startingBalance);
  }, [filteredTrades, startingBalance]);

  const monteCarlo = useMemo(() => {
    return calculateMonteCarloSimulation(filteredTrades, startingBalance, 30);
  }, [filteredTrades, startingBalance]);

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = exportTradesToCSV(filteredTrades);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `paperpulse_analytics_trades_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isFiltered = Boolean(
    filters.selectedSymbol !== 'ALL' ||
    filters.selectedSession !== 'ALL' ||
    filters.selectedModel !== 'ALL' ||
    filters.selectedDayOfWeek !== 'ALL' ||
    filters.dateRange !== 'ALL_TIME' ||
    filters.accountId !== 'ALL'
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0E14] text-gray-900 dark:text-neutral-100 p-3 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Status Toast */}
        {statusMessage && (
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold shadow-lg transition-all animate-fade-in ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800' 
              : 'bg-rose-50 dark:bg-rose-950/90 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 1. INSTITUTIONAL HEADER & GLOBAL FILTERS */}
        <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Title & Badge */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Quantitative Analytics Suite
                  </h1>
                  <span className="text-[10.5px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Real Sync
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                  Deep quantitative edge analysis, Sharpe/Sortino ratios, risk engines, and Monte Carlo projections derived from database trade logs.
                </p>
              </div>
            </div>

            {/* Quick Actions & Account Selector */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sync Button */}
              <button
                type="button"
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 bg-white dark:bg-[#161D2A] hover:bg-gray-50 dark:hover:bg-[#1c2536] text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-white/[0.1] px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                title="Fetch latest trades from database"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync DB'}</span>
              </button>

              {/* Account Selector */}
              <select
                value={filters.accountId}
                onChange={(e) => handleFilterUpdate({ accountId: e.target.value })}
                className="bg-gray-50 dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-neutral-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:bg-white dark:focus:bg-[#1c2536] focus:border-[#2563EB] font-mono font-semibold cursor-pointer shadow-2xs transition-colors max-w-[230px] truncate"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id} className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">
                    {acc.name}
                  </option>
                ))}
              </select>

              {/* Date Range Picker */}
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterUpdate({ dateRange: e.target.value as any })}
                className="bg-gray-50 dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-neutral-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:bg-white dark:focus:bg-[#1c2536] focus:border-[#2563EB] font-mono font-semibold cursor-pointer shadow-2xs transition-colors"
              >
                <option value="ALL_TIME" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">All Time History</option>
                <option value="LAST_7D" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">Last 7 Days</option>
                <option value="LAST_30D" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">Last 30 Days</option>
                <option value="LAST_90D" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">Last 90 Days</option>
                <option value="YTD" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">Year to Date (YTD)</option>
              </select>

              {/* Benchmark Toggle */}
              <button
                type="button"
                onClick={() => handleFilterUpdate({ compareBenchmark: !filters.compareBenchmark })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                  filters.compareBenchmark
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border-blue-200 dark:border-blue-800/60'
                    : 'bg-white dark:bg-[#161D2A] text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-white/[0.1] hover:bg-gray-50 dark:hover:bg-[#1c2536]'
                }`}
              >
                <span>{filters.compareBenchmark ? '✓ S&P 500 Alpha' : '+ Benchmark'}</span>
              </button>

              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-white dark:bg-[#161D2A] hover:bg-gray-50 dark:hover:bg-[#1c2536] text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-white/[0.1] px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title="Export Trades to CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Secondary Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100 dark:border-white/[0.06] text-xs">
            <span className="text-[11px] font-mono text-gray-500 dark:text-neutral-400 font-bold capitalize mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-gray-400 dark:text-neutral-500" /> Filters:
            </span>

            {/* Symbol Filter */}
            <select
              value={filters.selectedSymbol}
              onChange={(e) => handleFilterUpdate({ selectedSymbol: e.target.value })}
              className="bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] text-gray-800 dark:text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB] font-mono shadow-2xs transition-colors"
            >
              <option value="ALL" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">All Symbols ({uniqueSymbols.length})</option>
              {uniqueSymbols.map(s => (
                <option key={s} value={s} className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">{s}</option>
              ))}
            </select>

            {/* Session Filter */}
            <select
              value={filters.selectedSession}
              onChange={(e) => handleFilterUpdate({ selectedSession: e.target.value as any })}
              className="bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] text-gray-800 dark:text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB] font-mono shadow-2xs transition-colors"
            >
              <option value="ALL" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">All Sessions</option>
              <option value="LONDON" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">🇬🇧 London Session</option>
              <option value="NEW_YORK" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">🇺🇸 New York Session</option>
              <option value="ASIA" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">🇯🇵 Asia Session</option>
            </select>

            {/* Setup Model Filter */}
            <select
              value={filters.selectedModel}
              onChange={(e) => handleFilterUpdate({ selectedModel: e.target.value })}
              className="bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] text-gray-800 dark:text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB] max-w-[180px] truncate shadow-2xs transition-colors"
            >
              <option value="ALL" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">All Playbook Models</option>
              {PREDEFINED_SETUP_MODELS.map(m => (
                <option key={m} value={m} className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">{m}</option>
              ))}
            </select>

            {/* Day of week filter */}
            <div className="flex items-center bg-gray-100 dark:bg-[#161D2A] rounded-lg p-0.5 border border-gray-200 dark:border-white/[0.08] font-mono">
              {(['ALL', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleFilterUpdate({ selectedDayOfWeek: d })}
                  className={`px-2 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer ${
                    filters.selectedDayOfWeek === d
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'
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
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2.5 py-1.5 rounded-lg ml-auto cursor-pointer transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty state if 0 trades exist */}
        {allTrades.length === 0 && !isLoading && (
          <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-8 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center mb-3 text-[#2563EB] dark:text-blue-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Real Trade History Detected</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 max-w-md mb-5 leading-relaxed">
              Open trades in the Terminal or record entries in your Trading Journal to generate live quant analytics, heatmaps, and Sharpe metrics.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/trade"
                className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Open Trading Terminal</span>
              </Link>
              <Link
                href="/journal"
                className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-neutral-100 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                <span>Trading Journal</span>
              </Link>
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400 hover:text-[#2563EB] text-xs font-semibold px-3 py-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. INSTITUTIONAL METRICS GRID (4-Column Data Box) */}
        <MetricsOverview metrics={metrics} />

        {/* 3. PERFORMANCE RADAR / SPIDER CHARTS (Row of 4) */}
        <PerformanceRadars showBenchmark={filters.compareBenchmark} radars={radars} />

        {/* 4. MULTI-CHART ANALYTICS ROW (2x2 Grid) */}
        <AnalyticsCharts 
          dailyPnL={dailyPnL}
          hourlyData={hourlyPnL}
          scatterPoints={rrScatter}
          dayOfWeek={dayOfWeek}
        />

        {/* 5. PNL CALENDAR HEATMAP & MONTHLY MATRIX TABLE */}
        <PnLCalendar trades={filteredTrades} monthlyMatrix={monthlyMatrix} />

        {/* 6. CUMULATIVE EQUITY CURVE & MONTE CARLO SIMULATION */}
        <EquityCurveMonteCarlo 
          equityCurve={equityCurve}
          monteCarlo={monteCarlo}
          startingBalance={startingBalance}
          currentBalance={currentBalance}
          netPnl={metrics.netPnl}
          maxDrawdownPct={metrics.maxDrawdownPct}
          maxDrawdownAmount={metrics.maxDrawdownAmount}
        />

      </div>
    </div>
  );
}
