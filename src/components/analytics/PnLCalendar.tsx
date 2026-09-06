'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  BarChart2, 
  Table as TableIcon 
} from 'lucide-react';
import { 
  MOCK_CALENDAR_DAYS, 
  MOCK_MONTHLY_MATRIX 
} from '../../data/mockAnalyticsData';

export default function PnLCalendar() {
  const [selectedMonth, setSelectedMonth] = useState('September 2026');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const totalMonthlyPnl = MOCK_CALENDAR_DAYS
    .filter(d => d.isCurrentMonth)
    .reduce((acc, d) => acc + d.pnl, 0);

  const profitDaysCount = MOCK_CALENDAR_DAYS.filter(d => d.isCurrentMonth && d.pnl > 0).length;
  const lossDaysCount = MOCK_CALENDAR_DAYS.filter(d => d.isCurrentMonth && d.pnl < 0).length;
  const totalTradingDays = profitDaysCount + lossDaysCount;
  const dayWinRate = totalTradingDays > 0 ? ((profitDaysCount / totalTradingDays) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6 mb-6">
      
      {/* SECTION 1: Interactive Monthly Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 font-mono uppercase tracking-wider">
                Interactive P&L Calendar Heatmap
              </h3>
              <p className="text-[11px] text-gray-500">Daily net profitability and volume tracking</p>
            </div>
          </div>

          {/* Month Selector & Summary Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 font-mono text-xs">
              <span className="text-gray-500">Month P&L:</span>
              <strong className="text-emerald-600 font-extrabold text-sm">
                +${totalMonthlyPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
              <span className="text-gray-300">•</span>
              <span className="text-emerald-600 font-bold">{profitDaysCount}W</span>
              <span className="text-gray-300">/</span>
              <span className="text-rose-600 font-bold">{lossDaysCount}L</span>
              <span className="text-gray-500 text-[10.5px]">({dayWinRate}% Win Days)</span>
            </div>

            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-0.5">
              <button
                type="button"
                className="p-1 text-gray-500 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold font-mono text-gray-700">
                {selectedMonth}
              </span>
              <button
                type="button"
                className="p-1 text-gray-500 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Day Header */}
        <div className="grid grid-cols-7 gap-2 my-3 text-center text-[11px] font-mono font-bold text-gray-400 uppercase">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-2">
          {MOCK_CALENDAR_DAYS.map((day, idx) => {
            const isProfit = day.pnl > 0;
            const isLoss = day.pnl < 0;
            const isNoTrade = day.tradeCount === 0;

            return (
              <div
                key={idx}
                className={`min-h-[84px] p-2.5 rounded-xl border transition-all flex flex-col justify-between font-mono relative ${
                  !day.isCurrentMonth
                    ? 'bg-gray-50/40 border-gray-100 opacity-30 text-gray-400'
                    : isNoTrade
                    ? 'bg-gray-50/80 border-gray-200/80 text-gray-400'
                    : isProfit
                    ? 'bg-emerald-50/80 border-emerald-200 hover:border-emerald-400 text-emerald-950 shadow-xs'
                    : 'bg-rose-50/80 border-rose-200 hover:border-rose-400 text-rose-950 shadow-xs'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {day.dayOfMonth}
                  </span>

                  {day.tradeCount > 0 && (
                    <span className="text-[9.5px] text-gray-600 bg-white/90 border border-gray-200 px-1.5 py-0.2 rounded font-medium">
                      {day.tradeCount} trd
                    </span>
                  )}
                </div>

                {/* Day PnL */}
                <div className="my-1">
                  {day.tradeCount > 0 ? (
                    <div>
                      <div className={`text-xs sm:text-sm font-extrabold ${
                        isProfit ? 'text-emerald-700' : isLoss ? 'text-rose-700' : 'text-gray-500'
                      }`}>
                        {day.pnl >= 0 ? '+' : ''}${Math.abs(day.pnl).toLocaleString()}
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5 font-sans">
                        {day.winCount}W - {day.lossCount}L
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 italic">
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
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <TableIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 font-mono uppercase tracking-wider">
                Monthly Returns Matrix (% & USD)
              </h3>
              <p className="text-[11px] text-gray-500">Multi-year seasonality breakdown with cumulative annual returns</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10.5px] font-bold text-gray-500 uppercase">
                <th className="py-2.5 px-3 text-left">Year</th>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                  <th key={m} className="py-2.5 px-2">{m}</th>
                ))}
                <th className="py-2.5 px-3 text-right bg-blue-50/60 text-blue-700 border-l border-gray-200">YTD Return</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_MONTHLY_MATRIX.map((row) => (
                <tr key={row.year} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-3 text-left font-bold text-gray-900 whitespace-nowrap">
                    {row.year}
                  </td>
                  {row.months.map((m, idx) => {
                    const isPositive = m.returnPct > 0;
                    const isNegative = m.returnPct < 0;
                    const isZero = m.returnPct === 0;

                    return (
                      <td key={idx} className="py-3 px-2 whitespace-nowrap">
                        {!isZero ? (
                          <div className={`p-1 rounded-lg ${
                            isPositive 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : isNegative 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : 'text-gray-500'
                          }`}>
                            <div className="font-bold text-[11.5px]">
                              {isPositive ? '+' : ''}{m.returnPct.toFixed(1)}%
                            </div>
                            <div className="text-[9.5px] text-gray-500">
                              ${m.pnl >= 0 ? '+' : ''}${(m.pnl / 1000).toFixed(1)}k
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-3 text-right whitespace-nowrap bg-blue-50/30 border-l border-gray-100 font-bold">
                    <div className="text-emerald-600 text-sm">
                      +{row.totalReturnPct.toFixed(1)}%
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      +${(row.totalPnl / 1000).toFixed(1)}k
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

