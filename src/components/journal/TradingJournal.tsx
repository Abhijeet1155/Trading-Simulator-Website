'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  BookOpen, 
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { Trade, JournalFilterState } from '../../types/journal';
import { MOCK_TRADES, calculateTradeMetrics } from '../../data/mockJournalData';
import JournalMetrics from './JournalMetrics';
import JournalFilters from './JournalFilters';
import JournalCardView from './JournalCardView';
import JournalTable from './JournalTable';
import NewTradeModal from './NewTradeModal';
import TradeDetailModal from './TradeDetailModal';

const STORAGE_KEY = 'paperpulse_journal_trades_v1';

export default function TradingJournal() {
  // Trade List State
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

  // Load from LocalStorage or initialize with rich mock data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTrades(parsed);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored trades, loading mock data', e);
    }
    setTrades(MOCK_TRADES);
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever trades update
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    }
  }, [trades, isLoaded]);

  // Handle Create or Update Trade
  const handleSaveTrade = (savedTrade: Trade) => {
    setTrades((prev) => {
      const exists = prev.some((t) => t.id === savedTrade.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTrade.id ? savedTrade : t));
      } else {
        return [savedTrade, ...prev];
      }
    });

    // If currently inspecting this trade, update selectedTrade
    if (selectedTrade?.id === savedTrade.id) {
      setSelectedTrade(savedTrade);
    }
  };

  // Handle Delete Trade
  const handleDeleteTrade = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trade log?')) {
      setTrades((prev) => prev.filter((t) => t.id !== id));
      if (selectedTrade?.id === id) {
        setSelectedTrade(null);
        setIsDetailModalOpen(false);
      }
    }
  };

  // Reset to default mock data
  const handleResetToSampleData = () => {
    if (window.confirm('Reset journal back to default institutional sample trades?')) {
      setTrades(MOCK_TRADES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TRADES));
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trades, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `paperpulse_trading_journal_${new Date().toISOString().slice(0, 10)}.json`);
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

  // Filter and Sort trades
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // 1. Search filter (symbol, setup model, notes, confluences)
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

      // 2. Symbol
      if (filters.symbol !== 'ALL' && trade.symbol !== filters.symbol) {
        return false;
      }

      // 3. Direction
      if (filters.direction !== 'ALL' && trade.direction !== filters.direction) {
        return false;
      }

      // 4. Result (WIN, LOSS, BE)
      if (filters.result !== 'ALL' && trade.result !== filters.result) {
        return false;
      }

      // 5. Session
      if (filters.session !== 'ALL' && trade.session !== filters.session) {
        return false;
      }

      // 6. Setup Model
      if (filters.setupModel !== 'ALL' && trade.setupModel !== filters.setupModel) {
        return false;
      }

      // 7. Date Range quick filter
      if (filters.dateRange !== 'ALL' && trade.entryDate) {
        const tradeTime = new Date(trade.entryDate).getTime();
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
      const timeA = new Date(a.entryDate).getTime();
      const timeB = new Date(b.entryDate).getTime();
      return timeB - timeA; // Default newest first
    });
  }, [trades, filters]);

  // Overall Calculated Metrics based on filtered trades
  const metrics = useMemo(() => {
    return calculateTradeMetrics(filteredTrades);
  }, [filteredTrades]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Institutional Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Trading Journal & Playbook
                </h1>
                <span className="text-[10.5px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                  PRO
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Institutional trade logger, SMC/ICT confluence tracker, partial profit metrics, and psychological review.
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Export Journal to JSON file"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              type="button"
              onClick={handleResetToSampleData}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Reload sample institutional trades"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Data</span>
            </button>

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

        {/* High Density Metrics Strip */}
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

        {/* Main Content Area: Cards vs Table View */}
        {viewMode === 'cards' ? (
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

      {/* Deep Trade Review & Lightbox Modal */}
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
