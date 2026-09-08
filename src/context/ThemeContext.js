'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');
  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Helper to get system theme
  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Compute resolved theme ('light' or 'dark') from state ('light', 'dark', or 'system')
  const resolveActualTheme = useCallback((currentTheme) => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme === 'dark' ? 'dark' : 'light';
  }, [getSystemTheme]);

  // Apply theme attributes and classes to HTML root element
  const applyThemeToDOM = useCallback((activeResolvedTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', activeResolvedTheme);
    if (activeResolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    // Also update meta color-scheme
    root.style.colorScheme = activeResolvedTheme;
  }, []);

  // Set and persist theme
  const setTheme = useCallback((newTheme) => {
    const validTheme = ['light', 'dark', 'system'].includes(newTheme) ? newTheme : 'light';
    setThemeState(validTheme);
    const resolved = resolveActualTheme(validTheme);
    setResolvedTheme(resolved);
    applyThemeToDOM(resolved);

    // 1. Save to localStorage
    try {
      localStorage.setItem('theme', validTheme);
    } catch (e) {
      console.warn('Failed to save theme in localStorage:', e);
    }

    // 2. Persist to Supabase backend asynchronously
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme_preference: validTheme }),
    }).catch((err) => {
      // Non-blocking background sync
      console.debug('Async theme sync notice:', err);
    });
  }, [resolveActualTheme, applyThemeToDOM]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    let initialTheme = 'light';

    // 1. Check localStorage first
    try {
      const stored = localStorage.getItem('theme');
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        initialTheme = stored;
      }
    } catch (e) {
      console.warn('localStorage theme access error:', e);
    }

    // If not in localStorage, try fetching user preference from API
    if (!localStorage.getItem('theme')) {
      fetch('/api/settings')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.theme_preference) {
            setTheme(data.theme_preference);
          } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              setTheme('dark');
            }
          }
        })
        .catch(() => {
          // Fallback to system preference
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
          }
        });
    }

    const resolved = resolveActualTheme(initialTheme);
    setThemeState(initialTheme);
    setResolvedTheme(resolved);
    applyThemeToDOM(resolved);

    // Listen to system preference changes if using 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e) => {
      const currentStored = localStorage.getItem('theme');
      if (currentStored === 'system') {
        const sysTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(sysTheme);
        applyThemeToDOM(sysTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [resolveActualTheme, applyThemeToDOM, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isDark: resolvedTheme === 'dark',
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
