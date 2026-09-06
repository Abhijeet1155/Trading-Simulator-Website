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
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 text-[#2563EB]">
          <Layers className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No Trades Found</h3>
        <p className="text-xs text-gray-500 max-w-sm mb-6">
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
            className={`group bg-white border rounded-2xl overflow-hidden hover:border-[#2563EB]/60 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md relative ${
              isWin 
                ? 'border-emerald-200/90' 
                : isLoss 
                ? 'border-rose-200/90' 
                : 'border-gray-200'
            }`}
          >
            {/* Card Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  {/* Direction Pill */}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold tracking-wider uppercase flex items-center gap-1 ${
                    isLong 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trade.direction}
                  </span>

                  {/* Symbol */}
                  <span className="font-mono font-bold text-sm text-gray-900 group-hover:text-[#2563EB] transition-colors">
                    {trade.symbol}
                  </span>

                  <span className="text-[10px] font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                    {trade.timeframe || '5m'}
                  </span>
                </div>

                {/* Outcome & PnL Badge */}
                <div className="text-right">
                  <div className={`text-base font-mono font-extrabold ${
                    isWin 
                      ? 'text-emerald-600' 
                      : isLoss 
                      ? 'text-rose-600' 
                      : 'text-gray-700'
                  }`}>
                    {trade.netPnl >= 0 ? '+' : ''}${trade.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] font-mono text-gray-500">
                    {trade.rrRealized !== undefined && (
                      <span className={`font-semibold ${trade.rrRealized > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {trade.rrRealized > 0 ? `+${trade.rrRealized}R` : `${trade.rrRealized}R`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Setup Model Tag */}
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <span className="text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg truncate max-w-[200px]">
                  {trade.setupModel || 'Custom Setup'}
                </span>

                <span className="text-[10px] font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                  {trade.session.replace('_', ' ')}
                </span>
                
                {trade.partials && trade.partials.length > 0 && (
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                    {trade.partials.length} Partials
                  </span>
                )}
              </div>

              {/* Execution Mini Stats */}
              <div className="grid grid-cols-3 gap-1.5 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 text-xs font-mono mb-3">
                <div>
                  <span className="text-[9.5px] text-gray-500 uppercase block font-sans font-semibold">Entry</span>
                  <span className="text-gray-900 font-bold">{trade.entryPrice}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-gray-500 uppercase block font-sans font-semibold">Exit</span>
                  <span className="text-gray-900 font-bold">{trade.exitPrice || '-'}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-gray-500 uppercase block font-sans font-semibold">Size</span>
                  <span className="text-gray-900 font-bold">{trade.lotSize} lots</span>
                </div>
              </div>

              {/* Confluences Chips */}
              {trade.confluences && trade.confluences.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {trade.confluences.slice(0, 3).map((c) => (
                    <span key={c} className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
                      {c}
                    </span>
                  ))}
                  {trade.confluences.length > 3 && (
                    <span className="text-[10px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded border border-gray-200">
                      +{trade.confluences.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Chart Snapshot Preview (if available) */}
            {trade.chartUrl && (
              <div className="relative h-28 w-full bg-gray-100 border-y border-gray-100 overflow-hidden group-hover:opacity-95 transition-opacity">
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
            <div className="p-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{new Date(trade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="text-gray-400">•</span>
                <span>{new Date(trade.entryDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onEditTrade(trade)}
                  className="p-1.5 text-gray-400 hover:text-[#2563EB] hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit Trade"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTrade(trade.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Delete Trade"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTrade(trade)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-[#2563EB] text-[#2563EB] hover:text-white font-semibold text-[11px] rounded-lg transition-all border border-blue-200 hover:border-transparent ml-1 shadow-2xs"
                >
                  <span>Review</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
