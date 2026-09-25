'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  BarChart2, 
  Table as TableIcon,
  X,
  ExternalLink
} from 'lucide-react';
import { CalendarDayData, MonthlyMatrixRow } from '../../types/analytics';
import { Trade } from '../../types/journal';
import { calculateCalendarDays } from '../../utils/analyticsEngine';

interface PnLCalendarProps {
  trades?: Trade[];
  monthlyMatrix?: MonthlyMatrixRow[];
}

export default function PnLCalendar({ trades = [], monthlyMatrix = [] }: PnLCalendarProps) {
  // Current Month State (default to current date)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ date: string; trades: Trade[] } | null>(null);

  const activeYear = currentDate.getFullYear();
  const activeMonthIndex = currentDate.getMonth(); // 0 - 11

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedMonthLabel = `${monthNames[activeMonthIndex]} ${activeYear}`;

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Compute Calendar Days dynamically from real trades
  const calendarDays = useMemo(() => {
    return calculateCalendarDays(trades, activeYear, activeMonthIndex);
  }, [trades, activeYear, activeMonthIndex]);

  const currentMonthDays = calendarDays.filter(d => d.isCurrentMonth);
  const totalMonthlyPnl = currentMonthDays.reduce((acc, d) => acc + d.pnl, 0);
  const profitDaysCount = currentMonthDays.filter(d => d.pnl > 0.001).length;
  const lossDaysCount = currentMonthDays.filter(d => d.pnl < -0.001).length;
  const totalTradingDays = profitDaysCount + lossDaysCount;
  const dayWinRate = totalTradingDays > 0 ? Math.round((profitDaysCount / totalTradingDays) * 100) : 0;

  // Handle Day Click
  const handleDayClick = (dayData: CalendarDayData) => {
    if (dayData.tradeCount === 0) return;
    const matchingTrades = trades.filter(t => {
      const d = new Date(t.exitDate || t.entryDate);
      return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dayData.date;
    });
    setSelectedDayTrades({ date: dayData.date, trades: matchingTrades });
  };

  return (
    <div className="space-y-6 mb-6">
      
      {/* SECTION 1: Interactive Monthly Calendar Grid */}
      <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs transition-colors">
        
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white font-mono capitalize">
                Interactive P&L Calendar Heatmap
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">Real trade daily net profitability (click day to view trades)</p>
            </div>
          </div>

          {/* Month Selector & Summary Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#161D2A] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/[0.08] font-mono text-xs">
              <span className="text-gray-500 dark:text-neutral-400">Month P&L:</span>
              <strong className={`font-extrabold text-sm ${totalMonthlyPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {totalMonthlyPnl >= 0 ? '+' : ''}${totalMonthlyPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
              <span className="text-gray-300 dark:text-neutral-600">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{profitDaysCount}W</span>
              <span className="text-gray-300 dark:text-neutral-600">/</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">{lossDaysCount}L</span>
              <span className="text-gray-500 dark:text-neutral-400 text-[10.5px]">({dayWinRate}% Win Days)</span>
            </div>

            <div className="flex items-center bg-gray-50 dark:bg-[#161D2A] rounded-xl border border-gray-200 dark:border-white/[0.08] p-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold font-mono text-gray-700 dark:text-neutral-200 min-w-[120px] text-center">
                {selectedMonthLabel}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Day Header */}
        <div className="grid grid-cols-7 gap-2 my-3 text-center text-[11px] font-mono font-bold text-gray-400 dark:text-neutral-500 capitalize">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            const isProfit = day.pnl > 0.001;
            const isLoss = day.pnl < -0.001;
            const isNoTrade = day.tradeCount === 0;

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(day)}
                className={`min-h-[84px] p-2.5 rounded-xl border transition-all flex flex-col justify-between font-mono relative ${
                  !day.isCurrentMonth
                    ? 'bg-gray-50/40 dark:bg-[#161D2A]/30 border-gray-100 dark:border-white/[0.03] opacity-30 text-gray-400 dark:text-neutral-600'
                    : isNoTrade
                    ? 'bg-gray-50/80 dark:bg-[#161D2A]/60 border-gray-200/80 dark:border-white/[0.06] text-gray-400 dark:text-neutral-500'
                    : isProfit
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-400 dark:hover:border-emerald-700 text-emerald-950 dark:text-emerald-200 shadow-xs cursor-pointer'
                    : 'bg-rose-50/80 dark:bg-rose-950/25 border-rose-200 dark:border-rose-900/40 hover:border-rose-400 dark:hover:border-rose-700 text-rose-950 dark:text-rose-200 shadow-xs cursor-pointer'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    !day.isCurrentMonth ? 'text-gray-400 dark:text-neutral-600' : 'text-gray-700 dark:text-neutral-200'
                  }`}>
                    {day.dayOfMonth}
                  </span>

                  {day.tradeCount > 0 && (
                    <span className="text-[9.5px] text-gray-600 dark:text-neutral-300 bg-white/90 dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.1] px-1.5 py-0.2 rounded font-medium">
                      {day.tradeCount} trd
                    </span>
                  )}
                </div>

                {/* Day PnL */}
                <div className="my-1">
                  {day.tradeCount > 0 ? (
                    <div>
                      <div className={`text-xs sm:text-sm font-extrabold ${
                        isProfit ? 'text-emerald-700 dark:text-emerald-400' : isLoss ? 'text-rose-700 dark:text-rose-400' : 'text-gray-500 dark:text-neutral-400'
                      }`}>
                        {day.pnl >= 0 ? '+' : ''}${Math.abs(day.pnl).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[9px] text-gray-500 dark:text-neutral-400 mt-0.5 font-sans">
                        {day.winCount}W - {day.lossCount}L
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 dark:text-neutral-600 italic">
                      —
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Monthly PnL Matrix Table across years */}
      <div className="bg-white dark:bg-[#111722] border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TableIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white font-mono capitalize">
                Monthly Returns Matrix (% & USD)
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-neutral-400">Multi-year seasonality breakdown calculated from real trade database logs</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {monthlyMatrix.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 dark:text-neutral-500 font-mono">
              No historical returns matrix available
            </div>
          ) : (
            <table className="w-full text-center border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#161D2A] border-b border-gray-200 dark:border-white/[0.08] text-[10.5px] font-bold text-gray-500 dark:text-neutral-400 capitalize">
                  <th className="py-2.5 px-3 text-left">Year</th>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                    <th key={m} className="py-2.5 px-2">{m}</th>
                  ))}
                  <th className="py-2.5 px-3 text-right bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-l border-gray-200 dark:border-white/[0.08]">Annual Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {monthlyMatrix.map((row) => (
                  <tr key={row.year} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-left font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {row.year}
                    </td>
                    {row.months.map((m, idx) => {
                      const isPositive = m.returnPct > 0.001;
                      const isNegative = m.returnPct < -0.001;
                      const isZero = m.tradeCount === 0;

                      return (
                        <td key={idx} className="py-3 px-2 whitespace-nowrap">
                          {!isZero ? (
                            <div className={`p-1 rounded-lg ${
                              isPositive 
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' 
                                : isNegative 
                                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40' 
                                : 'text-gray-500 dark:text-neutral-400'
                            }`}>
                              <div className="font-bold text-[11.5px]">
                                {isPositive ? '+' : ''}{m.returnPct.toFixed(1)}%
                              </div>
                              <div className="text-[9.5px] text-gray-500 dark:text-neutral-400">
                                ${m.pnl >= 0 ? '+' : ''}${(m.pnl / 1000).toFixed(1)}k
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300 dark:text-neutral-600 text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-right whitespace-nowrap bg-blue-50/30 dark:bg-blue-950/20 border-l border-gray-100 dark:border-white/[0.04] font-bold">
                      <div className={`text-sm ${row.totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {row.totalReturnPct >= 0 ? '+' : ''}{row.totalReturnPct.toFixed(1)}%
                      </div>
                      <div className="text-gray-500 dark:text-neutral-400 text-[10px]">
                        {row.totalPnl >= 0 ? '+' : ''}${(row.totalPnl / 1000).toFixed(1)}k
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Interactive Day Trades Lightbox Modal */}
      {selectedDayTrades && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setSelectedDayTrades(null)}>
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-neutral-800 rounded-2xl w-full max-w-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                  Trades for {selectedDayTrades.date}
                </h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400">
                  {selectedDayTrades.trades.length} trade{selectedDayTrades.trades.length !== 1 ? 's' : ''} executed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayTrades(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {selectedDayTrades.trades.map(t => (
                <div key={t.id} className="p-3 bg-gray-50 dark:bg-[#161D2A] rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                      <span className={`px-2 py-0.5 rounded text-[10px] capitalize ${
                        t.direction === 'LONG' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}>
                        {t.direction}
                      </span>
                      <span>{t.symbol}</span>
                      <span className="text-gray-400 font-normal">({t.lotSize}L)</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-neutral-400 mt-1">
                      Entry: ${t.entryPrice} → Exit: ${t.exitPrice || '-'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-bold ${
                      t.netPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {t.netPnl >= 0 ? '+' : ''}${t.netPnl.toFixed(2)}
                    </div>
                    {t.rrRealized !== undefined && (
                      <div className="text-[10px] text-gray-500 dark:text-neutral-400">
                        {t.rrRealized > 0 ? `+${t.rrRealized}R` : `${t.rrRealized}R`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
