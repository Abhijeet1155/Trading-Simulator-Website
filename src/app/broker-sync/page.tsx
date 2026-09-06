import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import BrokerSync from '@/components/broker/BrokerSync';

export const metadata = {
  title: 'MetaTrader 5 Broker Sync & Bridge | PaperPulse',
  description: 'Connect your MetaTrader 5 accounts via read-only investor credentials to auto-import closed trades directly to your Journal and Analytics.',
};

export default async function BrokerSyncPage() {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // 2. Fetch user profile name
  const { data: dbUser } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', user.id)
    .maybeSingle();

  const displayName = dbUser?.name || user.user_metadata?.name || 'Trader';

  return (
    <BrokerSync 
      userName={displayName}
      userId={user.id}
    />
  );
}
