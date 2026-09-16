import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { getActiveWallet } from '@/lib/activeWallet';
import DashboardClientPage from './DashboardClientPage';
import OnboardingBalanceSelector from './OnboardingBalanceSelector';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Resolve authenticated user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // 2. Resolve user details from public.users table
  const { data: dbUser } = await supabase
    .from('users')
    .select('name, email, plan_type')
    .eq('id', user.id)
    .single();

  // Fallback to auth metadata if profile is not fully replicated yet
  const displayName = dbUser?.name || user.user_metadata?.name || 'User';
  const displayEmail = dbUser?.email || user.email;
  const planType = dbUser?.plan_type || 'free';

  // 3. Resolve active wallet details
  const { activeWallet, useLocalFallback } = await getActiveWallet(user.id);
  const balance = parseFloat(activeWallet.virtual_balance || 18427.59);
  const balanceConfigured = activeWallet.balance_configured || false;
  const initialBalance = parseFloat(activeWallet.initial_balance || 15142.19);

  // 4. Fetch trades (with fallback support) scoped by active wallet
  let openPositionsCount = 1;
  let totalClosedPnL = 3285.40;
  let recentTrades = [];

  if (useLocalFallback) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const dbPath = path.join(process.cwd(), 'local_db.json');
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, 'utf8');
        const db = JSON.parse(fileContent);
        const allUserTrades = (db.trades || []).filter(t => t.user_id === user.id);
        const userTrades = allUserTrades.filter(t => {
          if (activeWallet.id && t.wallet_id) {
            return t.wallet_id === activeWallet.id;
          }
          return true;
        });

        if (userTrades.length > 0) {
          openPositionsCount = userTrades.filter(t => t.status === 'open').length;
          totalClosedPnL = userTrades.filter(t => t.status === 'closed').reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
          recentTrades = userTrades.slice(0, 10);
        }
      }
    } catch (err) {
      console.error('Failed to read local trades for dashboard:', err);
    }
  } else {
    try {
      let query = supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id);
      
      if (activeWallet.id) {
        query = query.eq('wallet_id', activeWallet.id);
      }
      
      const { data: dbTrades, error: tradesError } = await query.order('created_at', { ascending: false });

      if (!tradesError && dbTrades && dbTrades.length > 0) {
        openPositionsCount = dbTrades.filter(t => t.status === 'open').length;
        totalClosedPnL = dbTrades.filter(t => t.status === 'closed').reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
        recentTrades = dbTrades.slice(0, 10);
      }
    } catch (err) {
      console.error('Failed to fetch trades for dashboard:', err);
    }
  }

  return (
    <>
      <DashboardClientPage
        userName={displayName}
        userEmail={displayEmail}
        planType={planType}
        balance={balance}
        initialBalance={initialBalance}
        totalClosedPnL={totalClosedPnL}
        openPositionsCount={openPositionsCount}
        recentTrades={recentTrades}
      />
      {!balanceConfigured && (
        <OnboardingBalanceSelector />
      )}
    </>
  );
}
