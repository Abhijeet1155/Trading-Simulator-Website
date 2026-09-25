'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, Trophy, Award, Calendar, 
  User, CheckCircle2, ChevronRight, HelpCircle, 
  Loader2, Info, Star, Percent, Briefcase, ArrowLeft
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LeaderboardClientPage({ 
  currentUserId, 
  userName, 
  trades = [], 
  isFallbackActive = false 
}) {
  const formatPnL = (val) => {
    const num = parseFloat(val || 0);
    if (num === 0) return '$0.00';
    const isPositive = num > 0;
    const formattedVal = Math.abs(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${isPositive ? '+' : '-'}$${formattedVal}`;
  };

  const [selectedLeaderboardTab, setSelectedLeaderboardTab] = useState('Global');
  const [availableComps, setAvailableComps] = useState([]);
  const [compRankings, setCompRankings] = useState([]);
  const [compDetailLoading, setCompDetailLoading] = useState(false);

  const [timeTab, setTimeTab] = useState('All Time');
  const [loading, setLoading] = useState(false);

  // Trigger brief simulation of loading state when timeframe changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, [timeTab]);

  // Fetch available active competitions on mount
  useEffect(() => {
    const fetchComps = async () => {
      try {
        const res = await fetch('/api/competitions');
        const data = await res.json();
        if (res.ok) {
          // Show competitions that are active (or even upcoming)
          const activeComps = (data.competitions || []).filter(c => c.status === 'active' || c.status === 'upcoming');
          setAvailableComps(activeComps);
        }
      } catch (err) {
        console.error('Failed to load competitions for leaderboard filter:', err);
      }
    };
    fetchComps();
  }, []);

  // Fetch competition standings when tab changes
  useEffect(() => {
    if (selectedLeaderboardTab === 'Global') {
      setCompRankings([]);
      return;
    }
    
    const fetchCompRankings = async () => {
      try {
        setCompDetailLoading(true);
        const res = await fetch(`/api/competitions?id=${selectedLeaderboardTab}`);
        const data = await res.json();
        if (res.ok) {
          setCompRankings(data.participants || []);
        }
      } catch (err) {
        console.error('Failed to load competition rankings:', err);
      } finally {
        setCompDetailLoading(false);
      }
    };
    
    fetchCompRankings();
  }, [selectedLeaderboardTab]);

  // Date boundary checkers
  const isWithinTimeframe = (dateStr, timeframe) => {
    if (timeframe === 'All Time') return true;
    try {
      const closedDate = new Date(dateStr);
      const now = new Date();
      
      if (timeframe === 'This Week') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        return closedDate >= startOfWeek;
      }
      
      if (timeframe === 'This Month') {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        return closedDate >= startOfMonth;
      }
    } catch (e) {
      return false;
    }
    return true;
  };

  // 1. Filter trades by selected timeframe
  const filteredTrades = trades.filter(t => isWithinTimeframe(t.closed_at, timeTab));

  // 2. Perform Group By and Aggregation on user_id for global leaderboard
  const userStatsMap = {};
  
  filteredTrades.forEach(t => {
    if (!userStatsMap[t.user_id]) {
      userStatsMap[t.user_id] = {
        user_id: t.user_id,
        user_name: t.user_name,
        total_pnl: 0,
        total_trades: 0,
        win_count: 0,
        best_trade: -Infinity
      };
    }

    const entry = userStatsMap[t.user_id];
    entry.total_pnl += t.pnl;
    entry.total_trades += 1;
    if (t.pnl > 0) entry.win_count += 1;
    if (t.pnl > entry.best_trade) entry.best_trade = t.pnl;
  });

  // Convert to array, finalize calculations, and sort
  const rankings = Object.values(userStatsMap).map(u => ({
    ...u,
    win_rate: u.total_trades > 0 ? (u.win_count / u.total_trades) * 100 : 0.00,
    best_trade: u.best_trade === -Infinity ? 0.00 : u.best_trade
  }));

  // Sort descending by total_pnl
  rankings.sort((a, b) => b.total_pnl - a.total_pnl);

  // Append ranks
  const rankedUsers = rankings.map((u, idx) => ({
    ...u,
    rank: idx + 1
  }));

  // podium split
  const firstPlace = rankedUsers.find(u => u.rank === 1);
  const secondPlace = rankedUsers.find(u => u.rank === 2);
  const thirdPlace = rankedUsers.find(u => u.rank === 3);

  // remaining table users (Rank >= 4)
  const tableUsers = rankedUsers.filter(u => u.rank >= 4);

  // resolve current user rank and stats
  const currentUserStats = rankedUsers.find(u => u.user_id === currentUserId);
  const currentUserRank = currentUserStats ? currentUserStats.rank : null;
  const currentUserPnL = currentUserStats ? currentUserStats.total_pnl : 0.00;

  // Mask other users names slightly for privacy, e.g. "Sophia Sterling" -> "Sophia S."
  const getMaskedName = (name, uid) => {
    if (uid === currentUserId) return `${name} (You)`;
    
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return name;
  };

  // Find active tab display variables for floating bottom bar
  let displayRank = null;
  let displayPnLText = '';
  let displayPnLIsPositive = true;

  if (selectedLeaderboardTab === 'Global') {
    displayRank = currentUserRank;
    displayPnLText = formatPnL(currentUserPnL);
    displayPnLIsPositive = currentUserPnL >= 0;
  } else {
    const compUserStats = compRankings.find(u => u.user_id === currentUserId);
    if (compUserStats) {
      displayRank = compUserStats.rank;
      displayPnLText = `${compUserStats.pnl_percent >= 0 ? '+' : ''}${compUserStats.pnl_percent.toFixed(2)}%`;
      displayPnLIsPositive = compUserStats.pnl_percent >= 0;
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between font-sans text-gray-800">
      <Navbar userName={userName} />

      {/* Main leader board area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 flex-grow w-full pb-36 md:pb-28">
        {/* Back Link */}
        <div className="mb-4 md:mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        {/* Warning Banner for Local Fallback */}
        {isFallbackActive && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start select-none">
            <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-blue-900">SQL View Required for Live Leaderboard</h4>
              <p className="text-[10px] text-blue-800 font-semibold leading-relaxed">
                Currently running in local sandbox database mode. Run the view script in `leaderboard_view.sql` in your Supabase SQL editor to link real-time rankings across all platform users.
              </p>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 select-none">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111111]">
              Leaderboard
            </h1>
            <p className="text-xs md:text-sm text-[#6B7280] mt-1 font-medium">
              {selectedLeaderboardTab === 'Global' ? 'Top performers across PaperPulse' : 'Active competition rankings'}
            </p>
          </div>

          {/* Timeframe selector tabs (Global only) */}
          {selectedLeaderboardTab === 'Global' && (
            <div className="flex bg-[#F3F4F6] p-1 rounded-xl border border-gray-200 w-full sm:w-auto justify-between sm:justify-start">
              {['This Week', 'This Month', 'All Time'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTimeTab(tab)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex-1 sm:flex-initial text-center ${
                    timeTab === tab 
                      ? 'bg-white text-[#111111] shadow-[0_2px_4px_rgba(0,0,0,0.04)] font-bold' 
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Switcher: Global vs Specific Active Competitions */}
        <div className="flex border-b border-[#E5E7EB] mb-6 md:mb-8 overflow-x-auto gap-6 sm:gap-8 text-sm select-none no-scrollbar">
          <button
            onClick={() => setSelectedLeaderboardTab('Global')}
            className={`pb-3 md:pb-4 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap text-xs md:text-sm ${
              selectedLeaderboardTab === 'Global'
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#6B7280] hover:text-[#111111]'
            }`}
          >
            Global Standings
          </button>
          
          {availableComps.map(comp => (
            <button
              key={comp.id}
              onClick={() => setSelectedLeaderboardTab(comp.id)}
              className={`pb-3 md:pb-4 font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer text-xs md:text-sm ${
                selectedLeaderboardTab === comp.id
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#6B7280] hover:text-[#111111]'
              }`}
            >
              🏆 {comp.title}
            </button>
          ))}
        </div>

        {/* Render Loader or content */}
        {selectedLeaderboardTab === 'Global' ? (
          // ---------------- GLOBAL LEADERBOARD VIEW ----------------
          loading ? (
            <div className="py-32 text-center flex flex-col items-center justify-center select-none animate-pulse">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mb-3" />
              <span className="text-xs font-semibold text-gray-400 capitalize">Recalculating standings...</span>
            </div>
          ) : rankedUsers.length > 0 ? (
            <div className="space-y-8 md:space-y-10">
              {/* TOP 3 PODIUM SECTION */}
              <div className="flex flex-row justify-center items-end gap-2 sm:gap-4 md:gap-8 max-w-2xl mx-auto pt-4 md:pt-6 select-none">
                
                {/* #2 Place (Silver) */}
                {secondPlace ? (
                  <div className="flex flex-col items-center flex-1 max-w-[110px] md:max-w-[144px] text-center animate-in slide-in-from-bottom-3 duration-300 order-1">
                    <div className="relative mb-2 md:mb-3">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-500 font-semibold shadow-md">
                        <User className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-gray-300 border border-white text-gray-700 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold shadow-sm">
                        2
                      </div>
                    </div>
                    <span className="text-[11px] md:text-xs font-bold text-[#111111] truncate max-w-full">
                      {getMaskedName(secondPlace.user_name, secondPlace.user_id)}
                    </span>
                    <span className={`text-[10px] md:text-xs font-mono font-bold mt-0.5 ${secondPlace.total_pnl >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {formatPnL(secondPlace.total_pnl)}
                    </span>
                    
                    <div className="w-full bg-[#E5E7EB] border-t-2 border-gray-300 rounded-t-xl h-14 sm:h-20 mt-3 flex items-center justify-center shadow-inner">
                      <span className="text-xl sm:text-2xl font-semibold text-gray-400 select-none">🥈</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 max-w-[110px] md:max-w-[144px] h-14 sm:h-20"></div>
                )}

                {/* #1 Place (Gold - Center/Larger) */}
                {firstPlace ? (
                  <div className="flex flex-col items-center flex-1 max-w-[130px] md:max-w-[176px] text-center z-10 animate-in slide-in-from-bottom-5 duration-300 order-2">
                    <div className="relative mb-2 md:mb-3">
                      <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-amber-50 border-3 md:border-4 border-amber-400 flex items-center justify-center text-amber-500 font-semibold shadow-lg">
                        <Trophy className="w-7 h-7 md:w-10 md:h-10 text-amber-500 animate-bounce" />
                      </div>
                      <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-7 md:h-7 bg-amber-400 border border-white text-white rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold shadow-sm">
                        1
                      </div>
                    </div>
                    <span className="text-xs md:text-sm font-bold text-[#111111] truncate max-w-full">
                      {getMaskedName(firstPlace.user_name, firstPlace.user_id)}
                    </span>
                    <span className={`text-xs md:text-sm font-mono font-bold mt-0.5 ${firstPlace.total_pnl >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {formatPnL(firstPlace.total_pnl)}
                    </span>
                    
                    <div className="w-full bg-[#FCD34D] border-t-2 border-amber-400 rounded-t-xl h-20 sm:h-28 mt-3 flex items-center justify-center shadow-inner">
                      <span className="text-2xl sm:text-3xl font-semibold text-amber-600 select-none">🏆</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 max-w-[130px] md:max-w-[176px] h-20 sm:h-28"></div>
                )}

                {/* #3 Place (Bronze) */}
                {thirdPlace ? (
                  <div className="flex flex-col items-center flex-1 max-w-[110px] md:max-w-[144px] text-center animate-in slide-in-from-bottom-3 duration-300 order-3">
                    <div className="relative mb-2 md:mb-3">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#FFFBEB] border-2 border-amber-600 flex items-center justify-center text-amber-700 font-semibold shadow-md">
                        <User className="w-6 h-6 md:w-8 md:h-8 text-amber-700/60" />
                      </div>
                      <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-amber-600 border border-white text-white rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold shadow-sm">
                        3
                      </div>
                    </div>
                    <span className="text-[11px] md:text-xs font-bold text-[#111111] truncate max-w-full">
                      {getMaskedName(thirdPlace.user_name, thirdPlace.user_id)}
                    </span>
                    <span className={`text-[10px] md:text-xs font-mono font-bold mt-0.5 ${thirdPlace.total_pnl >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                      {formatPnL(thirdPlace.total_pnl)}
                    </span>
                    
                    <div className="w-full bg-[#E5D5C5] border-t-2 border-amber-600 rounded-t-xl h-12 sm:h-16 mt-3 flex items-center justify-center shadow-inner">
                      <span className="text-xl sm:text-2xl font-semibold text-amber-700 select-none">🥉</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 max-w-[110px] md:max-w-[144px] h-12 sm:h-16"></div>
                )}
              </div>

              {/* LEADERBOARD CARDS & TABLE */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
                {/* Mobile Stacked Cards (< md) */}
                <div className="md:hidden divide-y divide-gray-100 p-2 space-y-2">
                  {rankedUsers.map((user) => {
                    const isSelf = user.user_id === currentUserId;
                    const isWinner = user.total_pnl >= 0;
                    return (
                      <div 
                        key={user.user_id} 
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isSelf 
                            ? 'bg-blue-50/60 border-blue-200 shadow-2xs' 
                            : 'bg-gray-50/70 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                              user.rank === 1 ? 'bg-amber-100 text-amber-800' :
                              user.rank === 2 ? 'bg-gray-200 text-gray-800' :
                              user.rank === 3 ? 'bg-amber-700/15 text-amber-900' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {user.rank <= 3 ? (user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉') : `#${user.rank}`}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-gray-900 truncate">
                                  {getMaskedName(user.user_name, user.user_id)}
                                </span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.2 rounded-md text-[9px] bg-blue-100 text-blue-700 font-bold uppercase">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={`text-sm font-mono font-black ${isWinner ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                            {formatPnL(user.total_pnl)}
                          </div>
                        </div>

                        {/* 3 Metrics Row */}
                        <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-xl border border-gray-100 text-[10px]">
                          <div>
                            <span className="text-gray-400 font-medium block">Win Rate</span>
                            <span className="font-mono font-bold text-gray-800">{user.win_rate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium block">Trades</span>
                            <span className="font-mono font-bold text-gray-800">{user.total_trades}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-400 font-medium block">Best Gain</span>
                            <span className="font-mono font-bold text-[#16A34A]">
                              +${user.best_trade.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-sans min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-200 bg-[#F9FAFB]/50 text-gray-400 font-semibold capitalize text-[9px] select-none">
                        <th className="py-3.5 px-6">Rank</th>
                        <th className="py-3.5 px-6">Trader</th>
                        <th className="py-3.5 px-6">Total P&L</th>
                        <th className="py-3.5 px-6 text-center">Win Rate</th>
                        <th className="py-3.5 px-6 text-center">Total Trades</th>
                        <th className="py-3.5 px-6 text-right">Best Trade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {rankedUsers.map((user) => {
                        const isSelf = user.user_id === currentUserId;
                        const isWinner = user.total_pnl >= 0;
                        return (
                          <tr 
                            key={user.user_id} 
                            className={`hover:bg-gray-50/50 transition-colors ${
                              isSelf ? 'bg-blue-50/40 hover:bg-blue-50/60 font-semibold' : ''
                            }`}
                          >
                            <td className="py-4 px-6 font-semibold text-gray-900">
                              {user.rank === 1 ? '🥇 1' : user.rank === 2 ? '🥈 2' : user.rank === 3 ? '🥉 3' : `#${user.rank}`}
                            </td>
                            <td className="py-4 px-6 flex items-center gap-2">
                              <span className="font-semibold text-gray-900 truncate">
                                {getMaskedName(user.user_name, user.user_id)}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-blue-100 text-blue-700 font-semibold capitalize select-none">
                                  You
                                </span>
                              )}
                            </td>
                            <td className={`py-4 px-6 font-mono font-semibold ${isWinner ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                              {formatPnL(user.total_pnl)}
                            </td>
                            <td className="py-4 px-6 text-center font-mono font-semibold">{user.win_rate.toFixed(1)}%</td>
                            <td className="py-4 px-6 text-center font-mono font-semibold">{user.total_trades}</td>
                            <td className="py-4 px-6 text-right font-mono font-semibold text-[#16A34A]">
                              +${user.best_trade.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center select-none animate-fade-in bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 shadow-sm">
                <Trophy className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="font-semibold text-sm text-gray-700">No rankings yet</h3>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed font-semibold">
                Be the first to complete a trade and top the leaderboard!
              </p>
              <div className="mt-6">
                <Link 
                  href="/trade" 
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all cursor-pointer"
                >
                  Go to Trading Terminal <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        ) : (
          // ---------------- COMPETITION LEADERBOARD VIEW ----------------
          compDetailLoading ? (
            <div className="py-32 text-center flex flex-col items-center justify-center select-none animate-pulse">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mb-3" />
              <span className="text-xs font-semibold text-gray-400 capitalize">Loading competition standings...</span>
            </div>
          ) : compRankings.length > 0 ? (
            (() => {
              const cFirst = compRankings.find(u => u.rank === 1);
              const cSecond = compRankings.find(u => u.rank === 2);
              const cThird = compRankings.find(u => u.rank === 3);

              return (
                <div className="space-y-8 md:space-y-10">
                  {/* TOP 3 PODIUM SECTION FOR COMPETITION */}
                  <div className="flex flex-row justify-center items-end gap-2 sm:gap-4 md:gap-8 max-w-2xl mx-auto pt-4 md:pt-6 select-none">
                    
                    {/* #2 Place (Silver) */}
                    {cSecond ? (
                      <div className="flex flex-col items-center flex-1 max-w-[110px] md:max-w-[144px] text-center animate-in slide-in-from-bottom-3 duration-300 order-1">
                        <div className="relative mb-2 md:mb-3">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-gray-500 font-semibold shadow-md">
                            <User className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                          </div>
                          <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-gray-300 border border-white text-gray-700 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold shadow-sm">
                            2
                          </div>
                        </div>
                        <span className="text-[11px] md:text-xs font-bold text-[#111111] truncate max-w-full">
                          {getMaskedName(cSecond.name || 'Trader', cSecond.user_id)}
                        </span>
                        <span className={`text-[10px] md:text-xs font-mono font-bold mt-0.5 ${cSecond.pnl_percent >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          {cSecond.pnl_percent >= 0 ? '+' : ''}{cSecond.pnl_percent.toFixed(2)}%
                        </span>
                        
                        <div className="w-full bg-[#E5E7EB] border-t-2 border-gray-300 rounded-t-xl h-14 sm:h-20 mt-3 flex items-center justify-center shadow-inner">
                          <span className="text-xl sm:text-2xl font-semibold text-gray-400 select-none">🥈</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 max-w-[110px] md:max-w-[144px] h-14 sm:h-20"></div>
                    )}

                    {/* #1 Place (Gold - Center/Larger) */}
                    {cFirst ? (
                      <div className="flex flex-col items-center flex-1 max-w-[130px] md:max-w-[176px] text-center z-10 animate-in slide-in-from-bottom-5 duration-300 order-2">
                        <div className="relative mb-2 md:mb-3">
                          <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-amber-50 border-3 md:border-4 border-amber-400 flex items-center justify-center text-amber-500 font-semibold shadow-lg">
                            <Trophy className="w-7 h-7 md:w-10 md:h-10 text-amber-500 animate-bounce" />
                          </div>
                          <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-7 md:h-7 bg-amber-400 border border-white text-white rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold shadow-sm">
                            1
                          </div>
                        </div>
                        <span className="text-xs md:text-sm font-bold text-[#111111] truncate max-w-full">
                          {getMaskedName(cFirst.name || 'Trader', cFirst.user_id)}
                        </span>
                        <span className={`text-xs md:text-sm font-mono font-bold mt-0.5 ${cFirst.pnl_percent >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          {cFirst.pnl_percent >= 0 ? '+' : ''}{cFirst.pnl_percent.toFixed(2)}%
                        </span>
                        
                        <div className="w-full bg-[#FCD34D] border-t-2 border-amber-400 rounded-t-xl h-20 sm:h-28 mt-3 flex items-center justify-center shadow-inner">
                          <span className="text-2xl sm:text-3xl font-semibold text-amber-600 select-none">🏆</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 max-w-[130px] md:max-w-[176px] h-20 sm:h-28"></div>
                    )}

                    {/* #3 Place (Bronze) */}
                    {cThird ? (
                      <div className="flex flex-col items-center flex-1 max-w-[110px] md:max-w-[144px] text-center animate-in slide-in-from-bottom-3 duration-300 order-3">
                        <div className="relative mb-2 md:mb-3">
                          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#FFFBEB] border-2 border-amber-600 flex items-center justify-center text-amber-700 font-semibold shadow-md">
                            <User className="w-6 h-6 md:w-8 md:h-8 text-amber-700/60" />
                          </div>
                          <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-amber-600 border border-white text-white rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold shadow-sm">
                            3
                          </div>
                        </div>
                        <span className="text-[11px] md:text-xs font-bold text-[#111111] truncate max-w-full">
                          {getMaskedName(cThird.name || 'Trader', cThird.user_id)}
                        </span>
                        <span className={`text-[10px] md:text-xs font-mono font-bold mt-0.5 ${cThird.pnl_percent >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          {cThird.pnl_percent >= 0 ? '+' : ''}{cThird.pnl_percent.toFixed(2)}%
                        </span>
                        
                        <div className="w-full bg-[#E5D5C5] border-t-2 border-amber-600 rounded-t-xl h-12 sm:h-16 mt-3 flex items-center justify-center shadow-inner">
                          <span className="text-xl sm:text-2xl font-semibold text-amber-700 select-none">🥉</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 max-w-[110px] md:max-w-[144px] h-12 sm:h-16"></div>
                    )}
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xs overflow-hidden">
                    {/* Competition Mobile Stacked Cards */}
                    <div className="md:hidden divide-y divide-gray-100 p-2 space-y-2">
                      {compRankings.map((user) => {
                        const isSelf = user.user_id === currentUserId;
                        const isWinner = user.pnl_percent >= 0;
                        return (
                          <div 
                            key={user.id} 
                            className={`p-3.5 rounded-2xl border transition-all ${
                              isSelf 
                                ? 'bg-blue-50/60 border-blue-200 shadow-2xs' 
                                : 'bg-gray-50/70 border-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                                  user.rank === 1 ? 'bg-amber-100 text-amber-800' :
                                  user.rank === 2 ? 'bg-gray-200 text-gray-800' :
                                  user.rank === 3 ? 'bg-amber-700/15 text-amber-900' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {user.rank <= 3 ? (user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉') : `#${user.rank}`}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-gray-900 truncate">
                                    {getMaskedName(user.name, user.user_id)}
                                  </span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.2 rounded-md text-[9px] bg-blue-100 text-blue-700 font-bold uppercase">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className={`text-sm font-mono font-black ${isWinner ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                                {isWinner ? '+' : ''}{user.pnl_percent.toFixed(2)}%
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-xl border border-gray-100 text-[10px]">
                              <div>
                                <span className="text-gray-400 font-medium block">Starting Capital</span>
                                <span className="font-mono font-bold text-gray-600">
                                  ${parseFloat(user.starting_balance).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-400 font-medium block">Current Balance</span>
                                <span className="font-mono font-bold text-gray-900">
                                  ${parseFloat(user.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Competition Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-sans min-w-[700px]">
                        <thead>
                          <tr className="border-b border-gray-200 bg-[#F9FAFB]/50 text-gray-400 font-semibold capitalize text-[9px] select-none">
                            <th className="py-3.5 px-6">Rank</th>
                            <th className="py-3.5 px-6">Trader</th>
                            <th className="py-3.5 px-6 text-right">P&L (%)</th>
                            <th className="py-3.5 px-6 text-right">Starting Balance</th>
                            <th className="py-3.5 px-6 text-right">Current Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {compRankings.map((user) => {
                            const isSelf = user.user_id === currentUserId;
                            const isWinner = user.pnl_percent >= 0;
                            return (
                              <tr 
                                key={user.id} 
                                className={`hover:bg-gray-50/50 transition-colors ${
                                  isSelf ? 'bg-blue-50/40 hover:bg-blue-50/60 font-semibold' : ''
                                }`}
                              >
                                <td className="py-4 px-6 font-semibold text-gray-900">
                                  {user.rank === 1 ? '🥇 1' : user.rank === 2 ? '🥈 2' : user.rank === 3 ? '🥉 3' : `#${user.rank}`}
                                </td>
                                <td className="py-4 px-6 flex items-center gap-2">
                                  <span className="font-semibold text-gray-900 truncate">
                                    {getMaskedName(user.name, user.user_id)}
                                  </span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-blue-100 text-blue-700 font-semibold capitalize select-none">
                                      You
                                    </span>
                                  )}
                                </td>
                                <td className={`py-4 px-6 text-right font-mono font-semibold ${isWinner ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                                  {isWinner ? '+' : ''}{user.pnl_percent.toFixed(2)}%
                                </td>
                                <td className="py-4 px-6 text-right font-mono font-semibold text-gray-400">
                                  ${parseFloat(user.starting_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-4 px-6 text-right font-mono font-semibold text-gray-950">
                                  ${parseFloat(user.current_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center select-none bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 shadow-sm">
                <Trophy className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="font-semibold text-sm text-gray-700">No participants yet</h3>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed font-semibold">
                Be the first to join this competition and claim the top spot!
              </p>
              <div className="mt-6">
                <Link 
                  href="/competitions" 
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1d4ed8] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all cursor-pointer"
                >
                  Go to Competitions Panel <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        )}
      </main>

      {/* Floating Bottom Status Bar for Current User Rank */}
      {displayRank && (
        <div className="fixed bottom-14 md:bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] py-2.5 md:py-3.5 px-4 md:px-6 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] z-40 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-blue-50 text-blue-600 rounded-lg">
                <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#2563EB] fill-[#2563EB]/25" />
              </span>
              <span className="text-[11px] md:text-xs font-bold text-gray-900 capitalize">
                Your Rank ({selectedLeaderboardTab === 'Global' ? timeTab : 'Comp'})
              </span>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-1">
                <span className="text-[11px] md:text-xs text-gray-400 font-semibold">Rank:</span>
                <span className="text-xs md:text-sm font-black text-gray-900">
                  #{displayRank}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] md:text-xs text-gray-400 font-semibold">P&L:</span>
                <span className={`text-xs md:text-sm font-black ${displayPnLIsPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {displayPnLText}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white py-6 select-none">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-semibold">
          <span>&copy; {new Date().getFullYear()} PaperPulse Trading Terminal. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/dashboard" className="hover:text-gray-600">Terminal</Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
