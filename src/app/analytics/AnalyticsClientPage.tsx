'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

interface AnalyticsClientPageProps {
  userName: string;
  userId: string;
}

export default function AnalyticsClientPage({ userName, userId }: AnalyticsClientPageProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar userName={userName} />

      {/* Analytics Suite */}
      <main className="flex-1">
        <AnalyticsDashboard />
      </main>
    </div>
  );
}
