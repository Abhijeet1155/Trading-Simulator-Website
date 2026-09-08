'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import TradingJournal from '@/components/journal/TradingJournal';

interface JournalClientPageProps {
  userName: string;
  userId: string;
}

export default function JournalClientPage({ userName, userId }: JournalClientPageProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#121212] text-gray-900 dark:text-neutral-100 flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Platform Navigation */}
      <Navbar userName={userName} />

      {/* Main Journal Workspace */}
      <main className="flex-1">
        <TradingJournal />
      </main>
    </div>
  );
}
