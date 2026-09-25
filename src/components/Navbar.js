'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TrendingUp, 
  Menu, 
  X, 
  RotateCcw, 
  Layers, 
  LayoutDashboard, 
  Globe, 
  BookOpen, 
  BarChart3,
  PlayCircle
} from 'lucide-react';
import UserDropdown from '@/app/dashboard/UserDropdown';
import ThemeToggle from '@/components/ThemeToggle';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function Navbar({ userName }) {
  const pathname = usePathname();

  // Menu states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close mobile menu on outside click or ESC key
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 1. TOP NAVIGATION: Dashboard | Trade | Replay | Accounts | History | Journal | Analytics | News
  const primaryNavLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Trade', href: '/trade', icon: TrendingUp },
    { label: 'Replay', href: '/replay', icon: PlayCircle },
    { label: 'Accounts', href: '/accounts', icon: Layers },
    { label: 'History', href: '/history', icon: RotateCcw },
    { label: 'Journal', href: '/journal', icon: BookOpen },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'News', href: '/news', icon: Globe },
  ];

  return (
    <>
      <header className="border-b border-[#E0E3EB] dark:border-[#262626] bg-white dark:bg-[#141414] sticky top-0 z-50 h-12 flex items-center shrink-0 select-none transition-colors duration-200">
        <div className="w-full px-4 flex items-center justify-between">
          
          {/* Left Brand + Left-Aligned Primary Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-sm">
                <TrendingUp className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-base text-[#111111] dark:text-white">PaperPulse</span>
            </Link>
            
            <div className="h-5 w-[1px] bg-gray-200 dark:bg-neutral-800 hidden md:block" />

            {/* Desktop Primary Navigation */}
            <nav className="hidden md:flex items-center gap-1" suppressHydrationWarning>
              {primaryNavLinks.map((link) => {
                const currentPath = pathname || '';
                const isActive = 
                  currentPath === link.href || 
                  (link.href !== '/' && link.href !== '/dashboard' && currentPath.startsWith(link.href)) ||
                  (link.href === '/dashboard' && (currentPath === '/' || currentPath === '/dashboard')) ||
                  (link.href === '/accounts' && currentPath === '/account-setup');

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    suppressHydrationWarning
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all capitalize ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 font-bold shadow-2xs' 
                        : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar: [Theme Quick Toggle] + [Profile Dropdown] + [Mobile Menu Toggle] */}
          <div className="flex items-center gap-2">
            {/* Quick Theme Toggle Button */}
            <ThemeToggle variant="compact" className="hidden sm:flex" />

            {/* User Profile dropdown: Settings, Theme Switch, Log Out */}
            <UserDropdown userName={userName} />

            {/* Mobile Menu Toggle */}
            <div className="relative md:hidden" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-1.5 rounded-md border transition-all cursor-pointer select-none flex items-center justify-center ${
                  isMenuOpen
                    ? 'bg-[#2563EB]/10 border-[#2563EB]/30 text-[#2563EB]'
                    : 'bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Navigation Menu"
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              {/* Mobile Dropdown Panel */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-[0_12px_30px_-5px_rgba(0,0,0,0.12),0_8px_10px_-6px_rgba(0,0,0,0.08)] p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 select-none">
                  <div className="space-y-0.5">
                    <div className="px-3 py-1 text-[10px] font-bold text-gray-400 dark:text-neutral-500 capitalize">
                      Navigation
                    </div>
                    {primaryNavLinks.map((link) => {
                      const Icon = link.icon;
                      const currentPath = pathname || '';
                      const isActive = 
                        currentPath === link.href || 
                        (link.href !== '/' && link.href !== '/dashboard' && currentPath.startsWith(link.href)) ||
                        (link.href === '/dashboard' && (currentPath === '/' || currentPath === '/dashboard')) ||
                        (link.href === '/accounts' && currentPath === '/account-setup');

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          suppressHydrationWarning
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-bold'
                              : 'text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-neutral-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB] dark:text-blue-400' : 'text-gray-400 dark:text-neutral-500'}`} />
                            <span>{link.label}</span>
                          </div>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                        </Link>
                      );
                    })}

                    <div className="pt-2 mt-2 border-t border-gray-100 dark:border-neutral-800">
                      <div className="px-3 py-1 text-[10px] font-bold text-gray-400 dark:text-neutral-500 capitalize">
                        Appearance
                      </div>
                      <ThemeToggle variant="menu-item" />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>
      <MobileBottomNav />
    </>
  );
}
