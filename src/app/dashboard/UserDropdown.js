'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Trophy, 
  Gamepad2, 
  DollarSign, 
  HelpCircle 
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function UserDropdown({ userName }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside or pressing ESC
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy, iconColor: 'text-amber-500' },
    { label: 'Competitions', href: '/competitions', icon: Gamepad2, iconColor: 'text-purple-500' },
    { label: 'Pricing & Plans', href: '/pricing', icon: DollarSign, iconColor: 'text-emerald-500' },
    { label: 'Support & Help', href: '/support', icon: HelpCircle, iconColor: 'text-blue-500' },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#F3F4F6] dark:bg-[#202020] hover:bg-[#E5E7EB] dark:hover:bg-[#2A2A2A] rounded-lg text-sm text-[#4B5563] dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white font-semibold transition-all cursor-pointer select-none border border-transparent hover:border-gray-200 dark:hover:border-neutral-700"
      >
        <User className="w-4 h-4 text-[#6B7280] dark:text-neutral-400" />
        <span>{userName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] dark:text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#1C1C1C] border border-[#E5E7EB] dark:border-[#2E2E2E] rounded-2xl shadow-[0_12px_30px_-5px_rgba(0,0,0,0.12),0_8px_10px_-6px_rgba(0,0,0,0.08)] py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 select-none">
          {/* Main Navigation links */}
          <div className="space-y-0.5 px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800/80 transition-all cursor-pointer"
                >
                  <Icon className={`w-4 h-4 ${item.iconColor} shrink-0`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Divider before Appearance Theme Toggle */}
          <hr className="border-gray-100 dark:border-neutral-800 my-1.5 mx-2" />

          {/* Theme Toggle in Dropdown */}
          <div className="px-1">
            <ThemeToggle variant="menu-item" showLabel={true} />
          </div>

          {/* Divider before Settings */}
          <hr className="border-gray-100 dark:border-neutral-800 my-1.5 mx-2" />

          {/* Settings link */}
          <div className="px-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800/80 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-gray-500 dark:text-neutral-400 shrink-0" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Divider before Log Out */}
          <hr className="border-gray-100 dark:border-neutral-800 my-1.5 mx-2" />

          {/* Log Out link */}
          <div className="px-1">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer text-left disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
              <span>{loading ? 'Logging out...' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
