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
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider font-mono">
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
          <tbody className="divide-y divide-gray-100 text-xs font-mono">
            {trades.map((trade) => {
              const isWin = trade.result === 'WIN' || trade.netPnl > 0;
              const isLoss = trade.result === 'LOSS' || trade.netPnl < 0;
              const isLong = trade.direction === 'LONG';

              return (
                <tr 
                  key={trade.id} 
                  onClick={() => onSelectTrade(trade)}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                >
                  {/* Date & Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">
                      {new Date(trade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {new Date(trade.entryDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} • {trade.session.replace('_', ' ')}
                    </div>
                  </td>

                  {/* Symbol & Timeframe */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-900 group-hover:text-[#2563EB] transition-colors">
                        {trade.symbol}
                      </span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded border border-gray-200">
                        {trade.timeframe || '5m'}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 capitalize font-sans">
                      {trade.assetClass}
                    </div>
                  </td>

                  {/* Side */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${
                      isLong 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trade.direction}
                    </span>
                  </td>

                  {/* Entry / Exit */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="text-gray-900 font-semibold">
                      In: <span className="font-bold">{trade.entryPrice}</span>
                    </div>
                    <div className="text-[10.5px] text-gray-500">
                      Out: <span>{trade.exitPrice || '-'}</span>
                    </div>
                  </td>

                  {/* Size */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-gray-800 font-semibold">
                    {trade.lotSize} <span className="text-gray-400 text-[10px]">lots</span>
                  </td>

                  {/* Net P&L */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-extrabold ${
                      isWin 
                        ? 'text-emerald-600' 
                        : isLoss 
                        ? 'text-rose-600' 
                        : 'text-gray-700'
                    }`}>
                      {trade.netPnl >= 0 ? '+' : ''}${trade.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Comm: ${trade.commission || 0}
                    </div>
                  </td>

                  {/* R:R */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                      trade.rrRealized > 0 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : trade.rrRealized < 0 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {trade.rrRealized > 0 ? `+${trade.rrRealized}R` : `${trade.rrRealized}R`}
                    </span>
                  </td>

                  {/* Setup Model & Confluences */}
                  <td className="py-3.5 px-3 max-w-[220px]">
                    <div className="text-[#2563EB] font-sans font-semibold text-xs truncate" title={trade.setupModel}>
                      {trade.setupModel || 'Custom Setup'}
                    </div>
                    {trade.confluences && trade.confluences.length > 0 && (
                      <div className="flex gap-1 overflow-hidden mt-0.5">
                        {trade.confluences.slice(0, 2).map(c => (
                          <span key={c} className="text-[9.5px] bg-gray-100 text-gray-600 px-1 py-0.2 rounded border border-gray-200 truncate">
                            {c}
                          </span>
                        ))}
                        {trade.confluences.length > 2 && (
                          <span className="text-[9.5px] text-gray-400">+{trade.confluences.length - 2}</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Chart Snapshot preview icon */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {trade.chartUrl ? (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrade(trade);
                        }}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-all shadow-2xs"
                        title="View Chart Screenshot"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[10px]">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectTrade(trade)}
                        className="p-1.5 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Inspect Trade"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditTrade(trade)}
                        className="p-1.5 text-gray-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Trade"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTrade(trade.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
