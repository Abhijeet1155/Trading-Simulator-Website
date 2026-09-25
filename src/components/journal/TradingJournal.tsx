'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Download, 
  RotateCcw, 
  BookOpen, 
  Sparkles,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet,
  FileCode,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Trade, JournalFilterState } from '../../types/journal';
import { 
  normalizeTrade, 
  calculateJournalMetrics, 
  exportTradesToCSV 
} from '../../utils/analyticsEngine';
import { MOCK_TRADES } from '../../data/mockJournalData';
import JournalMetrics from './JournalMetrics';
import JournalFilters from './JournalFilters';
import JournalCardView from './JournalCardView';
import JournalTable from './JournalTable';
import NewTradeModal from './NewTradeModal';
import TradeDetailModal from './TradeDetailModal';

export default function TradingJournal() {
  // Trade List State
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // View state: 'cards' | 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Filter State
  const [filters, setFilters] = useState<JournalFilterState>({
    search: '',
    symbol: 'ALL',
    direction: 'ALL',
    result: 'ALL',
    session: 'ALL',
    setupModel: 'ALL',
    confluence: 'ALL',
    timeframe: 'ALL',
    dateRange: 'ALL',
    sortBy: 'date-desc',
  });

  // Fetch real trades from database API
  const fetchTrades = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const res = await fetch('/api/trades?status=all&all_wallets=true', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch trade logs (${res.status})`);
      }

      const rawData = await res.json();
      if (Array.isArray(rawData)) {
        const normalized = rawData.map(normalizeTrade);
        setTrades(normalized);
        if (showToast) {
          setStatusMessage({ type: 'success', text: `Synchronized ${normalized.length} real trade logs from database` });
          setTimeout(() => setStatusMessage(null), 3500);
        }
      }
    } catch (err: any) {
      console.error('[TradingJournal] Error fetching real trades:', err);
      // Fallback: check localStorage cache
      try {
        const cached = localStorage.getItem('paperpulse_journal_cached_trades');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTrades(parsed.map(normalizeTrade));
          }
        }
      } catch (e) {}

      if (showToast) {
        setStatusMessage({ type: 'error', text: err.message || 'Failed to sync trades' });
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTrades(false);
  }, [fetchTrades]);

  // Persist latest trades to localStorage cache for offline fallback
  useEffect(() => {
    if (trades.length > 0) {
      try {
        localStorage.setItem('paperpulse_journal_cached_trades', JSON.stringify(trades));
      } catch (e) {}
    }
  }, [trades]);

  // Handle Create or Update Trade with backend sync
  const handleSaveTrade = async (savedTrade: Trade) => {
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...savedTrade,
          status: savedTrade.status.toLowerCase(),
          side: savedTrade.direction === 'LONG' ? 'buy' : 'sell',
          quantity: savedTrade.lotSize,
          entry_price: savedTrade.entryPrice,
          exit_price: savedTrade.exitPrice,
          pnl: savedTrade.netPnl,
          netPnl: savedTrade.netPnl,
          setup_model: savedTrade.setupModel,
          notes: savedTrade.notes,
        })
      });

      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Trade saved to database successfully' });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.warn('Backend save error, updating local state:', e);
    }

    // Optimistically update state
    setTrades((prev) => {
      const exists = prev.some((t) => t.id === savedTrade.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTrade.id ? savedTrade : t));
      } else {
        return [savedTrade, ...prev];
      }
    });

    if (selectedTrade?.id === savedTrade.id) {
      setSelectedTrade(savedTrade);
    }
  };

  // Handle Delete Trade with backend sync
  const handleDeleteTrade = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trade log?')) {
      try {
        await fetch(`/api/trades?id=${id}`, { method: 'DELETE' });
        setStatusMessage({ type: 'success', text: 'Trade deleted successfully' });
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (e) {
        console.warn('Backend delete error:', e);
      }

      setTrades((prev) => prev.filter((t) => t.id !== id));
      if (selectedTrade?.id === id) {
        setSelectedTrade(null);
        setIsDetailModalOpen(false);
      }
    }
  };

  // Load sample demo trades for testing / demonstration
  const handleLoadSampleData = () => {
    if (window.confirm('Load institutional sample demo trades into your journal?')) {
      const sampleTrades = MOCK_TRADES.map(normalizeTrade);
      setTrades(sampleTrades);
      setStatusMessage({ type: 'success', text: 'Loaded institutional sample trades' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Export Filtered Trades to CSV
  const handleExportCSV = () => {
    const csvContent = exportTradesToCSV(filteredTrades);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `paperpulse_journal_trades_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredTrades, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `paperpulse_journal_trades_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter Updates
  const handleFilterChange = (newFilters: Partial<JournalFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      symbol: 'ALL',
      direction: 'ALL',
      result: 'ALL',
      session: 'ALL',
      setupModel: 'ALL',
      confluence: 'ALL',
      timeframe: 'ALL',
      dateRange: 'ALL',
      sortBy: 'date-desc',
    });
  };

  // Available unique symbols for filter dropdown
  const uniqueSymbols = useMemo(() => {
    const list = Array.from(new Set(trades.map((t) => t.symbol))).filter(Boolean);
    return list.sort();
  }, [trades]);

  // Filter and Sort trades using REAL criteria
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // 1. Search filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesSymbol = trade.symbol.toLowerCase().includes(query);
        const matchesModel = (trade.setupModel || '').toLowerCase().includes(query);
        const matchesNotes = (trade.notes || '').toLowerCase().includes(query);
        const matchesConfluences = (trade.confluences || []).some((c) => c.toLowerCase().includes(query));
        if (!matchesSymbol && !matchesModel && !matchesNotes && !matchesConfluences) {
          return false;
        }
      }

      // 2. Symbol filter
      if (filters.symbol !== 'ALL') {
        const cleanFilter = filters.symbol.replace('/', '').toUpperCase();
        const cleanTrade = trade.symbol.replace('/', '').toUpperCase();
        if (cleanTrade !== cleanFilter) {
          return false;
        }
      }

      // 3. Direction (LONG / SHORT)
      if (filters.direction !== 'ALL') {
        if (trade.direction !== filters.direction) {
          return false;
        }
      }

      // 4. Outcome Result: Wins (p_l > 0), Losses (p_l < 0), BE (p_l == 0)
      if (filters.result !== 'ALL') {
        if (filters.result === 'WIN' && trade.netPnl <= 0.001) return false;
        if (filters.result === 'LOSS' && trade.netPnl >= -0.001) return false;
        if (filters.result === 'BE' && (Math.abs(trade.netPnl) > 0.001 && trade.result !== 'BE')) return false;
      }

      // 5. Session
      if (filters.session !== 'ALL' && trade.session !== filters.session) {
        return false;
      }

      // 6. Setup Model
      if (filters.setupModel !== 'ALL' && trade.setupModel !== filters.setupModel) {
        return false;
      }

      // 7. Date Range filter
      if (filters.dateRange !== 'ALL' && trade.entryDate) {
        const tradeTime = new Date(trade.exitDate || trade.entryDate).getTime();
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (filters.dateRange === 'TODAY' && now - tradeTime > oneDay) {
          return false;
        }
        if (filters.dateRange === 'THIS_WEEK' && now - tradeTime > 7 * oneDay) {
          return false;
        }
        if (filters.dateRange === 'THIS_MONTH' && now - tradeTime > 30 * oneDay) {
          return false;
        }
        if (filters.dateRange === 'LAST_30_DAYS' && now - tradeTime > 30 * oneDay) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.exitDate || a.entryDate).getTime();
      const timeB = new Date(b.exitDate || b.entryDate).getTime();
      return timeB - timeA; // Default newest first
    });
  }, [trades, filters]);

  // Overall Calculated Metrics based on REAL filtered trades
  const metrics = useMemo(() => {
    return calculateJournalMetrics(filteredTrades);
  }, [filteredTrades]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#121212] text-gray-900 dark:text-neutral-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
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

        {/* Top Institutional Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-neutral-100">
                  Trading Journal & Playbook
                </h1>
                <span className="text-[10.5px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Database Live
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                Real-time institutional trade logger synced with database trades, P&L calculations, and review analytics.
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Refresh Button */}
            <button
              type="button"
              onClick={() => fetchTrades(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-neutral-800 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              title="Fetch latest trades from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync DB'}</span>
            </button>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-neutral-800 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Export filtered trades to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </button>

            {/* JSON Export */}
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-neutral-800 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Export Journal to JSON file"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            {/* Load Sample Data if empty */}
            {trades.length === 0 && (
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="flex items-center gap-1.5 bg-white dark:bg-[#181818] hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-100 border border-gray-200 dark:border-neutral-800 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title="Load sample demo trades"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Load Samples</span>
              </button>
            )}

            {/* Log New Trade Button */}
            <button
              type="button"
              onClick={() => {
                setEditingTrade(null);
                setIsNewModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Trade</span>
            </button>
          </div>
        </div>

        {/* High Density Metrics Strip (Computed from real trades) */}
        <JournalMetrics metrics={metrics} />

        {/* Multi-Filter & Search Bar */}
        <JournalFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          symbols={uniqueSymbols}
          totalFilteredCount={filteredTrades.length}
        />

        {/* Empty State when 0 real trades found */}
        {trades.length === 0 && !isLoading && (
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center mb-4 text-[#2563EB] dark:text-blue-400">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-neutral-100 mb-1">No Real Trades Logged Yet</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 max-w-md mb-6 leading-relaxed">
              Place orders in the Trading Terminal or log your trades manually here. All metrics, R:R ratios, and P&L will automatically calculate and sync from the database.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/trade"
                className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Open Trading Terminal</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setEditingTrade(null);
                  setIsNewModalOpen(true);
                }}
                className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-neutral-100 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log Trade Manually</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="flex items-center gap-2 text-gray-500 dark:text-neutral-400 hover:text-[#2563EB] text-xs font-semibold px-3 py-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area: Cards vs Table View */}
        {trades.length > 0 && (
          viewMode === 'cards' ? (
            <JournalCardView
              trades={filteredTrades}
              onSelectTrade={(trade) => {
                setSelectedTrade(trade);
                setIsDetailModalOpen(true);
              }}
              onEditTrade={(trade) => {
                setEditingTrade(trade);
                setIsNewModalOpen(true);
              }}
              onDeleteTrade={handleDeleteTrade}
              onAddNewTrade={() => {
                setEditingTrade(null);
                setIsNewModalOpen(true);
              }}
            />
          ) : (
            <JournalTable
              trades={filteredTrades}
              onSelectTrade={(trade) => {
                setSelectedTrade(trade);
                setIsDetailModalOpen(true);
              }}
              onEditTrade={(trade) => {
                setEditingTrade(trade);
                setIsNewModalOpen(true);
              }}
              onDeleteTrade={handleDeleteTrade}
              onAddNewTrade={() => {
                setEditingTrade(null);
                setIsNewModalOpen(true);
              }}
            />
          )
        )}

      </div>

      {/* New / Edit Trade Modal */}
      <NewTradeModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setEditingTrade(null);
        }}
        onSaveTrade={handleSaveTrade}
        initialTrade={editingTrade}
      />

      {/* Deep Trade Review Modal */}
      <TradeDetailModal
        isOpen={isDetailModalOpen}
        trade={selectedTrade}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTrade(null);
        }}
        onEdit={(trade) => {
          setEditingTrade(trade);
          setIsNewModalOpen(true);
        }}
        onDelete={handleDeleteTrade}
      />
    </div>
  );
}
