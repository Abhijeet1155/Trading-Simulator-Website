'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Image as ImageIcon, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowUpDown,
  Layers,
  Plus
} from 'lucide-react';
import { Trade } from '../../types/journal';

interface JournalTableProps {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
  onEditTrade: (trade: Trade) => void;
  onDeleteTrade: (id: string) => void;
  onAddNewTrade: () => void;
}

export default function JournalTable({
  trades,
  onSelectTrade,
  onEditTrade,
  onDeleteTrade,
  onAddNewTrade,
}: JournalTableProps) {
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
    <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#151515] border-b border-gray-200 dark:border-neutral-800 text-[11px] font-bold text-gray-500 dark:text-neutral-400 capitalize font-mono">
              <th className="py-3 px-4">Date / Time</th>
              <th className="py-3 px-3">Symbol</th>
              <th className="py-3 px-3">Side</th>
              <th className="py-3 px-3">Entry / Exit</th>
              <th className="py-3 px-3">Size</th>
              <th className="py-3 px-4 text-right">Net P&L</th>
              <th className="py-3 px-3 text-center">R:R</th>
              <th className="py-3 px-3">Setup Model & Confluences</th>
              <th className="py-3 px-3 text-center">Chart</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 text-xs font-mono">
            {trades.map((trade) => {
              const isWin = trade.result === 'WIN' || trade.netPnl > 0;
              const isLoss = trade.result === 'LOSS' || trade.netPnl < 0;
              const isLong = trade.direction === 'LONG';

              return (
                <tr 
                  key={trade.id} 
                  onClick={() => onSelectTrade(trade)}
                  className="hover:bg-gray-50/80 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group"
                >
                  {/* Date & Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900 dark:text-neutral-100">
                      {new Date(trade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-neutral-400">
                      {new Date(trade.entryDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} • {trade.session.replace('_', ' ')}
                    </div>
                  </td>

                  {/* Symbol & Timeframe */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-900 dark:text-neutral-100 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                        {trade.symbol}
                      </span>
                      <span className="text-[10px] bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 px-1.5 py-0.2 rounded border border-gray-200 dark:border-neutral-700">
                        {trade.timeframe || '5m'}
                      </span>
                    </div>
                  </td>

                  {/* Direction */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize inline-flex items-center gap-1 ${
                      isLong 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' 
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                    }`}>
                      {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trade.direction}
                    </span>
                  </td>

                  {/* Prices */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-bold text-gray-900 dark:text-neutral-100">{trade.entryPrice}</div>
                    <div className="text-[10.5px] text-gray-500 dark:text-neutral-400">Exit: {trade.exitPrice || '—'}</div>
                  </td>

                  {/* Size */}
                  <td className="py-3.5 px-3 whitespace-nowrap font-medium text-gray-700 dark:text-neutral-300">
                    {trade.lotSize}L
                  </td>

                  {/* Net PnL */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className={`font-bold text-sm ${
                      isWin 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : isLoss 
                        ? 'text-rose-600 dark:text-rose-400' 
                        : 'text-gray-700 dark:text-neutral-300'
                    }`}>
                      {trade.netPnl >= 0 ? '+' : ''}${trade.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {trade.pnlPercentage !== undefined && (
                      <div className="text-[10px] text-gray-500 dark:text-neutral-400">
                        {trade.pnlPercentage >= 0 ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
                      </div>
                    )}
                  </td>

                  {/* Realized RR */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {trade.rrRealized !== undefined ? (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        trade.rrRealized > 0 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' 
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700'
                      }`}>
                        {trade.rrRealized > 0 ? `+${trade.rrRealized}R` : `${trade.rrRealized}R`}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-neutral-600">—</span>
                    )}
                  </td>

                  {/* Setup Model & Confluences */}
                  <td className="py-3.5 px-3 max-w-xs">
                    <div className="font-semibold text-gray-900 dark:text-neutral-100 truncate text-[11.5px]">
                      {trade.setupModel || 'Custom Setup'}
                    </div>
                    {trade.confluences && trade.confluences.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5 truncate text-[10px] text-gray-500 dark:text-neutral-400">
                        <span>{trade.confluences.slice(0, 2).join(' • ')}</span>
                        {trade.confluences.length > 2 && <span>+{trade.confluences.length - 2}</span>}
                      </div>
                    )}
                  </td>

                  {/* Chart icon */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {trade.chartUrl ? (
                      <span className="inline-flex p-1.5 bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800/60" title="Chart Snapshot Attached">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-neutral-700">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectTrade(trade)}
                        className="p-1.5 text-gray-400 dark:text-neutral-500 hover:text-[#2563EB] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
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
                        className="p-1.5 text-gray-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Delete Trade"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
