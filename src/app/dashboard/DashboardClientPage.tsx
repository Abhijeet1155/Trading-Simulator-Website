'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  BookOpen, 
  RotateCcw, 
  Calculator, 
  Share2, 
  Settings, 
  Sun, 
  Moon, 
  Sparkles, 
  ArrowUpRight, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Clock, 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';

interface DashboardClientProps {
  userName: string;
  userEmail: string;
  planType: string;
  balance: number;
  initialBalance: number;
  totalClosedPnL: number;
  openPositionsCount: number;
  recentTrades: any[];
}

// Pre-seeded high-fidelity balance historical data for 7D / 30D / 90D / 1Y
const BALANCE_SERIES_DATA: Record<string, Array<{ date: string; balance: number; r: number; percent: number }>> = {
  '7D': [
    { date: 'Dec 18', balance: 17200.50, r: 0.8, percent: 1.2 },
    { date: 'Dec 19', balance: 17450.00, r: 1.4, percent: 2.1 },
    { date: 'Dec 20', balance: 17320.00, r: 1.1, percent: 1.7 },
    { date: 'Dec 21', balance: 17800.25, r: 2.3, percent: 3.8 },
    { date: 'Dec 22', balance: 17950.00, r: 2.6, percent: 4.4 },
    { date: 'Dec 23', balance: 18200.00, r: 3.1, percent: 5.2 },
    { date: 'Dec 24', balance: 18427.59, r: 3.5, percent: 6.1 },
  ],
  '30D': [
    { date: 'Dec 1', balance: 15142.19, r: 0.0, percent: 0.0 },
    { date: 'Dec 5', balance: 15680.00, r: 1.2, percent: 3.5 },
    { date: 'Dec 10', balance: 16250.40, r: 2.1, percent: 7.3 },
    { date: 'Dec 15', balance: 16980.00, r: 2.8, percent: 12.1 },
    { date: 'Dec 20', balance: 17450.80, r: 3.2, percent: 15.2 },
    { date: 'Dec 25', balance: 18427.59, r: 4.2, percent: 21.6 },
  ],
  '90D': [
    { date: 'Oct 1', balance: 12500.00, r: -0.5, percent: -2.0 },
    { date: 'Oct 20', balance: 13800.00, r: 1.0, percent: 6.5 },
    { date: 'Nov 10', balance: 14600.00, r: 1.9, percent: 12.8 },
    { date: 'Nov 30', balance: 15900.00, r: 2.7, percent: 18.2 },
    { date: 'Dec 15', balance: 17200.00, r: 3.5, percent: 24.5 },
    { date: 'Dec 25', balance: 18427.59, r: 4.2, percent: 31.4 },
  ],
  '1Y': [
    { date: 'Jan', balance: 10000.00, r: 0.0, percent: 0.0 },
    { date: 'Mar', balance: 11200.00, r: 1.1, percent: 12.0 },
    { date: 'May', balance: 12800.00, r: 2.3, percent: 28.0 },
    { date: 'Jul', balance: 14100.00, r: 3.0, percent: 41.0 },
    { date: 'Sep', balance: 15600.00, r: 3.8, percent: 56.0 },
    { date: 'Nov', balance: 17200.00, r: 4.5, percent: 72.0 },
    { date: 'Dec', balance: 18427.59, r: 5.2, percent: 84.2 },
  ],
  'All': [
    { date: '2023', balance: 10000.00, r: 0.0, percent: 0.0 },
    { date: 'Q2 24', balance: 13200.00, r: 2.5, percent: 32.0 },
    { date: 'Q4 24', balance: 15900.00, r: 3.8, percent: 59.0 },
    { date: 'Now', balance: 18427.59, r: 5.2, percent: 84.2 },
  ]
};

// Fallback high-fidelity sample recent trades
const SAMPLE_RECENT_TRADES = [
  {
    id: 't-1',
    pair: 'EUR/USD',
    flag: '🇪🇺',
    direction: 'BUY',
    pnl: 215.00,
    outcome: 'Win',
    time: 'Today, 9:42 AM'
  },
  {
    id: 't-2',
    pair: 'GBP/JPY',
    flag: '🇬🇧',
    direction: 'SELL',
    pnl: -120.00,
    outcome: 'Loss',
    time: 'Today, 8:15 AM'
  },
  {
    id: 't-3',
    pair: 'XAU/USD',
    flag: '🥇',
    direction: 'BUY',
    pnl: 4.50,
    outcome: 'BE',
    time: 'Yesterday, 3:30 PM'
  },
  {
    id: 't-4',
    pair: 'AUD/USD',
    flag: '🇦🇺',
    direction: 'BUY',
    pnl: -82.00,
    outcome: 'Loss',
    time: 'Yesterday, 11:20 AM'
  },
  {
    id: 't-5',
    pair: 'USD/CAD',
    flag: '🇺🇸',
    direction: 'SELL',
    pnl: 340.00,
    outcome: 'Win',
    time: 'Dec 22, 2:10 PM'
  }
];

export default function DashboardClientPage({
  userName,
  balance = 18427.59,
  totalClosedPnL = 3285.40,
  recentTrades = []
}: DashboardClientProps) {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Global Timeframe selector: Day, Week, 1M, 30D
  const [globalTimeframe, setGlobalTimeframe] = useState<'Day' | 'Week' | '1M' | '30D'>('30D');

  // Chart range selector: 7D, 30D, 90D, 1Y, All
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '90D' | '1Y' | 'All'>('30D');
  // Chart unit toggle: $, R, %
  const [chartUnit, setChartUnit] = useState<'$' | 'R' | '%'>('$');

  // Dismiss behavioral banner
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // Active trades data merged with real trades if available
  const displayTrades = useMemo(() => {
    if (recentTrades && recentTrades.length > 0) {
      return recentTrades.map((t, idx) => {
        const isWin = (t.pnl || 0) > 10;
        const isBE = Math.abs(t.pnl || 0) <= 10;
        const symbol = t.symbol || 'EUR/USD';
        let flag = '🌐';
        if (symbol.includes('EUR')) flag = '🇪🇺';
        else if (symbol.includes('GBP')) flag = '🇬🇧';
        else if (symbol.includes('XAU') || symbol.includes('GOLD')) flag = '🥇';
        else if (symbol.includes('BTC')) flag = '₿';
        else if (symbol.includes('AUD')) flag = '🇦🇺';
        else if (symbol.includes('USD') || symbol.includes('NAS')) flag = '🇺🇸';

        const createdDate = t.created_at ? new Date(t.created_at) : new Date();
        const timeStr = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          id: t.id || `trade-${idx}`,
          pair: symbol,
          flag,
          direction: t.type === 'buy' || t.direction === 'BUY' ? 'BUY' : 'SELL',
          pnl: parseFloat(t.pnl || 0),
          outcome: isWin ? 'Win' : (isBE ? 'BE' : 'Loss'),
          time: `Today, ${timeStr}`
        };
      });
    }
    return SAMPLE_RECENT_TRADES;
  }, [recentTrades]);

  // Chart data based on selected range and unit
  const activeChartData = useMemo(() => {
    const raw = BALANCE_SERIES_DATA[chartRange] || BALANCE_SERIES_DATA['30D'];
    return raw.map(item => ({
      ...item,
      displayVal: chartUnit === '$' 
        ? item.balance 
        : chartUnit === 'R' 
        ? item.r 
        : item.percent
    }));
  }, [chartRange, chartUnit]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const formattedVal = chartUnit === '$' 
        ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
        : chartUnit === 'R' 
        ? `${val >= 0 ? '+' : ''}${val.toFixed(2)}R` 
        : `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

      return (
        <div className="bg-[#1E1B4B] dark:bg-[#0F172A] text-white px-3 py-2 rounded-xl shadow-xl border border-indigo-500/20 text-xs font-mono select-none pointer-events-none">
          <div className="text-gray-300 text-[10px] font-sans font-medium">{label}</div>
          <div className="font-bold text-sm text-emerald-400 mt-0.5">{formattedVal}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#0B0E14] text-gray-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar userName={userName} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex w-full overflow-x-hidden">
        
        {/* 1. SLIM ICON NAVIGATION SIDEBAR (w-16 / 64px) */}
        <aside className="w-16 bg-white dark:bg-[#121620] border-r border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between items-center py-4 shrink-0 select-none z-20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-colors">
          
          {/* Top Logo & Primary Nav Icons */}
          <div className="w-full flex flex-col items-center gap-4">
            
            {/* Geometric Glyph Logo */}
            <Link 
              href="/dashboard" 
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 hover:scale-105 transition-transform"
              title="Trading Simulator Home"
            >
              <div className="w-4 h-4 border-2 border-white rounded-md rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-xs" />
              </div>
            </Link>

            {/* Navigation Icons Stack */}
            <div className="space-y-1.5 w-full flex flex-col items-center">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', active: true },
                { id: 'analytics', label: 'Analytics / Performance', icon: TrendingUp, href: '/analytics' },
                { id: 'rules', label: 'Risk Rules & Shield', icon: ShieldCheck, href: '/accounts' },
                { id: 'journal', label: 'Journal & Calendar', icon: Calendar, href: '/journal' },
                { id: 'reports', label: 'Notebook & Reports', icon: BookOpen, href: '/journal' },
                { id: 'replay', label: 'Bar Replay Workstation', icon: RotateCcw, href: '/replay' },
                { id: 'tools', label: 'Trade Terminal & Tools', icon: Calculator, href: '/trade' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = item.active;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-[#EDE9FE] dark:bg-indigo-950/60 text-[#6366F1] dark:text-indigo-400 font-bold shadow-xs'
                        : 'text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#6366F1] rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom Sidebar Controls */}
          <div className="w-full flex flex-col items-center gap-3">
            
            {/* Affiliate / Referral Icon */}
            <Link
              href="/affiliate"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 dark:text-neutral-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
              title="Referrals & Rewards"
            >
              <Share2 className="w-4 h-4" />
            </Link>

            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 dark:text-neutral-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings Icon */}
            <Link
              href="/settings"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              title="Account Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Circular User Avatar */}
            <div 
              onClick={() => router.push('/settings')}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all capitalize"
              title={userName}
            >
              {userName ? userName.slice(0, 2) : 'US'}
            </div>

          </div>

        </aside>

        {/* 2. MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1550px] mx-auto w-full overflow-y-auto min-h-0 space-y-5">
          
          {/* HEADER BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 select-none">
            <div>
              <h1 className="text-2xl sm:text-[26px] font-bold text-[#111827] dark:text-white">
                Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-neutral-400 mt-0.5">
                Your trading performance at a glance — track your progress, discipline, and daily flow.
              </p>
            </div>

            {/* Segmented Control (Timeframe Pills: Day, Week, 1M, 30D) */}
            <div className="bg-white dark:bg-[#121620] p-1 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex items-center shadow-xs self-start sm:self-auto">
              {(['Day', 'Week', '1M', '30D'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setGlobalTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    globalTimeframe === tf
                      ? 'bg-[#6366F1] text-white shadow-xs font-bold'
                      : 'text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* 3. TOP KPI METRICS BAR (5 CARDS) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            
            {/* Card 1: ACCOUNT BALANCE */}
            <div className="bg-white dark:bg-[#121620] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold capitalize text-slate-400 dark:text-neutral-500">
                Account Balance
              </span>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold font-mono text-[#111827] dark:text-white">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Active Wallet (USD)</span>
                </div>
              </div>
            </div>

            {/* Card 2: TOTAL CLOSED PNL */}
            <div className="bg-white dark:bg-[#121620] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold capitalize text-slate-400 dark:text-neutral-500">
                  Total Closed Pnl
                </span>
                <Filter className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold font-mono text-[#10B981] dark:text-emerald-400">
                  {totalClosedPnL >= 0 ? '+' : ''}${totalClosedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+21.4% total return</span>
                </div>
              </div>
            </div>

            {/* Card 3: WIN RATE */}
            <div className="bg-white dark:bg-[#121620] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold capitalize text-slate-400 dark:text-neutral-500">
                Win Rate
              </span>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold font-mono text-[#111827] dark:text-white flex items-center justify-between">
                  <span>48.21%</span>
                  <span className="bg-emerald-50 dark:bg-emerald-950/50 text-[#10B981] text-xs font-semibold px-2 py-0.5 rounded-full flex items-center">
                    ↗ 5.4%
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1 font-medium">
                  28 Wins / 30 Losses
                </div>
              </div>
            </div>

            {/* Card 4: AVG R PER TRADE */}
            <div className="bg-white dark:bg-[#121620] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold capitalize text-slate-400 dark:text-neutral-500">
                Avg R Per Trade
              </span>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-bold font-mono text-[#111827] dark:text-white">
                  +0.42R <span className="text-emerald-500 text-sm">↗</span>
                </div>
                {/* Mini horizontal stacked bar */}
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-neutral-800 rounded-full flex overflow-hidden">
                    <div className="bg-[#10B981] h-full" style={{ width: '55%' }} />
                    <div className="bg-[#EF4444] h-full" style={{ width: '45%' }} />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono font-bold">
                    <span className="text-[#10B981]">+2.32R</span>
                    <span className="text-[#EF4444]">-1.90R</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: PROFIT FACTOR */}
            <div className="bg-white dark:bg-[#121620] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold capitalize text-slate-400 dark:text-neutral-500">
                Profit Factor
              </span>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#111827] dark:text-white">
                    1.60
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                    Profitable Edge
                  </div>
                </div>
                {/* Donut Gauge Indicator */}
                <div className="relative w-11 h-11 flex items-center justify-center">
                  <svg className="w-11 h-11 rotate-[-90deg]" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-neutral-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#10B981]"
                      strokeDasharray="62, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-mono font-bold text-slate-700 dark:text-neutral-300">
                    1.6
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* 4. AI BEHAVIORAL INSIGHT / NOTIFICATION BANNER */}
          {isBannerVisible && (
            <div className="bg-[#FAF5FF] dark:bg-purple-950/25 border border-purple-200/90 dark:border-purple-800/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <p className="text-xs sm:text-sm text-purple-950 dark:text-purple-200">
                  <span className="font-bold text-purple-700 dark:text-purple-300 mr-1">Behavior Pattern Detected:</span>
                  Your losing trades lasted 2.7x longer than your winning trades last week.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/analytics')}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsBannerVisible(false)}
                  className="text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 p-1 text-sm font-bold cursor-pointer"
                  title="Dismiss alert"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 5 & 6. MAIN 2-COLUMN SECTION (65% / 35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT COLUMN (65% -> 8 of 12 columns) */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* A. ACCOUNT BALANCE AREA CHART CARD */}
              <div className="bg-white dark:bg-[#121620] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                
                {/* Header & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#111827] dark:text-white">
                      Account Balance
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-neutral-500">
                      Equity trajectory and cumulative growth over time
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Range Selector Pills: 7D, 30D, 90D, 1Y, All */}
                    <div className="bg-slate-50 dark:bg-[#161D2A] p-0.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex items-center">
                      {(['7D', '30D', '90D', '1Y', 'All'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setChartRange(r)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            chartRange === r
                              ? 'bg-white dark:bg-[#1E293B] text-[#6366F1] dark:text-indigo-400 shadow-xs font-bold'
                              : 'text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    {/* Unit Toggle: $, R, % */}
                    <div className="bg-slate-50 dark:bg-[#161D2A] p-0.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] flex items-center">
                      {(['$', 'R', '%'] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setChartUnit(u)}
                          className={`w-7 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                            chartUnit === u
                              ? 'bg-[#6366F1] text-white shadow-xs'
                              : 'text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Smooth Area Chart */}
                <div className="h-[270px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        stroke={isDark ? '#475569' : '#94A3B8'} 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke={isDark ? '#475569' : '#94A3B8'} 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => chartUnit === '$' ? `$${(val/1000).toFixed(0)}k` : chartUnit === 'R' ? `${val}R` : `${val}%`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="displayVal" 
                        stroke="#6366F1" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#balanceGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

              </div>

              {/* B. RECENT TRADES TABLE CARD */}
              <div className="bg-white dark:bg-[#121620] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#111827] dark:text-white">
                    Recent Trades
                  </h2>
                  <Link 
                    href="/journal" 
                    className="text-xs font-bold text-[#6366F1] dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 group transition-colors"
                  >
                    <span>All Trades</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-sans min-w-[520px]">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/[0.06] text-slate-400 dark:text-neutral-500 font-bold capitalize text-[10px]">
                        <th className="py-2.5 px-3">Instrument</th>
                        <th className="py-2.5 px-3">Direction</th>
                        <th className="py-2.5 px-3">PnL</th>
                        <th className="py-2.5 px-3">Outcome</th>
                        <th className="py-2.5 px-3 text-right">Closed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {displayTrades.map((t) => {
                        const isWin = t.outcome === 'Win';
                        const isLoss = t.outcome === 'Loss';
                        return (
                          <tr 
                            key={t.id} 
                            className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            {/* Instrument */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{t.flag}</span>
                                <span className="font-bold font-mono text-slate-900 dark:text-neutral-100">
                                  {t.pair}
                                </span>
                              </div>
                            </td>

                            {/* Direction */}
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center gap-0.5 font-bold font-mono text-xs ${
                                t.direction === 'BUY' 
                                  ? 'text-[#10B981]' 
                                  : 'text-[#EF4444]'
                              }`}>
                                {t.direction === 'BUY' ? '↑ Buy' : '↓ Sell'}
                              </span>
                            </td>

                            {/* PnL */}
                            <td className="py-3 px-3">
                              <span className={`font-mono font-bold text-xs ${
                                isWin 
                                  ? 'text-[#10B981]' 
                                  : isLoss 
                                  ? 'text-[#EF4444]' 
                                  : 'text-slate-500 dark:text-neutral-400'
                              }`}>
                                {t.pnl >= 0 ? '+' : ''}${Math.abs(t.pnl).toFixed(2)}
                              </span>
                            </td>

                            {/* Outcome Badge */}
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isWin
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                  : isLoss
                                  ? 'bg-rose-50 dark:bg-rose-950/50 text-[#E11D48] dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400'
                              }`}>
                                {t.outcome}
                              </span>
                            </td>

                            {/* Closed At */}
                            <td className="py-3 px-3 text-right font-mono text-slate-400 dark:text-neutral-500 text-[11px]">
                              {t.time}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN (35% -> 4 of 12 columns) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* A. EDGE SCORE CARD */}
              <div className="bg-white dark:bg-[#121620] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                
                {/* Header with Circular Donut Gauge */}
                <div className="flex items-start justify-between pb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-lg font-bold text-[#111827] dark:text-white">
                        Edge Score
                      </h2>
                      <span title="Calculated based on performance, discipline rules, and setup consistency.">
                        <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5">
                      Score will be accurate at 100 trades: <span className="font-semibold text-[#6366F1]">58/100</span>
                    </p>
                  </div>

                  {/* Circular Donut Gauge: 64 / 100 */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-14 h-14 rotate-[-90deg]" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100 dark:text-neutral-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#6366F1]"
                        strokeDasharray="64, 100"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center flex flex-col items-center">
                      <span className="text-sm font-bold font-mono text-[#111827] dark:text-white leading-none">64</span>
                      <span className="text-[8px] text-slate-400 leading-none">/100</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar Breakdown */}
                <div className="space-y-3.5 mt-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                  
                  {/* Performance */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      <span className="flex items-center gap-1">
                        <span>Performance</span>
                        <Info className="w-3 h-3 text-slate-400" />
                      </span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">28/40</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>

                  {/* Discipline */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      <span className="flex items-center gap-1">
                        <span>Discipline</span>
                        <Info className="w-3 h-3 text-slate-400" />
                      </span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">32/40</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: '80%' }} />
                    </div>

                    {/* Sub-metrics list */}
                    <div className="bg-slate-50/80 dark:bg-white/[0.02] p-2.5 rounded-xl space-y-1.5 text-[11px] mt-1.5 border border-slate-100 dark:border-white/[0.04]">
                      <div className="flex justify-between items-center text-slate-600 dark:text-neutral-400">
                        <span>Max Daily Loss Violations:</span>
                        <span className="font-mono font-bold text-emerald-600">0 / 2</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-neutral-400">
                        <span>Profit Target Violations:</span>
                        <span className="font-mono font-bold text-amber-500">1 / 2</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600 dark:text-neutral-400">
                        <span>Not exceeding max trades:</span>
                        <span className="font-mono font-bold text-emerald-600 flex items-center gap-0.5">✓ Passed</span>
                      </div>
                    </div>
                  </div>

                  {/* Consistency */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      <span className="flex items-center gap-1">
                        <span>Consistency</span>
                        <Info className="w-3 h-3 text-slate-400" />
                      </span>
                      <span className="font-mono text-pink-600 dark:text-pink-400 font-bold">8/20</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>

                </div>

              </div>

              {/* B. TODAY'S DISCIPLINE SUMMARY CARD */}
              <div className="bg-white dark:bg-[#121620] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
                
                <div>
                  <h2 className="text-lg font-bold text-[#111827] dark:text-white">
                    Today&apos;s Discipline Summary
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-neutral-500">
                    Live session boundary tracking and rule adherence
                  </p>
                </div>

                {/* Visual Metric 1: Trades Today */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-100 dark:border-white/[0.04]">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-600 dark:text-neutral-400">Trades Today:</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">7 / 5 Max</span>
                  </div>
                  {/* Status dots: 5 green, 2 red */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={`green-${i}`} className="w-3.5 h-3.5 rounded-full bg-[#10B981] shadow-xs" title={`Trade ${i}: Allowed`} />
                    ))}
                    {[1, 2].map((i) => (
                      <div key={`red-${i}`} className="w-3.5 h-3.5 rounded-full bg-[#EF4444] animate-pulse" title={`Trade ${5 + i}: Over Limit`} />
                    ))}
                  </div>
                </div>

                {/* Visual Metric 2: Today's Net PnL Slider Bar */}
                <div className="space-y-1.5 bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-100 dark:border-white/[0.04]">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-600 dark:text-neutral-400">Today&apos;s Net PnL:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+$185.00</span>
                  </div>
                  {/* Range Slider with Center Zero Marker */}
                  <div className="relative pt-2 pb-1">
                    <div className="h-2 w-full bg-slate-200 dark:bg-neutral-800 rounded-full relative overflow-hidden">
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10" />
                      {/* Positive gain bar from center to right */}
                      <div className="absolute left-1/2 h-full bg-[#10B981] rounded-r-full" style={{ width: '18.5%' }} />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
                      <span>-$1,000</span>
                      <span>$0</span>
                      <span>+$1,000</span>
                    </div>
                  </div>
                </div>

                {/* Rule Alerts Stack (3 Colored Cards) */}
                <div className="space-y-2 pt-1">
                  
                  {/* Danger Card: Exceeded Max Trades */}
                  <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl p-2.5 flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-200">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Exceeded max trades:</span> 7/5 trades taken today.
                    </div>
                  </div>

                  {/* Warning Card: Out of Hours */}
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl p-2.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Discipline warning:</span> You took trade outside allowed hours.
                    </div>
                  </div>

                  {/* Info Card: Profit Target Reached */}
                  <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 rounded-xl p-2.5 flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Target Reached:</span> You&apos;ve reached your profit target. Stop trading for today.
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
