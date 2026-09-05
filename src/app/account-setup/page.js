import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { getActiveWallet } from '@/lib/activeWallet';
import { getAccountTypes } from '@/lib/accountTypes';
import AccountSetupClient from './AccountSetupClient';

export const metadata = {
  title: 'Account Setup & Management | PaperPulse',
  description: 'Create and configure your multi-tier trading accounts, customize leverage, spread types, and trading platforms.',
};

export default async function AccountSetupPage() {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // 2. Fetch user profile
  const { data: dbUser } = await supabase
    .from('users')
    .select('name, email, plan_type')
    .eq('id', user.id)
    .single();

  const displayName = dbUser?.name || user.user_metadata?.name || 'Trader';
  const planType = dbUser?.plan_type || 'free';

  // 3. Resolve active wallet and user wallets
  const { activeWallet, wallets } = await getActiveWallet(user.id);
  const accountTypes = await getAccountTypes();

  const formattedAccounts = wallets.map(w => {
    const type = w.account_type === 'standard_micro' ? 'standard_cent' : (w.account_type || 'standard');
    const lev = parseInt(w.leverage || 100, 10);
    const typeDetails = accountTypes.find(t => t.id === type) || accountTypes[0];
    const nickname = w.nickname || w.account_name || `Demo #${w.account_number}`;
    const balance = parseFloat(w.virtual_balance || w.balance || 0);

    return {
      id: w.id,
      accountNumber: w.account_number,
      accountName: nickname,
      nickname: nickname,
      balance: balance,
      initialBalance: parseFloat(w.initial_balance || w.starting_balance || 10000.00),
      equity: balance,
      margin: 0,
      isConfigured: w.balance_configured,
      isActive: w.id === activeWallet.id,
      accountType: type,
      leverage: lev,
      currency: w.currency || 'USD',
      executionType: w.execution_type || 'Market',
      platform: w.platform || 'MT5',
      isDemo: w.is_demo !== undefined ? w.is_demo : true,
      accountTypeDetails: typeDetails
    };
  });

  return (
    <AccountSetupClient 
      initialUserData={{
        id: user.id,
        name: displayName,
        email: user.email,
        planType: planType
      }}
      initialAccounts={formattedAccounts}
      initialAccountTypes={accountTypes}
    />
  );
}
