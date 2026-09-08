'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import BarReplayEngine from '@/components/replay/BarReplayEngine';
import { 
  PlayCircle, 
  Scissors, 
  Zap, 
  History, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

interface ReplayClientPageProps {
  userName: string;
  userId: string;
}

export default function ReplayClientPage({ userName, userId }: ReplayClientPageProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#121212] text-gray-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar userName={userName} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-5">
        
        {/* Header Title & Intro Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-4 sm:p-5 shadow-xs transition-colors duration-200">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-blue-400 shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Bar Replay Simulator
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                  REAL-TIME ENGINE
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                Practice forward-testing with zero forward-looking bias. Cut historical charts at key ICT sessions and execute simulated positions.
              </p>
            </div>
          </div>

          {/* Quick Feature Chips */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300">
              <Scissors className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Scissors Cut Mode</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300">
              <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Auto SL / TP Triggers</span>
            </div>
            <Link
              href="/journal"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 transition-colors"
            >
              <span>Journal Logs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Core Bar Replay Engine */}
        <BarReplayEngine />

      </main>
    </div>
  );
}
