'use client';

import React, { useState } from 'react';
import { 
  SyncedTradeFill 
} from '@/data/mockBrokerData';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Filter, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  BookOpen, 
  Sparkles, 
  Check, 
  Copy, 
  Layers,
  ChevronDown
} from 'lucide-react';

interface SyncHistoryTableProps {
  trades: SyncedTradeFill[];
  onSendToJournal: (trade: SyncedTradeFill) => void;
}

export default function SyncHistoryTable({ trades, onSendToJournal }: SyncHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'win' | 'loss'>('all');
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);

  // Unique symbols for filter
  const symbols = ['all', ...Array.from(new Set(trades.map(t => t.symbol)))];

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.ticket.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (trade.strategyTag && trade.strategyTag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSymbol = selectedSymbol === 'all' || trade.symbol === selectedSymbol;
    const matchesOutcome = outcomeFilter === 'all' || 
                           (outcomeFilter === 'win' && trade.pnl > 0) || 
                           (outcomeFilter === 'loss' && trade.pnl < 0);

    return matchesSearch && matchesSymbol && matchesOutcome;
  });

  const handleCopyTicket = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    setCopiedTicket(ticket);
    setTimeout(() => setCopiedTicket(null), 1500);
  };

  return (
    <div className="bg-[#111726] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
      
      {/* Table Header / Action Bar */}
      <div className="p-5 border-b border-gray-800/80 bg-[#0b0f17]/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Auto-Imported Trade History
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {filteredTrades.length} Fills Synced
            </span>
          </h3>
          <p className="text-[11px] text-gray-400">Closed positions pulled directly from MT5 server bridge</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Ticket, Pair, Strategy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#0b0f17] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Symbol Filter */}
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="px-3 py-1.5 bg-[#0b0f17] border border-gray-800 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
          >
            {symbols.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Symbols' : s}</option>
            ))}
          </select>

          {/* Outcome Filter */}
          <div className="flex items-center bg-[#0b0f17] p-0.5 rounded-xl border border-gray-800 text-xs">
            <button
              type="button"
              onClick={() => setOutcomeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                outcomeFilter === 'all' ? 'bg-gray-800 text-white shadow-xs' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setOutcomeFilter('win')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                outcomeFilter === 'win' ? 'bg-emerald-500/20 text-emerald-400 shadow-xs' : 'text-gray-400 hover:text-emerald-400'
              }`}
            >
              Wins
            </button>
            <button
              type="button"
              onClick={() => setOutcomeFilter('loss')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                outcomeFilter === 'loss' ? 'bg-rose-500/20 text-rose-400 shadow-xs' : 'text-gray-400 hover:text-rose-400'
              }`}
            >
              Losses
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-800/80 bg-[#070a10]/40 text-gray-400 text-[11px] font-semibold">
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-4">Instrument</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4 text-right">Lots</th>
              <th className="py-3 px-4 text-right">Open Price</th>
              <th className="py-3 px-4 text-right">Close Price</th>
              <th className="py-3 px-4">Close Time (UTC)</th>
              <th className="py-3 px-4 text-right">Net Profit</th>
              <th className="py-3 px-4 text-center">Sync Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-mono text-[11px]">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-500 font-sans">
                  No auto-imported trades found matching your filters.
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade) => {
                const isProfit = trade.pnl >= 0;
                const isSent = trade.journalStatus === 'Sent';

                return (
                  <tr key={trade.ticket} className="hover:bg-gray-800/30 transition-colors group">
                    {/* Ticket */}
                    <td className="py-3.5 px-4 font-bold text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <span>{trade.ticket}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyTicket(trade.ticket)}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 transition-opacity cursor-pointer"
                          title="Copy Ticket ID"
                        >
                          {copiedTicket === trade.ticket ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      {trade.strategyTag && (
                        <span className="block text-[9px] font-sans text-gray-500 truncate max-w-[120px]">
                          {trade.strategyTag}
                        </span>
                      )}
                    </td>

                    {/* Instrument */}
                    <td className="py-3.5 px-4 font-bold text-white font-sans">
                      <div className="flex items-center gap-1.5">
                        <span>{trade.symbol}</span>
                        {trade.session && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 font-mono">
                            {trade.session}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        trade.type === 'BUY' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {trade.type === 'BUY' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trade.type}
                      </span>
                    </td>

                    {/* Lots */}
                    <td className="py-3.5 px-4 text-right text-gray-200 font-semibold">
                      {trade.lots.toFixed(2)}
                    </td>

                    {/* Open Price */}
                    <td className="py-3.5 px-4 text-right text-gray-400">
                      {trade.openPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </td>

                    {/* Close Price */}
                    <td className="py-3.5 px-4 text-right text-gray-200">
                      {trade.closePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </td>

                    {/* Close Time */}
                    <td className="py-3.5 px-4 text-gray-400 font-sans text-[10px]">
                      {trade.closeTime}
                    </td>

                    {/* Net Profit */}
                    <td className={`py-3.5 px-4 text-right font-bold text-xs ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? '+' : ''}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="block text-[9px] font-normal text-gray-500">
                        {trade.pips > 0 ? `+${trade.pips}` : trade.pips} pips
                      </span>
                    </td>

                    {/* Sync Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${
                        trade.syncStatus === 'Imported'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {trade.syncStatus}
                      </span>
                    </td>

                    {/* Send to Journal Action */}
                    <td className="py-3.5 px-4 text-right">
                      {isSent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-emerald-400">
                          <Check className="w-3 h-3" />
                          In Journal
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSendToJournal(trade)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 font-sans text-[10px] font-bold transition-all cursor-pointer active:scale-95"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Journal</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="p-4 border-t border-gray-800 bg-[#070a10]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Real-time webhook sync updates automatically whenever a trade closes on MT5.</span>
        </div>
        <div className="font-mono text-[11px] text-gray-400">
          Showing {filteredTrades.length} of {trades.length} records
        </div>
      </div>

    </div>
  );
}
