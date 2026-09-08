'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  Globe, Calendar, RefreshCw, Filter, Search, Clock, 
  ExternalLink, FileText, Plus, Trash2, Edit3, Check, 
  ChevronDown, ChevronRight, AlertCircle, 
  Info, TrendingUp, TrendingDown, Sparkles, MessageSquare, 
  CheckCircle2, X, Tag, BookOpen, Layers, Shield, Zap,
  BarChart3, Coins, Flag, Timer, Compass, BellRing
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const FOREX_CURRENCIES = ['AUD', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'JPY', 'NZD', 'USD'];
const CRYPTO_COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK'];

const IMPACT_LEVELS = [
  { key: 'high', label: 'High', color: 'bg-[#EF4444] text-white', border: 'border-[#EF4444]' },
  { key: 'medium', label: 'Medium', color: 'bg-[#F97316] text-white', border: 'border-[#F97316]' },
  { key: 'low', label: 'Low', color: 'bg-[#10B981] text-white', border: 'border-[#10B981]' },
  { key: 'holiday', label: 'Holiday', color: 'bg-[#6B7280] text-white', border: 'border-[#6B7280]' }
];

const CURRENCY_FLAGS = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  CHF: '🇨🇭',
  CNY: '🇨🇳',
  NZD: '🇳🇿'
};

export default function NewsClientPage({ userName, userId }) {
  // Main Tab: 'news' | 'notes'
  const [mainTab, setMainTab] = useState('news');

  // Timezone preference: 'UTC' | 'Local'
  const [timezoneMode, setTimezoneMode] = useState('UTC');

  // News Data State
  const [calendarData, setCalendarData] = useState([]);
  const [cryptoNews, setCryptoNews] = useState([]);
  const [metaInfo, setMetaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [lastUpdatedText, setLastUpdatedText] = useState('Just now');

  // Section Collapse State (Today = expanded by default, Upcoming & Previous = collapsed by default)
  const [forexSections, setForexSections] = useState({
    today: true,
    upcoming: false,
    previous: false
  });

  const [cryptoSections, setCryptoSections] = useState({
    today: true,
    upcoming: false,
    previous: false
  });

  // Individual item collapse tracking for upcoming/previous
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Forex Filters State
  const [forexImpacts, setForexImpacts] = useState(['high', 'medium', 'low', 'holiday']);
  const [forexCurrencies, setForexCurrencies] = useState(FOREX_CURRENCIES);
  const [forexSearch, setForexSearch] = useState('');

  // Crypto Filters State
  const [cryptoImpacts, setCryptoImpacts] = useState(['high', 'medium', 'low']);
  const [cryptoCoins, setCryptoCoins] = useState(CRYPTO_COINS);
  const [cryptoSentimentFilter, setCryptoSentimentFilter] = useState('all'); // 'all' | 'bullish' | 'bearish' | 'neutral'
  const [cryptoSearch, setCryptoSearch] = useState('');

  // Countdown State
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());

  // Notes State
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('Macro Strategy');
  const [noteTags, setNoteTags] = useState('');
  const [noteLinkedNews, setNoteLinkedNews] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [notesSearch, setNotesSearch] = useState('');

  // Toast State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 4000);
  };

  // Fetch News Data from API
  const fetchNewsData = async (force = false) => {
    if (force) setRefreshing(true);
    else if (!lastFetchedAt) setLoading(true);

    try {
      const res = await fetch(`/api/news${force ? '?refresh=true' : ''}`);
      const data = await res.json();
      if (data.calendar) setCalendarData(data.calendar);
      if (data.cryptoNews) setCryptoNews(data.cryptoNews);
      if (data.meta) setMetaInfo(data.meta);
      setLastFetchedAt(Date.now());
      if (force) showToast('Live Forex calendar & crypto news feed refreshed', 'success');
    } catch (err) {
      console.error('Failed to fetch news data:', err);
      showToast('Failed to refresh live news feed', 'info');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch Notes
  const fetchNotes = async () => {
    setNotesLoading(true);
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (data.notes) setNotes(data.notes);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  // Initial Load + Auto Refresh every 5 Minutes (300,000 ms)
  useEffect(() => {
    fetchNewsData();
    fetchNotes();

    const autoRefreshInterval = setInterval(() => {
      fetchNewsData(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(autoRefreshInterval);
  }, []);

  // Clock ticker for countdown and "Last updated" text
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTimeMs(now);

      if (lastFetchedAt) {
        const diffSec = Math.floor((now - lastFetchedAt) / 1000);
        if (diffSec < 30) setLastUpdatedText('Just now');
        else if (diffSec < 60) setLastUpdatedText(`${diffSec}s ago`);
        else if (diffSec < 3600) setLastUpdatedText(`${Math.floor(diffSec / 60)}m ago`);
        else setLastUpdatedText(`${Math.floor(diffSec / 3600)}h ago`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastFetchedAt]);

  // Format time in 12-hour format (AM/PM) according to user's timezone preference
  const formatEventTime = (isoDate, defaultUtcTime) => {
    if (!isoDate && defaultUtcTime) {
      // If defaultUtcTime has no AM/PM, convert to 12-hour
      if (!defaultUtcTime.includes('AM') && !defaultUtcTime.includes('PM') && defaultUtcTime.includes(':')) {
        const parts = defaultUtcTime.split(':');
        let h = parseInt(parts[0], 10);
        const m = parts[1];
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm} UTC`;
      }
      return defaultUtcTime.includes('UTC') ? defaultUtcTime : `${defaultUtcTime} UTC`;
    }
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return `${defaultUtcTime || '--:--'} UTC`;

      if (timezoneMode === 'Local') {
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      }
      // UTC 12H with AM/PM
      let hours = d.getUTCHours();
      const minutes = d.getUTCMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm} UTC`;
    } catch (e) {
      return `${defaultUtcTime || '--:--'} UTC`;
    }
  };

  // Toggle item expanded state for upcoming/previous
  const toggleItemExpand = (id, e) => {
    if (e) e.stopPropagation();
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle section collapse for upcoming/previous
  const toggleForexSection = (sec) => {
    setForexSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const toggleCryptoSection = (sec) => {
    setCryptoSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Filter Handlers - Forex
  const toggleForexImpact = (key) => {
    setForexImpacts(prev => 
      prev.includes(key) 
        ? (prev.length === 1 ? prev : prev.filter(k => k !== key))
        : [...prev, key]
    );
  };

  const toggleForexCurrency = (curr) => {
    setForexCurrencies(prev => 
      prev.includes(curr)
        ? (prev.length === 1 ? prev : prev.filter(c => c !== curr))
        : [...prev, curr]
    );
  };

  // Filter Handlers - Crypto
  const toggleCryptoImpact = (key) => {
    setCryptoImpacts(prev => 
      prev.includes(key) 
        ? (prev.length === 1 ? prev : prev.filter(k => k !== key))
        : [...prev, key]
    );
  };

  const toggleCryptoCoin = (coin) => {
    setCryptoCoins(prev => 
      prev.includes(coin)
        ? (prev.length === 1 ? prev : prev.filter(c => c !== coin))
        : [...prev, coin]
    );
  };

  // Filtered Forex Events grouped by Section (Today, Upcoming, Previous)
  const filteredForex = useMemo(() => {
    const today = [];
    const upcoming = [];
    const previous = [];

    calendarData.forEach(item => {
      if (!forexImpacts.includes(item.impact)) return false;
      if (!forexCurrencies.includes(item.currency)) return false;
      if (forexSearch) {
        const q = forexSearch.toLowerCase();
        const matchTitle = item.event.toLowerCase().includes(q);
        const matchCurr = item.currency.toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCurr && !matchDesc) return false;
      }

      if (item.offsetDays === 0 || item.section === 'today') today.push(item);
      else if (item.offsetDays > 0 || item.section === 'upcoming') upcoming.push(item);
      else previous.push(item);
    });

    return { today, upcoming, previous };
  }, [calendarData, forexImpacts, forexCurrencies, forexSearch]);

  // Next Upcoming Event Today Countdown Calculation
  const nextEventInfo = useMemo(() => {
    if (!filteredForex.today || filteredForex.today.length === 0) return null;

    const upcomingToday = filteredForex.today
      .map(item => {
        const itemMs = item.iso_date ? new Date(item.iso_date).getTime() : new Date(`${item.date}T${item.time}:00Z`).getTime();
        return {
          ...item,
          timeMs: itemMs,
          diffMs: itemMs - currentTimeMs
        };
      })
      .filter(item => item.diffMs > 0)
      .sort((a, b) => a.diffMs - b.diffMs);

    if (upcomingToday.length === 0) return null;

    const next = upcomingToday[0];
    const diffSec = Math.floor(next.diffMs / 1000);
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    return {
      event: next.event,
      currency: next.currency,
      impact: next.impact,
      countdownFormatted: `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
    };
  }, [filteredForex.today, currentTimeMs]);

  // Filtered Crypto News grouped by Section (Today, Upcoming, Previous)
  const filteredCrypto = useMemo(() => {
    const today = [];
    const upcoming = [];
    const previous = [];

    cryptoNews.forEach(item => {
      if (!cryptoImpacts.includes(item.impact)) return false;
      
      if (cryptoSentimentFilter !== 'all' && item.sentiment !== cryptoSentimentFilter) return false;

      const coinMatch = (item.currencies || []).some(c => cryptoCoins.includes(c));
      if (!coinMatch && (item.currencies || []).length > 0) return false;

      if (cryptoSearch) {
        const q = cryptoSearch.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSummary = (item.summary || '').toLowerCase().includes(q);
        const matchCoins = (item.currencies || []).some(c => c.toLowerCase().includes(q));
        if (!matchTitle && !matchSummary && !matchCoins) return false;
      }

      if (item.section === 'today' || item.offsetDays === 0) today.push(item);
      else if (item.section === 'upcoming' || item.offsetDays > 0) upcoming.push(item);
      else previous.push(item);
    });

    return { today, upcoming, previous };
  }, [cryptoNews, cryptoImpacts, cryptoCoins, cryptoSentimentFilter, cryptoSearch]);

  // Save Note Handler
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) {
      showToast('Please enter a title or note content', 'info');
      return;
    }

    const tagsArray = noteTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    try {
      if (editingNoteId) {
        const res = await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingNoteId,
            title: noteTitle,
            content: noteContent,
            category: noteCategory,
            tags: tagsArray,
            linked_news_id: noteLinkedNews || null
          })
        });
        if (res.ok) showToast('Note updated successfully', 'success');
      } else {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: noteTitle,
            content: noteContent,
            category: noteCategory,
            tags: tagsArray,
            linked_news_id: noteLinkedNews || null
          })
        });
        if (res.ok) showToast('Note saved successfully', 'success');
      }

      setNoteTitle('');
      setNoteContent('');
      setNoteTags('');
      setNoteLinkedNews('');
      setEditingNoteId(null);
      setIsNoteModalOpen(false);
      fetchNotes();
    } catch (err) {
      showToast('Failed to save note', 'info');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Note deleted', 'success');
        setNotes(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      showToast('Failed to delete note', 'info');
    }
  };

  // Open note composer linked to event
  const openNoteForEvent = (title, category, tags, desc) => {
    setNoteTitle(title);
    setNoteCategory(category || 'Macro Strategy');
    setNoteTags(tags || '');
    setNoteLinkedNews(title);
    setNoteContent(desc ? `Details: ${desc}\n\nMy Trade Thesis:\n- Entry Triggers:\n- Risk Parameters:` : 'Trade Thesis & Catalyst Analysis:\n- ');
    setEditingNoteId(null);
    setIsNoteModalOpen(true);
    setMainTab('notes');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0E14] text-gray-900 dark:text-neutral-100 flex flex-col font-sans select-none transition-colors duration-200">
      <Navbar userName={userName} />

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-16 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.1] shadow-lg bg-white dark:bg-[#161D2A] text-gray-800 dark:text-white text-xs font-semibold">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* TOP SUB-HEADER & MAIN TABS: News | Notes | Refresh | Timezone */}
      <div className="bg-white dark:bg-[#111722] border-b border-gray-200 dark:border-white/[0.08] sticky top-12 z-40 px-4 md:px-8 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-2.5">
          {/* Main Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMainTab('news')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mainTab === 'news'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#161D2A]'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Real-Time Feed (+/- 7 days)</span>
              {metaInfo?.is_live && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMainTab('notes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                mainTab === 'notes'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-gray-600 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#161D2A]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Trade Notes</span>
              {notes.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  mainTab === 'notes' ? 'bg-white/30 text-white' : 'bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-200'
                }`}>
                  {notes.length}
                </span>
              )}
            </button>
          </div>

          {/* Right Action Bar (Timezone Toggle, Live Auto-Refresh Status & Manual Trigger) */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Timezone Switcher */}
            <button
              type="button"
              onClick={() => setTimezoneMode(prev => prev === 'UTC' ? 'Local' : 'UTC')}
              className="flex items-center gap-1.5 text-[11px] text-gray-700 dark:text-neutral-300 font-semibold bg-gray-50 dark:bg-[#161D2A] px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-white/[0.08] hover:border-blue-400 transition-colors cursor-pointer"
              title="Toggle between UTC and Local Browser Timezone"
            >
              <Clock className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
              <span>TZ: <strong>{timezoneMode}</strong></span>
            </button>

            {/* Last Updated Status Indicator */}
            <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-400 dark:text-neutral-500 font-mono bg-gray-50 dark:bg-[#161D2A] px-2.5 py-1.5 rounded-xl border border-gray-200/80 dark:border-white/[0.08]">
              <span>Updated:</span>
              <span className="font-semibold text-gray-700 dark:text-neutral-300">{lastUpdatedText}</span>
            </div>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={() => fetchNewsData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#161D2A] hover:bg-gray-50 dark:hover:bg-[#1c2536] text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-white/[0.08] rounded-xl text-xs font-semibold shadow-xs hover:border-[#2563EB] transition-all cursor-pointer"
              title="Force fetch latest live macroeconomic calendar & crypto stories"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* ========================================================= */}
        {/* TAB 1: TWO-COLUMN NEWS SECTION (60% Forex | 40% Crypto)    */}
        {/* ========================================================= */}
        {mainTab === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ======================================================= */}
            {/* LEFT COLUMN (60%): FOREX / ECONOMIC CALENDAR NEWS       */}
            {/* ======================================================= */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Forex Column Header & Filters Card */}
              <div className="bg-white dark:bg-[#111722] rounded-2xl border border-gray-200 dark:border-white/[0.08] p-4 shadow-xs flex flex-col gap-3 transition-colors">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
                      <Flag className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                        Forex Economic Calendar
                      </h2>
                      <p className="text-[10.5px] text-gray-400 dark:text-neutral-400">Real macroeconomic releases, central bank decisions & NFP</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-semibold bg-gray-100 dark:bg-[#161D2A] px-2 py-0.5 rounded text-gray-600 dark:text-neutral-300">
                    {filteredForex.today.length + filteredForex.upcoming.length + filteredForex.previous.length} Events
                  </span>
                </div>

                {/* Forex Search */}
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Forex calendar (NFP, CPI, Fed, ECB, Rate Decision)..."
                    value={forexSearch}
                    onChange={(e) => setForexSearch(e.target.value)}
                    className="w-full pl-9 pr-7 py-1.5 text-xs bg-gray-50 dark:bg-[#161D2A] focus:bg-white dark:focus:bg-[#1c2536] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                  />
                  {forexSearch && (
                    <button onClick={() => setForexSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Forex Impact Filters */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10.5px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mr-1">Impact:</span>
                  {IMPACT_LEVELS.map(imp => {
                    const isSelected = forexImpacts.includes(imp.key);
                    return (
                      <button
                        key={imp.key}
                        onClick={() => toggleForexImpact(imp.key)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                            : 'bg-white dark:bg-[#161D2A] text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-white/[0.08] hover:border-[#2563EB]/50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          imp.key === 'high' ? 'bg-[#EF4444]' :
                          imp.key === 'medium' ? 'bg-[#F97316]' :
                          imp.key === 'low' ? 'bg-[#10B981]' : 'bg-[#6B7280]'
                        }`} />
                        <span>{imp.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Forex Currency Filters */}
                <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                  <span className="text-[10.5px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mr-1">Currencies:</span>
                  {FOREX_CURRENCIES.map(curr => {
                    const isSelected = forexCurrencies.includes(curr);
                    return (
                      <button
                        key={curr}
                        onClick={() => toggleForexCurrency(curr)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                            : 'bg-white dark:bg-[#161D2A] text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-white/[0.08] hover:border-[#2563EB]/50'
                        }`}
                      >
                        <span>{CURRENCY_FLAGS[curr]}</span>
                        <span>{curr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sections: TODAY (Always Open with Countdown) | Upcoming (Collapsible) | Previous (Collapsible) */}
              <div className="flex flex-col gap-3">
                
                {/* 1. FOREX - TODAY SECTION (Always Visible, Countdown Banner) */}
                <div className="bg-white dark:bg-[#111722] rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-xs overflow-hidden transition-colors">
                  <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50/90 to-white dark:from-blue-950/40 dark:to-[#111722] flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Today</span>
                        <span className="bg-[#2563EB] text-white text-[9px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                          Live Calendar
                        </span>
                      </h3>
                      <span className="text-xs font-mono font-semibold text-gray-500 dark:text-neutral-400">
                        ({filteredForex.today.length} events)
                      </span>
                    </div>

                    {/* Live Next Event Countdown Banner */}
                    {nextEventInfo ? (
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-white dark:bg-[#161D2A] rounded-xl border border-blue-200 dark:border-blue-900/50 shadow-2xs text-[11px]">
                        <Timer className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400 shrink-0 animate-pulse" />
                        <span className="text-gray-500 dark:text-neutral-400 font-medium">Next:</span>
                        <span className="font-bold text-gray-800 dark:text-neutral-200 truncate max-w-[120px]" title={nextEventInfo.event}>
                          {nextEventInfo.currency} {nextEventInfo.event}
                        </span>
                        <span className="font-mono font-bold text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded">
                          {nextEventInfo.countdownFormatted}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 dark:text-neutral-500 font-medium">
                        All today releases completed
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex flex-col gap-2.5">
                    {loading ? (
                      <div className="p-6 text-center text-gray-400 dark:text-neutral-500 text-xs font-semibold flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#2563EB]" />
                        Fetching live economic calendar...
                      </div>
                    ) : filteredForex.today.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 dark:text-neutral-500 text-xs">No Forex events today matching filter criteria.</div>
                    ) : (
                      filteredForex.today.map(event => renderForexItem(event, true))
                    )}
                  </div>
                </div>

                {/* 2. FOREX - UPCOMING SECTION (Collapsible with ▶ / ▼) */}
                <div className="bg-white dark:bg-[#111722] rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-xs overflow-hidden transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleForexSection('upcoming')}
                    className="w-full px-4 py-3 bg-gray-50/70 dark:bg-[#161D2A]/60 hover:bg-gray-100/70 dark:hover:bg-[#1c2536] flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-neutral-400 font-bold text-sm">
                        {forexSections.upcoming ? '▼' : '▶'}
                      </span>
                      <h3 className="text-xs font-bold text-gray-800 dark:text-neutral-200 uppercase tracking-wider">
                        Upcoming (Next 7 Days)
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-400 dark:text-neutral-500">
                      ({filteredForex.upcoming.length} items)
                    </span>
                  </button>

                  {forexSections.upcoming && (
                    <div className="p-3 flex flex-col gap-2.5">
                      {filteredForex.upcoming.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 dark:text-neutral-500 text-xs">No upcoming events matching filter criteria.</div>
                      ) : (
                        filteredForex.upcoming.map(event => renderForexItem(event, false))
                      )}
                    </div>
                  )}
                </div>

                {/* 3. FOREX - PREVIOUS SECTION (Collapsible with ▶ / ▼) */}
                <div className="bg-white dark:bg-[#111722] rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-xs overflow-hidden transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleForexSection('previous')}
                    className="w-full px-4 py-3 bg-gray-50/70 dark:bg-[#161D2A]/60 hover:bg-gray-100/70 dark:hover:bg-[#1c2536] flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-neutral-400 font-bold text-sm">
                        {forexSections.previous ? '▼' : '▶'}
                      </span>
                      <h3 className="text-xs font-bold text-gray-800 dark:text-neutral-200 uppercase tracking-wider">
                        Previous (Last 7 Days)
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-400 dark:text-neutral-500">
                      ({filteredForex.previous.length} items)
                    </span>
                  </button>

                  {forexSections.previous && (
                    <div className="p-3 flex flex-col gap-2.5">
                      {filteredForex.previous.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 dark:text-neutral-500 text-xs">No previous events matching filter criteria.</div>
                      ) : (
                        filteredForex.previous.map(event => renderForexItem(event, false))
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* ======================================================= */}
            {/* RIGHT COLUMN (40%): CRYPTO NEWS & DEVELOPMENTS          */}
            {/* ======================================================= */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Crypto Column Header & Filters Card */}
              <div className="bg-white dark:bg-[#111722] rounded-2xl border border-gray-200 dark:border-white/[0.08] p-4 shadow-xs flex flex-col gap-3 transition-colors">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-[#F59E0B] dark:text-amber-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                        Cryptocurrency News
                      </h2>
                      <p className="text-[10.5px] text-gray-400 dark:text-neutral-400">Live feeds from CoinTelegraph, Decrypt & CoinDesk</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-semibold bg-gray-100 dark:bg-[#161D2A] px-2 py-0.5 rounded text-gray-600 dark:text-neutral-300">
                    {filteredCrypto.today.length + filteredCrypto.upcoming.length + filteredCrypto.previous.length} Stories
                  </span>
                </div>

                {/* Crypto Search */}
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search crypto feeds (BTC, ETF, Solana, Unlock, SEC)..."
                    value={cryptoSearch}
                    onChange={(e) => setCryptoSearch(e.target.value)}
                    className="w-full pl-9 pr-7 py-1.5 text-xs bg-gray-50 dark:bg-[#161D2A] focus:bg-white dark:focus:bg-[#1c2536] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                  />
                  {cryptoSearch && (
                    <button onClick={() => setCryptoSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Sentiment Filter Tabs */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10.5px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mr-1">Sentiment:</span>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'bullish', label: 'Bullish', color: 'text-emerald-500' },
                    { id: 'bearish', label: 'Bearish', color: 'text-rose-500' },
                    { id: 'neutral', label: 'Neutral', color: 'text-gray-400' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setCryptoSentimentFilter(s.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                        cryptoSentimentFilter === s.id
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                          : 'bg-white dark:bg-[#161D2A] text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-white/[0.08] hover:border-[#2563EB]/50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Crypto Coin Filters */}
                <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                  <span className="text-[10.5px] font-bold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mr-1">Coins:</span>
                  {CRYPTO_COINS.map(coin => {
                    const isSelected = cryptoCoins.includes(coin);
                    return (
                      <button
                        key={coin}
                        onClick={() => toggleCryptoCoin(coin)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold font-mono transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                            : 'bg-white dark:bg-[#161D2A] text-gray-600 dark:text-neutral-300 border-gray-200 dark:border-white/[0.08] hover:border-[#2563EB]/50'
                        }`}
                      >
                        #{coin}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sections: TODAY (Always Open) | Upcoming (Collapsible) | Previous (Collapsible) */}
              <div className="flex flex-col gap-3">
                
                {/* 1. CRYPTO - TODAY SECTION (Always Visible, Strictly last 24 hours) */}
                <div className="bg-white dark:bg-[#111722] rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-xs overflow-hidden transition-colors">
                  <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50/90 to-white dark:from-blue-950/40 dark:to-[#111722] flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Today</span>
                        <span className="bg-[#2563EB] text-white text-[9px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                          Last 24h Breaking
                        </span>
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-500 dark:text-neutral-400">
                      ({filteredCrypto.today.length} stories)
                    </span>
                  </div>

                  <div className="p-3 flex flex-col gap-2.5">
                    {loading ? (
                      <div className="p-6 text-center text-gray-400 dark:text-neutral-500 text-xs font-semibold flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#2563EB]" />
                        Fetching live crypto breaking feeds...
                      </div>
                    ) : filteredCrypto.today.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 dark:text-neutral-500 text-xs">No crypto news today matching criteria.</div>
                    ) : (
                      filteredCrypto.today.map(item => renderCryptoItem(item))
                    )}
                  </div>
                </div>

                {/* 2. CRYPTO - UPCOMING SECTION (Collapsible with ▶ / ▼) */}
                <div className="bg-white dark:bg-[#111722] rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-xs overflow-hidden transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleCryptoSection('upcoming')}
                    className="w-full px-4 py-3 bg-gray-50/70 dark:bg-[#161D2A]/60 hover:bg-gray-100/70 dark:hover:bg-[#1c2536] flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-neutral-400 font-bold text-sm">
                        {cryptoSections.upcoming ? '▼' : '▶'}
                      </span>
                      <h3 className="text-xs font-bold text-gray-800 dark:text-neutral-200 uppercase tracking-wider">
                        Upcoming Catalysts & Unlocks
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-400 dark:text-neutral-500">
                      ({filteredCrypto.upcoming.length} stories)
                    </span>
                  </button>

                  {cryptoSections.upcoming && (
                    <div className="p-3 flex flex-col gap-2.5">
                      {filteredCrypto.upcoming.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 dark:text-neutral-500 text-xs">No upcoming crypto catalysts matching criteria.</div>
                      ) : (
                        filteredCrypto.upcoming.map(item => renderCryptoItem(item))
                      )}
                    </div>
                  )}
                </div>

                {/* 3. CRYPTO - PREVIOUS SECTION (Collapsible with ▶ / ▼) */}
                <div className="bg-white dark:bg-[#111722] rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-xs overflow-hidden transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleCryptoSection('previous')}
                    className="w-full px-4 py-3 bg-gray-50/70 dark:bg-[#161D2A]/60 hover:bg-gray-100/70 dark:hover:bg-[#1c2536] flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-neutral-400 font-bold text-sm">
                        {cryptoSections.previous ? '▼' : '▶'}
                      </span>
                      <h3 className="text-xs font-bold text-gray-800 dark:text-neutral-200 uppercase tracking-wider">
                        Previous Highlights
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-400 dark:text-neutral-500">
                      ({filteredCrypto.previous.length} stories)
                    </span>
                  </button>

                  {cryptoSections.previous && (
                    <div className="p-3 flex flex-col gap-2.5">
                      {filteredCrypto.previous.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 dark:text-neutral-500 text-xs">No previous crypto stories matching criteria.</div>
                      ) : (
                        filteredCrypto.previous.map(item => renderCryptoItem(item))
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TRADING NOTES & JOURNAL SECTION                   */}
        {/* ========================================================= */}
        {mainTab === 'notes' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white dark:bg-[#111722] rounded-2xl border border-gray-200 dark:border-white/[0.08] p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Trading Journal & Custom Notes</h2>
                  <p className="text-[11px] text-gray-400 dark:text-neutral-400">Capture pre-event hypotheses and market impact analysis.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={notesSearch}
                    onChange={(e) => setNotesSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-[#161D2A] focus:bg-white dark:focus:bg-[#1c2536] border border-gray-200 dark:border-white/[0.1] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingNoteId(null);
                    setNoteTitle('');
                    setNoteContent('');
                    setNoteCategory('Macro Strategy');
                    setNoteTags('');
                    setNoteLinkedNews('');
                    setIsNoteModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Note</span>
                </button>
              </div>
            </div>

            {notesLoading ? (
              <div className="p-12 text-center text-gray-400 dark:text-neutral-500 text-xs font-semibold">
                <RefreshCw className="w-6 h-6 text-[#2563EB] animate-spin mx-auto mb-2" />
                Loading your trading notes...
              </div>
            ) : notes.length === 0 ? (
              <div className="bg-white dark:bg-[#111722] rounded-2xl border border-dashed border-gray-300 dark:border-white/[0.1] p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-gray-800 dark:text-neutral-200">No notes found</h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400 max-w-sm">
                  Click the note icon on any Forex release or Crypto headline to write a dedicated trading thesis.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingNoteId(null);
                    setNoteTitle('');
                    setNoteContent('');
                    setIsNoteModalOpen(true);
                  }}
                  className="mt-2 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  Create Your First Note
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes
                  .filter(n => {
                    if (!notesSearch) return true;
                    const q = notesSearch.toLowerCase();
                    return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q) || (n.tags || []).some(t => t.toLowerCase().includes(q));
                  })
                  .map(note => (
                  <div 
                    key={note.id}
                    className="bg-white dark:bg-[#111722] rounded-2xl border border-gray-200 dark:border-white/[0.08] hover:border-blue-300 dark:hover:border-blue-500/50 p-4 shadow-xs flex flex-col justify-between gap-3 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40">
                          {note.category || 'General'}
                        </span>
                        <span className="text-gray-400 dark:text-neutral-500 font-mono">
                          {new Date(note.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                        {note.title}
                      </h3>

                      {note.linked_news_id && (
                        <div className="text-[10.5px] text-gray-500 dark:text-neutral-400 bg-gray-50 dark:bg-[#161D2A] px-2 py-1 rounded-lg border border-gray-100 dark:border-white/[0.06] flex items-center gap-1.5 font-medium truncate">
                          <Tag className="w-3 h-3 text-[#2563EB] dark:text-blue-400 shrink-0" />
                          <span className="truncate">Linked: {note.linked_news_id}</span>
                        </div>
                      )}

                      <p className="text-xs text-gray-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-sans">
                        {note.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                      <div className="flex flex-wrap gap-1">
                        {(note.tags || []).map(t => (
                          <span key={t} className="text-[10px] text-gray-400 dark:text-neutral-500 font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setNoteTitle(note.title);
                            setNoteContent(note.content);
                            setNoteCategory(note.category || 'General');
                            setNoteTags((note.tags || []).join(', '));
                            setNoteLinkedNews(note.linked_news_id || '');
                            setIsNoteModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Edit Note"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 text-gray-400 dark:text-neutral-400 hover:text-[#EF4444] dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* NOTE CREATION / EDIT MODAL                                */}
      {/* ========================================================= */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111722] w-full max-w-lg rounded-2xl border border-gray-200 dark:border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between bg-[#FAFAFA] dark:bg-[#161D2A]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {editingNoteId ? 'Edit Trading Note' : 'Create Trading Note'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1c2536] rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="p-5 flex flex-col gap-4 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fed Rate Decision Hypothesis & Long EUR/USD Setup"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/[0.1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] font-semibold transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-white/[0.1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white font-medium transition-colors"
                  >
                    <option value="Macro Strategy" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">Macro Strategy</option>
                    <option value="Crypto Sentiment" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">Crypto Sentiment</option>
                    <option value="Interest Rate Watch" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">Interest Rate Watch</option>
                    <option value="Post-Trade Review" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">Post-Trade Review</option>
                    <option value="General" className="bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Fed, USD, EUR, NFP"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/[0.1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                  />
                </div>
              </div>

              {noteLinkedNews && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                    Linked News Event
                  </label>
                  <div className="px-3 py-1.5 bg-gray-50 dark:bg-[#161D2A] rounded-xl border border-gray-200 dark:border-white/[0.08] text-xs text-gray-700 dark:text-neutral-200 font-medium flex items-center justify-between">
                    <span className="truncate">{noteLinkedNews}</span>
                    <button
                      type="button"
                      onClick={() => setNoteLinkedNews('')}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-rose-400 text-[10px] ml-2 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Note & Strategy Content
                </label>
                <textarea
                  rows={7}
                  placeholder="Detail your pre-market bias, key support/resistance levels, and expected volatility triggers..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#161D2A] text-gray-900 dark:text-white border border-gray-200 dark:border-white/[0.1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] font-sans leading-relaxed transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-[#161D2A] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {editingNoteId ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Helper render for Forex Item (dimmed if past)
  function renderForexItem(event, isTodaySection = false) {
    const isExpanded = expandedItems.has(event.id);
    const impactObj = IMPACT_LEVELS.find(i => i.key === event.impact);

    const eventTimeMs = event.iso_date ? new Date(event.iso_date).getTime() : new Date(`${event.date}T${event.time}:00Z`).getTime();
    const isPast = event.is_past || eventTimeMs < currentTimeMs;
    const formattedTime = formatEventTime(event.iso_date, event.time);

    return (
      <div 
        key={event.id}
        className={`border rounded-xl overflow-hidden transition-all shadow-2xs ${
          isPast && isTodaySection
            ? 'bg-gray-50/60 dark:bg-[#131924]/50 border-gray-200/60 dark:border-white/[0.04] opacity-80'
            : 'bg-white dark:bg-[#161D2A] border-gray-200 dark:border-white/[0.08] hover:border-blue-500/60 dark:hover:border-blue-400/60'
        }`}
      >
        <div 
          onClick={(e) => toggleItemExpand(event.id, e)}
          className="p-3 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-[#1c2536] transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs text-gray-400 dark:text-neutral-500 font-bold">
              {isExpanded ? '▼' : '▶'}
            </span>

            <span className={`font-mono text-[11px] font-semibold shrink-0 ${
              isPast && isTodaySection ? 'text-gray-400 dark:text-neutral-500' : 'text-gray-600 dark:text-neutral-300'
            }`}>
              {formattedTime}
            </span>

            <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white font-mono text-[11px] shrink-0 bg-gray-100/70 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
              <span>{CURRENCY_FLAGS[event.currency] || '🌐'}</span>
              <span>{event.currency}</span>
            </div>

            <span className={`font-semibold text-xs truncate ${
              isPast && isTodaySection ? 'text-gray-600 dark:text-neutral-400' : 'text-gray-900 dark:text-white'
            }`}>
              {event.event}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Impact Badge */}
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${impactObj?.color || 'bg-gray-400 text-white'}`}>
              {event.impact}
            </span>

            {/* Actual Value */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-gray-600 dark:text-neutral-300 bg-gray-50 dark:bg-[#111722] px-2 py-0.5 rounded border border-gray-100 dark:border-white/[0.06]">
              <span className="text-gray-400 dark:text-neutral-500 text-[9.5px]">Act:</span>
              <span className={`font-bold ${event.actual !== '-' ? 'text-[#089981] dark:text-emerald-400' : 'text-gray-400 dark:text-neutral-500'}`}>{event.actual}</span>
            </div>

            {/* Passed Status Badge if Today */}
            {isTodaySection && isPast && (
              <span className="text-[9.5px] font-mono font-semibold bg-gray-200/80 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 px-1.5 py-0.5 rounded">
                Passed
              </span>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 py-3 bg-gray-50/70 dark:bg-[#111722]/80 border-t border-gray-100 dark:border-white/[0.06] flex flex-col gap-3 animate-fade-in">
            <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed">
              {event.description}
            </p>

            <div className="grid grid-cols-3 gap-2 bg-white dark:bg-[#161D2A] p-2.5 rounded-lg border border-gray-200/80 dark:border-white/[0.08] text-center font-mono">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase font-semibold">Actual</span>
                <span className="text-xs font-bold text-[#089981] dark:text-emerald-400">{event.actual}</span>
              </div>
              <div className="flex flex-col border-x border-gray-100 dark:border-white/[0.06]">
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase font-semibold">Forecast</span>
                <span className="text-xs font-bold text-gray-700 dark:text-neutral-200">{event.forecast}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase font-semibold">Previous</span>
                <span className="text-xs font-bold text-gray-500 dark:text-neutral-400">{event.previous}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10.5px] text-gray-400 dark:text-neutral-500 font-mono">
                Country: {event.country} | Date: {event.date} | Time: {formattedTime}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openNoteForEvent(
                    `${event.currency} - ${event.event}`,
                    'Macro Strategy',
                    `${event.currency}, ${event.impact.toUpperCase()}`,
                    `Forecast: ${event.forecast} | Previous: ${event.previous} | Actual: ${event.actual}\n${event.description}`
                  );
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#2563EB] hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>Write Trade Thesis</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Helper render for Crypto Item
  function renderCryptoItem(item) {
    const isExpanded = expandedItems.has(item.id);

    return (
      <div 
        key={item.id}
        className="bg-white dark:bg-[#161D2A] border border-gray-200 dark:border-white/[0.08] hover:border-blue-500/60 dark:hover:border-blue-400/60 rounded-xl overflow-hidden shadow-2xs transition-all"
      >
        <div 
          onClick={(e) => toggleItemExpand(item.id, e)}
          className="p-3 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-[#1c2536] transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-gray-400 dark:text-neutral-500 font-bold">
              {isExpanded ? '▼' : '▶'}
            </span>

            <span className="font-mono text-[10.5px] font-semibold text-gray-400 dark:text-neutral-500 shrink-0">
              {item.relative_time || formatEventTime(item.published_at, item.time) || 'Today'}
            </span>

            <div className="flex items-center gap-1 shrink-0">
              {(item.currencies || ['BTC']).map(c => (
                <span key={c} className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-mono font-bold text-[10px] px-1.5 py-0.2 rounded">
                  #{c}
                </span>
              ))}
            </div>

            <span className="font-semibold text-xs text-gray-900 dark:text-white truncate" title={item.title}>
              {item.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
              item.sentiment === 'bullish' ? 'bg-[#10B981]/15 text-[#10B981] dark:bg-emerald-950/40 dark:text-emerald-400' :
              item.sentiment === 'bearish' ? 'bg-[#EF4444]/15 text-[#EF4444] dark:bg-rose-950/40 dark:text-rose-400' : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300'
            }`}>
              {item.sentiment}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 py-3 bg-gray-50/70 dark:bg-[#111722]/80 border-t border-gray-100 dark:border-white/[0.06] flex flex-col gap-3 animate-fade-in">
            <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed">
              {item.summary}
            </p>

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-neutral-400">
                <span className="font-bold bg-white dark:bg-[#161D2A] px-2 py-0.5 rounded border border-gray-200/80 dark:border-white/[0.08] text-gray-700 dark:text-neutral-200">{item.source}</span>
                <span>Category: {item.category || 'Market News'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openNoteForEvent(
                      item.title,
                      'Crypto Sentiment',
                      (item.currencies || []).join(', '),
                      `Source: ${item.source}\n${item.summary}`
                    );
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#161D2A] hover:bg-gray-100 dark:hover:bg-[#1c2536] text-gray-700 dark:text-neutral-200 border border-gray-200 dark:border-white/[0.08] text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Trade Note</span>
                </button>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#2563EB] hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-2xs"
                >
                  <span>Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

