import React from 'react';
import { createClient } from '@/lib/supabase';
import PricingClientPage from './PricingClientPage';

export const metadata = {
  title: 'Pricing & Plans | PaperPulse',
  description: 'Choose the ideal plan for your trading simulation journey. Upgrade to unlock higher limits and exclusive tournaments.',
};

export default async function PricingPage() {
  const supabase = await createClient();

  let user = null;
  let planType = 'free';
  let displayName = 'Trader';

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      user = authData.user;
      
      const { data: dbUser } = await supabase
        .from('users')
        .select('name, plan_type')
        .eq('id', user.id)
        .single();

      if (dbUser) {
        displayName = dbUser.name || user.user_metadata?.name || 'Trader';
        planType = dbUser.plan_type || 'free';
      } else {
        displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'Trader';
      }
    }
  } catch (err) {
    console.error('Error in PricingPage server component:', err);
  }

  return (
    <PricingClientPage 
      user={user ? { id: user.id, email: user.email } : null}
      displayName={displayName}
      planType={planType}
    />
  );
}
