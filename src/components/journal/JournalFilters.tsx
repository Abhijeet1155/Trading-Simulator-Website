'use client';

import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Layers, 
  LayoutGrid, 
  Table as TableIcon, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { JournalFilterState, TradeResult, TradeDirection, TradingSession } from '../../types/journal';
import { PREDEFINED_SETUP_MODELS } from '../../data/mockJournalData';

interface JournalFiltersProps {
  filters: JournalFilterState;
  onFilterChange: (filters: Partial<JournalFilterState>) => void;
  onResetFilters: () => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  symbols: string[];
  totalFilteredCount: number;
}

export default function JournalFilters({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  symbols,
  totalFilteredCount,
}: JournalFiltersProps) {
  const isFiltered = Boolean(
    filters.search ||
    filters.symbol !== 'ALL' ||
    filters.direction !== 'ALL' ||
    filters.result !== 'ALL' ||
    filters.session !== 'ALL' ||
    filters.setupModel !== 'ALL' ||
    filters.dateRange !== 'ALL'
  );

  return (
    <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 mb-6 shadow-xs space-y-3.5">
      {/* Top Bar: Search + Primary Filters + View Mode Switch */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by pair, setup model, notes, confluences..."
            className="w-full bg-gray-50 dark:bg-[#151515] border border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 text-xs rounded-xl pl-10 pr-9 py-2.5 focus:outline-none focus:bg-white dark:focus:bg-[#181818] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle & Result Count */}
        <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0">
          <span className="text-xs text-gray-600 dark:text-neutral-400 font-mono px-2.5 py-1 bg-gray-50 dark:bg-[#151515] rounded-lg border border-gray-200 dark:border-neutral-800">
            <strong className="text-gray-900 dark:text-neutral-100">{totalFilteredCount}</strong> trades found
          </span>

          <div className="flex items-center bg-gray-100 dark:bg-[#151515] p-1 rounded-xl border border-gray-200 dark:border-neutral-800">
            <button
              onClick={() => onViewModeChange('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 hover:bg-gray-200/60 dark:hover:bg-neutral-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Pills Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800 text-xs">
        
        {/* Outcome Filter */}
        <div className="flex items-center bg-gray-50 dark:bg-[#151515] rounded-lg p-0.5 border border-gray-200 dark:border-neutral-800">
          {(['ALL', 'WIN', 'LOSS', 'BE'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onFilterChange({ result: r })}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-mono transition-all cursor-pointer ${
                filters.result === r
                  ? r === 'WIN' 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80' 
                    : r === 'LOSS'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80'
                    : 'bg-[#2563EB] text-white'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100'
              }`}
            >
              {r === 'ALL' ? 'All Outcomes' : r === 'WIN' ? '🟢 Wins' : r === 'LOSS' ? '🔴 Losses' : '⚪ BE'}
            </button>
          ))}
        </div>

        {/* Direction Filter */}
        <div className="flex items-center bg-gray-50 dark:bg-[#151515] rounded-lg p-0.5 border border-gray-200 dark:border-neutral-800">
          {(['ALL', 'LONG', 'SHORT'] as const).map((d) => (
            <button
              key={d}
              onClick={() => onFilterChange({ direction: d })}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-mono transition-all cursor-pointer ${
                filters.direction === d
                  ? d === 'LONG'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80'
                    : d === 'SHORT'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80'
                    : 'bg-[#2563EB] text-white'
                  : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100'
              }`}
            >
              {d === 'ALL' ? 'All Sides' : d === 'LONG' ? '▲ Long' : '▼ Short'}
            </button>
          ))}
        </div>

        {/* Symbol Dropdown */}
        <select
          value={filters.symbol}
          onChange={(e) => onFilterChange({ symbol: e.target.value })}
          className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB] font-mono shadow-2xs"
        >
          <option value="ALL">All Symbols ({symbols.length})</option>
          {symbols.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Session Dropdown */}
        <select
          value={filters.session}
          onChange={(e) => onFilterChange({ session: e.target.value as any })}
          className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB] font-mono shadow-2xs"
        >
          <option value="ALL">All Sessions</option>
          <option value="LONDON">🇬🇧 London Session</option>
          <option value="NEW_YORK">🇺🇸 New York Session</option>
          <option value="ASIA">🇯🇵 Asia Session</option>
          <option value="LONDON_CLOSE">🇬🇧 London Close</option>
          <option value="OVERNIGHT">🌙 Overnight / Hold</option>
        </select>

        {/* Setup Model Selector */}
        <select
          value={filters.setupModel}
          onChange={(e) => onFilterChange({ setupModel: e.target.value })}
          className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB] max-w-[180px] truncate shadow-2xs"
        >
          <option value="ALL">All Setup Models</option>
          {PREDEFINED_SETUP_MODELS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Date Range Selector */}
        <select
          value={filters.dateRange}
          onChange={(e) => onFilterChange({ dateRange: e.target.value as any })}
          className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-neutral-800 text-gray-800 dark:text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2563EB] font-mono shadow-2xs"
        >
          <option value="ALL">All Time</option>
          <option value="TODAY">Today</option>
          <option value="THIS_WEEK">This Week</option>
          <option value="THIS_MONTH">This Month</option>
          <option value="LAST_30_DAYS">Last 30 Days</option>
        </select>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-2.5 py-1.5 rounded-lg ml-auto cursor-pointer transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
