'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Clock, 
  Layers, 
  Image as ImageIcon, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Star,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Trade } from '../../types/journal';

interface JournalCardViewProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
  onAddNewTrade: () => void;
}

export default function JournalCardView({
  trades,
  onSelectTrade,
  onEditTrade,
  onDeleteTrade,
  onAddNewTrade,
}: JournalCardViewProps) {
  if (trades.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center mb-4 text-[#2563EB] dark:text-blue-400">
          <Layers className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-neutral-100 mb-1">No Trades Found</h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400 max-w-sm mb-6">
          No logged trades matched your current search and filter criteria. Try adjusting your filters or record a new trade.
        </p>
        <button
          onClick={onAddNewTrade}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Trade</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trades.map((trade) => {
        const isWin = trade.result === 'WIN' || trade.netPnl > 0;
        const isLoss = trade.result === 'LOSS' || trade.netPnl < 0;
        const isLong = trade.direction === 'LONG';

        return (
          <div
            key={trade.id}
            onClick={() => onSelectTrade(trade)}
            className={`group bg-white dark:bg-[#1E1E1E] border rounded-2xl overflow-hidden hover:border-[#2563EB]/60 dark:hover:border-blue-500/60 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md relative ${
              isWin 
                ? 'border-emerald-200/90 dark:border-emerald-800/60' 
                : isLoss 
                ? 'border-rose-200/90 dark:border-rose-800/60' 
                : 'border-gray-200 dark:border-neutral-800'
            }`}
          >
            {/* Card Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  {/* Direction Pill */}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold  capitalize flex items-center gap-1 ${
                    isLong 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' 
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                  }`}>
                    {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trade.direction}
                  </span>

                  {/* Symbol */}
                  <span className="font-mono font-bold text-sm text-gray-900 dark:text-neutral-100 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                    {trade.symbol}
                  </span>

                  <span className="text-[10px] font-mono text-gray-600 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-neutral-700">
                    {trade.timeframe || '5m'}
                  </span>
                </div>

                {/* Outcome & PnL Badge */}
                <div className="text-right">
                  <div className={`text-base font-mono font-extrabold ${
                    isWin 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : isLoss 
                      ? 'text-rose-600 dark:text-rose-400' 
                      : 'text-gray-700 dark:text-neutral-300'
                  }`}>
                    {trade.netPnl >= 0 ? '+' : ''}${trade.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 dark:text-neutral-400">
                    {trade.rrRealized !== undefined && (
                      <span className={`font-semibold ${trade.rrRealized > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-neutral-400'}`}>
                        {trade.rrRealized > 0 ? `+${trade.rrRealized}R` : `${trade.rrRealized}R`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Setup Model Tag */}
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <span className="text-[11px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-lg truncate max-w-[200px]">
                  {trade.setupModel || 'Custom Setup'}
                </span>

                <span className="text-[10px] font-mono text-gray-600 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-neutral-700">
                  {trade.session.replace('_', ' ')}
                </span>
                
                {trade.partials && trade.partials.length > 0 && (
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded">
                    {trade.partials.length} Partials
                  </span>
                )}
              </div>

              {/* Execution Mini Stats */}
              <div className="grid grid-cols-3 gap-1.5 bg-gray-50/80 dark:bg-[#151515] p-2.5 rounded-xl border border-gray-100 dark:border-neutral-800 text-xs font-mono mb-3">
                <div>
                  <span className="text-[9.5px] text-gray-500 dark:text-neutral-400 capitalize block font-sans font-semibold">Entry</span>
                  <span className="text-gray-900 dark:text-neutral-100 font-bold">{trade.entryPrice}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-gray-500 dark:text-neutral-400 capitalize block font-sans font-semibold">Exit</span>
                  <span className="text-gray-900 dark:text-neutral-100 font-bold">{trade.exitPrice || '-'}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-gray-500 dark:text-neutral-400 capitalize block font-sans font-semibold">Size</span>
                  <span className="text-gray-900 dark:text-neutral-100 font-bold">{trade.lotSize} lots</span>
                </div>
              </div>

              {/* Confluences Chips */}
              {trade.confluences && trade.confluences.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {trade.confluences.slice(0, 3).map((c) => (
                    <span key={c} className="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-neutral-700">
                      {c}
                    </span>
                  ))}
                  {trade.confluences.length > 3 && (
                    <span className="text-[10px] text-gray-500 dark:text-neutral-400 bg-gray-50 dark:bg-neutral-900 px-1 py-0.5 rounded border border-gray-200 dark:border-neutral-800">
                      +{trade.confluences.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Chart Snapshot Preview (if available) */}
            {trade.chartUrl && (
              <div className="relative h-28 w-full bg-gray-100 dark:bg-neutral-900 border-y border-gray-100 dark:border-neutral-800 overflow-hidden group-hover:opacity-95 transition-opacity">
                <img
                  src={trade.chartThumbnail || trade.chartUrl}
                  alt={`${trade.symbol} chart snapshot`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-1.5 left-2.5 flex items-center gap-1 text-[10px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                  <ImageIcon className="w-3 h-3 text-blue-300" />
                  <span>Chart Attached</span>
                </div>
              </div>
            )}

            {/* Card Footer: Date + Actions */}
            <div className="p-3 bg-gray-50/60 dark:bg-[#151515] border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" />
                <span>{new Date(trade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="text-gray-400 dark:text-neutral-600">•</span>
                <span>{new Date(trade.entryDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onEditTrade(trade)}
                  className="p-1.5 text-gray-400 dark:text-neutral-500 hover:text-[#2563EB] dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                  title="Edit Trade"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTrade(trade.id)}
                  className="p-1.5 text-gray-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                  title="Delete Trade"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTrade(trade)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 hover:bg-[#2563EB] dark:hover:bg-blue-600 text-[#2563EB] dark:text-blue-400 hover:text-white font-semibold text-[11px] rounded-lg transition-all border border-blue-200 dark:border-blue-800/60 hover:border-transparent ml-1 shadow-2xs cursor-pointer"
                >
                  <span>Review</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
