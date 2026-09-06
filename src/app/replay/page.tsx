import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import ReplayClientPage from './ReplayClientPage';

export const metadata = {
  title: 'Bar Replay Simulator | PaperPulse',
  description: 'Interactive high-performance Bar Replay and forward-testing simulator with scissors cut mode, continuous candle playback, and in-replay paper execution.',
};

export default async function ReplayPage() {
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
    <ReplayClientPage
      userName={displayName}
      userId={user.id}
    />
  );
}
