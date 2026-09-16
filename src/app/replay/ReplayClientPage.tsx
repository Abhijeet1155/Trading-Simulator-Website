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
    <div className="h-screen w-screen bg-[#F8FAFC] dark:bg-[#121212] text-gray-900 dark:text-neutral-100 flex flex-col font-sans overflow-hidden select-none transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar userName={userName} />

      {/* Main Trading Workstation (APEX TRADER Style) */}
      <main className="flex-1 w-full overflow-hidden flex flex-col">
        <BarReplayEngine />
      </main>
    </div>
  );
}


