'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  RotateCcw, 
  BookOpen, 
  MoreHorizontal, 
  Layers, 
  BarChart3, 
  PlayCircle, 
  Trophy, 
  Globe, 
  Settings, 
  X,
  Sparkles
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function MobileBottomNav() {
  const pathname = usePathname() || '';
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const sheetRef = useRef(null);

  // Close sheet on outside click or ESC
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsMoreOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hide on auth pages or landing page
  const isAuthOrLanding = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/forgot-password' || 
    pathname === '/reset-password' ||
    pathname.startsWith('/admin/login');

  if (isAuthOrLanding) return null;

  const isTradePage = pathname.startsWith('/trade');

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Trade', href: '/trade', icon: TrendingUp },
    { label: 'History', href: '/history', icon: RotateCcw },
    { label: 'Journal', href: '/journal', icon: BookOpen },
  ];

  const moreItems = [
    { label: 'Replay Simulator', href: '/replay', icon: PlayCircle, desc: 'Practice with historical market data' },
    { label: 'Trading Accounts', href: '/accounts', icon: Layers, desc: 'Manage virtual balances & accounts' },
    { label: 'Performance Analytics', href: '/analytics', icon: BarChart3, desc: 'Detailed win rate & profit metrics' },
    { label: 'Competitions', href: '/competitions', icon: Trophy, desc: 'Compete in live trading tournaments' },
    { label: 'Global Leaderboard', href: '/leaderboard', icon: Sparkles, desc: 'Check rankings of top traders' },
    { label: 'Market News', href: '/news', icon: Globe, desc: 'Real-time financial news & events' },
    { label: 'Settings', href: '/settings', icon: Settings, desc: 'Account & platform preferences' },
  ];

  return (
    <>
      {/* Native Bottom Sheet for "More" Menu */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMoreOpen(false)}
          />

          {/* Bottom Sheet Drawer */}
          <div 
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-[#161D2A] border-t border-gray-200 dark:border-white/[0.08] rounded-t-3xl shadow-2xl p-5 z-[101] overflow-y-auto animate-in slide-in-from-bottom duration-250 pb-safe"
          >
            {/* Grab handle bar */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-neutral-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">More Features</h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of extra tools */}
            <div className="grid grid-cols-1 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-[#2563EB]/40 text-[#2563EB] dark:text-blue-400'
                        : 'bg-gray-50/70 dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.06] hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#2563EB] text-white' : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-neutral-300 border border-gray-200/60 dark:border-white/[0.08]'
                      }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[10px] text-gray-400 dark:text-neutral-500 font-medium">{item.desc}</div>
                      </div>
                    </div>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                  </Link>
                );
              })}
            </div>

            {/* Theme & Extras */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.08] flex items-center justify-between px-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400">Theme Mode</span>
              <ThemeToggle variant="compact" />
            </div>
          </div>
        </div>
      )}

      {/* Main Native Bottom Tab Bar (fixed at bottom on mobile) */}
      {!isTradePage && (
        <nav 
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111722]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-white/[0.08] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none pb-safe"
        >
          <div className="grid grid-cols-5 items-center h-14 px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = 
                pathname === item.href || 
                (item.href !== '/' && item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
                (item.href === '/dashboard' && (pathname === '/' || pathname === '/dashboard'));
              
              const isTrade = item.href === '/trade';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center h-full py-1 transition-all relative ${
                    isActive
                      ? 'text-[#2563EB] dark:text-blue-400 font-bold'
                      : 'text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'
                  }`}
                >
                  {isTrade ? (
                    <div className="flex flex-col items-center -mt-2.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${
                        isActive
                          ? 'bg-[#2563EB] text-white ring-4 ring-blue-100 dark:ring-blue-950/50'
                          : 'bg-[#2563EB] text-white hover:bg-blue-700'
                      }`}>
                        <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-bold mt-0.5 tracking-tight text-[#2563EB] dark:text-blue-400">Trade</span>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                        {isActive && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#2563EB] dark:bg-blue-400 rounded-full" />
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold mt-1 tracking-tight ${isActive ? 'font-bold' : ''}`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </Link>
              );
            })}

            {/* More Tab */}
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              className={`flex flex-col items-center justify-center h-full py-1 transition-all ${
                isMoreOpen
                  ? 'text-[#2563EB] dark:text-blue-400 font-bold'
                  : 'text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200'
              }`}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-1 tracking-tight">More</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
