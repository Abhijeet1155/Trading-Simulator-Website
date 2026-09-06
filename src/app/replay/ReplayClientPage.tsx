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
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar userName={userName} />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-5">
        
        {/* Header Title & Intro Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                  Bar Replay Simulator
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  REAL-TIME ENGINE
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Practice forward-testing with zero forward-looking bias. Cut historical charts at key ICT sessions and execute simulated positions.
              </p>
            </div>
          </div>

          {/* Quick Feature Chips */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600">
              <Scissors className="w-3.5 h-3.5 text-amber-600" />
              <span>Scissors Cut Mode</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Auto SL / TP Triggers</span>
            </div>
            <Link
              href="/journal"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition-colors"
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

