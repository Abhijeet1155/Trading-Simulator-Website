'use client';

import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle({ 
  variant = 'compact', // 'compact' | 'switch' | 'segmented' | 'menu-item'
  className = '',
  showLabel = false,
  onToggle
}) {
  const { theme, resolvedTheme, setTheme, toggleTheme, mounted } = useTheme();

  // Handler wrapper
  const handleToggle = (e) => {
    if (e) e.stopPropagation();
    toggleTheme();
    if (onToggle) onToggle();
  };

  const isDark = mounted ? resolvedTheme === 'dark' : false;

  // 1. Menu-item variant (for UserDropdown and navigation drawers)
  if (variant === 'menu-item') {
    return (
      <div 
        onClick={handleToggle}
        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer select-none transition-colors ${
          isDark 
            ? 'text-gray-200 hover:text-white hover:bg-neutral-800' 
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
        } ${className}`}
        role="button"
        tabIndex={0}
        aria-label="Toggle theme"
      >
        <div className="flex items-center gap-2.5">
          {isDark ? (
            <Moon className="w-4 h-4 text-amber-400 shrink-0 transition-transform duration-300 rotate-0" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 shrink-0 transition-transform duration-300 rotate-0" />
          )}
          <span>{showLabel ? (isDark ? 'Dark Mode' : 'Light Mode') : 'Appearance'}</span>
        </div>

        {/* Mini sliding toggle pill */}
        <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 p-0.5 ${
          isDark ? 'bg-blue-600' : 'bg-gray-300'
        }`}>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
              isDark ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
    );
  }

  // 2. Segmented variant (for Settings Page)
  if (variant === 'segmented') {
    return (
      <div className={`inline-flex p-1 bg-gray-100 dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 select-none ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            theme === 'light'
              ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm font-bold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm font-bold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-blue-400" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            theme === 'system'
              ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm font-bold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Laptop className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          <span>System</span>
        </button>
      </div>
    );
  }

  // 3. Switch variant (Labeled pill switch)
  if (variant === 'switch') {
    return (
      <div 
        onClick={handleToggle}
        className={`inline-flex items-center gap-3 cursor-pointer select-none ${className}`}
        role="button"
        tabIndex={0}
      >
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 p-0.5 ${
          isDark ? 'bg-blue-600' : 'bg-gray-300 dark:bg-neutral-700'
        }`}>
          <span
            className={`inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              isDark ? 'translate-x-5' : 'translate-x-0'
            }`}
          >
            {isDark ? (
              <Moon className="w-3 h-3 text-blue-600" />
            ) : (
              <Sun className="w-3 h-3 text-amber-500" />
            )}
          </span>
        </div>
      </div>
    );
  }

  // 4. Default: Compact icon toggle button (Navbar, header bars)
  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative p-2 rounded-lg border transition-all duration-200 cursor-pointer select-none flex items-center justify-center ${
        isDark
          ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-amber-400 hover:text-amber-300'
          : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        {mounted ? (
          isDark ? (
            <Moon className="w-4 h-4 transition-all duration-300 transform rotate-0 scale-100" />
          ) : (
            <Sun className="w-4 h-4 transition-all duration-300 transform rotate-0 scale-100 text-amber-500" />
          )
        ) : (
          <Sun className="w-4 h-4 opacity-50" />
        )}
      </div>
      {showLabel && (
        <span className="ml-2 text-xs font-semibold">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
