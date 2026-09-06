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
      <header className="border-b border-[#E0E3EB] bg-white sticky top-0 z-50 h-12 flex items-center shrink-0 select-none">
        <div className="w-full px-4 flex items-center justify-between">
          
          {/* Left Brand + Left-Aligned Primary Navigation Links (Dashboard | Trade | Accounts | History) */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-sm">
                <TrendingUp className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-base text-[#111111] tracking-tight">PaperPulse</span>
            </Link>
            
            <div className="h-5 w-[1px] bg-gray-200 hidden md:block" />

            {/* Desktop Primary Navigation: Dashboard | Trade | Accounts | History */}
            <nav className="hidden md:flex items-center gap-1.5">
              {primaryNavLinks.map((link) => {
                const isActive = pathname === link.href || (link.href === '/dashboard' && pathname === '/') || (link.href === '/accounts' && pathname === '/account-setup');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all capitalize ${
                      isActive 
                        ? 'bg-blue-50 text-[#2563EB] font-bold shadow-2xs' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar: [Profile Dropdown] + [Mobile Menu Toggle] */}
          <div className="flex items-center gap-2">
            {/* User Profile dropdown: Settings, Log Out */}
            <UserDropdown userName={userName} />

            {/* Mobile Menu Toggle (Only visible on small screens to navigate primary tabs) */}
            <div className="relative md:hidden" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-1.5 rounded-md border transition-all cursor-pointer select-none flex items-center justify-center ${
                  isMenuOpen
                    ? 'bg-[#2563EB]/10 border-[#2563EB]/30 text-[#2563EB]'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-900'
                }`}
                title="Navigation Menu"
                aria-label="Toggle navigation menu"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              {/* Mobile Dropdown Panel */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-[0_12px_30px_-5px_rgba(0,0,0,0.12),0_8px_10px_-6px_rgba(0,0,0,0.08)] p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 select-none">
                  <div className="space-y-0.5">
                    <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Navigation
                    </div>
                    {primaryNavLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href || (link.href === '/dashboard' && pathname === '/') || (link.href === '/accounts' && pathname === '/account-setup');
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-blue-50 text-[#2563EB] font-bold'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-gray-400'}`} />
                            <span>{link.label}</span>
                          </div>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

    </>
  );
}
