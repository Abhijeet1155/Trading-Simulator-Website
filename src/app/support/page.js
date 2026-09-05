import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import SupportClientPage from './SupportClientPage';

export const metadata = {
  title: 'Support & Help Center | PaperPulse',
  description: 'Frequently asked questions, guides, and dedicated support for the PaperPulse trading simulator.',
};

export default async function SupportPage() {
  const supabase = await createClient();

  let displayName = 'Trader';
  let email = '';

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      email = user.email || '';
      const { data: dbUser } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single();
      displayName = dbUser?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Trader';
    }
  } catch (err) {
    console.error('Error fetching user for support page:', err);
  }

  return (
    <SupportClientPage 
      userName={displayName}
      userEmail={email}
    />
  );
}
