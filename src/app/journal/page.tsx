import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import JournalClientPage from './JournalClientPage';

export const metadata = {
  title: 'Trading Journal & Playbook | PaperPulse',
  description: 'Log, inspect, and analyze institutional trades with entry/exit precision, partial scale-outs, SMC/ICT tags, and high-res chart snapshots.',
};

export default async function JournalPage() {
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
    <JournalClientPage
      userName={displayName}
      userId={user.id}
    />
  );
}
