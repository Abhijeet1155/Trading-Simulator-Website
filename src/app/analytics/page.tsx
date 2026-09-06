import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import AnalyticsClientPage from './AnalyticsClientPage';

export const metadata = {
  title: 'Quantitative Analytics Suite | PaperPulse',
  description: 'Institutional-grade quantitative trading analytics: Sharpe ratio, PnL heatmaps, 4-pillar performance radars, R:R scatter plots, and Monte Carlo equity projections.',
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // 1. Authenticate user from session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Fetch user profile name
  let dbUser = null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();
    if (!error && data) {
      dbUser = data;
    }
  } catch (err) {
    // Ignore profile fetch errors
  }

  const displayName = dbUser?.name || user.user_metadata?.name || 'Trader';

  return (
    <AnalyticsClientPage
      userName={displayName}
      userId={user.id}
    />
  );
}
