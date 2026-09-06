import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import NewsClientPage from './NewsClientPage';

export const metadata = {
  title: 'Economic Calendar & Crypto News | PaperPulse',
  description: 'Track global macroeconomic data, forex announcements, interest rate decisions, and real-time cryptocurrency news with integrated trading notes.',
};

export default async function NewsPage() {
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
    <NewsClientPage 
      userName={displayName} 
      userId={user.id} 
    />
  );
}
