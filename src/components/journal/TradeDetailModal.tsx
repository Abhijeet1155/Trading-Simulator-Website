'use client';

import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Target, 
  Layers, 
  Edit3, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  DollarSign
} from 'lucide-react';
import { Trade } from '../../types/journal';

interface TradeDetailModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

export default function TradeDetailModal({
  trade,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TradeDetailModalProps) {
  const [isChartZoomed, setIsChartZoomed] = useState(false);

  if (!isOpen || !trade) return null;

  const isWin = trade.result === 'WIN' || trade.netPnl > 0;
  const isLoss = trade.result === 'LOSS' || trade.netPnl < 0;
  const isLong = trade.direction === 'LONG';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div 
        className="bg-white border border-gray-200 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:px-6 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold uppercase flex items-center gap-1.5 ${
              isLong 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {isLong ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trade.direction}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-mono font-bold text-gray-900 tracking-tight">
                  {trade.symbol}
                </h1>
                <span className="text-[11px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  {trade.timeframe || '5m'}
                </span>
                <span className="text-[11px] font-mono text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {trade.session.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[10.5px] text-gray-500 font-mono">
                Executed on {new Date(trade.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(trade.entryDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} UTC
              </p>
            </div>
          </div>

          {/* Actions & Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(trade);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-gray-200 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onDelete(trade.id);
                onClose();
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content: Two Columns (Left Chart + Right Execution Review) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* LEFT SIDE: High-Resolution Chart Snapshot (7 cols on lg) */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-gray-50/50 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <ImageIcon className="w-4 h-4 text-[#2563EB]" />
                  Chart Snapshot & Markups
                </span>

                {trade.chartUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChartZoomed(!isChartZoomed)}
                      className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-[#2563EB] bg-white px-2 py-1 rounded-lg border border-gray-200 transition-colors shadow-2xs"
                    >
                      {isChartZoomed ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                      <span>{isChartZoomed ? 'Standard' : 'Zoom'}</span>
                    </button>
                    <a
                      href={trade.chartUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-600 hover:text-[#2563EB] bg-white rounded-lg border border-gray-200 shadow-2xs"
                      title="Open Original"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Chart Image Container */}
              <div className={`relative rounded-2xl overflow-hidden border border-gray-200 bg-white flex items-center justify-center transition-all shadow-2xs ${
                isChartZoomed ? 'min-h-[500px]' : 'min-h-[340px]'
              }`}>
                {trade.chartUrl ? (
                  <img
                    src={trade.chartUrl}
                    alt={`${trade.symbol} trade snapshot`}
                    className={`w-full object-contain ${isChartZoomed ? 'max-h-[700px]' : 'max-h-[440px]'}`}
                  />
                ) : (
                  <div className="text-center p-8 text-gray-400 space-y-2">
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="text-xs text-gray-600">No chart screenshot attached for this trade.</p>
                    <p className="text-[10px] text-gray-400">Click "Edit" to paste a TradingView snapshot link.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Strategy Playbook Summary Pill */}
            <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block">Setup Model</span>
                <span className="text-xs font-bold text-[#2563EB]">{trade.setupModel || 'Custom Setup'}</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= (trade.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Trade Execution Breakdown & Notes (5 cols on lg) */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-white space-y-5 overflow-y-auto">
            
            {/* Outcome Hero Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
              isWin
                ? 'bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-white border-emerald-200'
                : isLoss
                ? 'bg-gradient-to-r from-rose-50/80 via-rose-50/30 to-white border-rose-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div>
                <span className="text-[10.5px] uppercase font-mono font-bold text-gray-500 block">
                  Net Realized P&L
                </span>
                <div className={`text-2xl font-mono font-extrabold ${
                  isWin ? 'text-emerald-600' : isLoss ? 'text-rose-600' : 'text-gray-700'
                }`}>
                  {trade.netPnl >= 0 ? '+' : ''}${trade.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-gray-500 block">Realized R:R</span>
                <span className={`text-lg font-mono font-extrabold ${
                  trade.rrRealized > 0 ? 'text-emerald-600' : 'text-gray-700'
                }`}>
                  {trade.rrRealized > 0 ? `+${trade.rrRealized}R` : `${trade.rrRealized}R`}
                </span>
              </div>
            </div>

            {/* Execution Price Matrix */}
            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200 space-y-3">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block font-mono">
                Execution Matrix
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Entry Price</span>
                  <span className="text-gray-900 font-bold text-sm">{trade.entryPrice}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                  <span className="text-[10px] text-gray-500 uppercase block font-semibold">Exit Price</span>
                  <span className="text-gray-900 font-bold text-sm">{trade.exitPrice || '—'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-rose-200 shadow-2xs">
                  <span className="text-[10px] text-rose-600 uppercase block font-semibold">Stop Loss</span>
                  <span className="text-rose-700 font-bold text-sm">{trade.stopLoss}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] text-emerald-600 uppercase block font-semibold">Take Profit</span>
                  <span className="text-emerald-700 font-bold text-sm">{trade.takeProfit || '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1 text-gray-600">
                <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-2xs">
                  <span className="text-[9.5px] uppercase block text-gray-400">Size</span>
                  <span className="text-gray-900 font-bold">{trade.lotSize} lots</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-2xs">
                  <span className="text-[9.5px] uppercase block text-gray-400">Planned R:R</span>
                  <span className="text-gray-900 font-bold">{trade.rrPlanned || 0}R</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-2xs">
                  <span className="text-[9.5px] uppercase block text-gray-400">Commission</span>
                  <span className="text-gray-900 font-bold">${trade.commission || 0}</span>
                </div>
              </div>
            </div>

            {/* Partials Timeline */}
            {trade.partials && trade.partials.length > 0 && (
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200 space-y-2.5">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block font-mono">
                  Scale Outs & Partials Timeline ({trade.partials.length})
                </span>
                <div className="space-y-1.5 font-mono text-xs">
                  {trade.partials.map((p, i) => (
                    <div key={p.id || i} className="bg-white p-2.5 rounded-xl border border-gray-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="font-bold text-amber-700">Partial #{i + 1}: {p.percentage}%</span>
                        <span className="text-[10.5px] text-gray-500 block font-sans">{p.note || 'Scaled at liquidity target'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-900 font-bold block">{p.exitPrice}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">+${p.pnl}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confluences List */}
            {trade.confluences && trade.confluences.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block font-mono">
                  Confluences & Key Levels
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {trade.confluences.map(c => (
                    <span key={c} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-lg border border-gray-200">
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Psychology & Execution Discipline */}
            {((trade.psychology && trade.psychology.length > 0) || (trade.mistakes && trade.mistakes.length > 0)) && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block font-mono">
                  Execution Discipline & Psychology
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(trade.psychology || []).map(p => (
                    <span key={p} className="bg-emerald-50 text-emerald-800 text-[11px] font-medium px-2 py-0.5 rounded-lg border border-emerald-200">
                      ★ {p}
                    </span>
                  ))}
                  {(trade.mistakes || []).map(m => (
                    <span key={m} className={`text-[11px] font-medium px-2 py-0.5 rounded-lg border ${
                      m.includes('None') 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      ⚠ {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trade Notes */}
            {trade.notes && (
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block font-mono">
                  Analysis & Post-Trade Notes
                </span>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line font-sans">
                  {trade.notes}
                </p>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
