import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { getActiveWallet } from '@/lib/activeWallet';
import { 
  getAccountTypes, 
  ALLOWED_LEVERAGES, 
  SUPPORTED_CURRENCIES, 
  SUPPORTED_PLATFORMS, 
  SUPPORTED_EXECUTION_TYPES 
} from '@/lib/accountTypes';

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Resolve plan type
    let planType = 'free';
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('plan_type')
        .eq('id', user.id)
        .single();
      if (dbUser && dbUser.plan_type) {
        planType = dbUser.plan_type.toLowerCase();
      }
    } catch (e) {
      // ignore
    }

    const maxLimit = planType === 'premium' ? 10 : 5;

    // 3. Resolve active wallet and list of wallets
    const { activeWallet, wallets, useLocalFallback } = await getActiveWallet(user.id);
    const accountTypes = await getAccountTypes();

    // 4. Fetch open trades to calculate floating P&L and Margin per account
    let openTrades = [];
    const supabaseAdmin = createAdminClient();
    try {
      const { data: tradesData } = await supabaseAdmin
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open');
      if (tradesData) openTrades = tradesData;
    } catch (e) {}

    if (useLocalFallback || openTrades.length === 0) {
      const fs = require('fs');
      const path = require('path');
      const localDbPath = path.join(process.cwd(), 'local_db.json');
      if (fs.existsSync(localDbPath)) {
        try {
          const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
          openTrades = db.trades?.filter(t => t.user_id === user.id && t.status === 'open') || [];
        } catch (e) {}
      }
    }

    const formattedAccounts = wallets.map(w => {
      const type = w.account_type === 'standard_micro' ? 'standard_cent' : (w.account_type || 'standard');
      const lev = parseInt(w.leverage || 100, 10);
      const typeDetails = accountTypes.find(t => t.id === type) || accountTypes[0];
      const isPrimary = w.id === user.id || w.account_name === 'Primary Demo';

      // Find trades for this wallet
      const walletTrades = openTrades.filter(t => 
        t.wallet_id === w.id || (!t.wallet_id && isPrimary)
      );

      const margin = walletTrades.reduce((sum, t) => sum + parseFloat(t.usd_amount || 0), 0);
      const balance = parseFloat(w.virtual_balance || w.balance || 0);
      const equity = parseFloat((balance + margin).toFixed(2));
      const nickname = w.nickname || w.account_name || `Account #${w.account_number}`;

      return {
        id: w.id,
        accountNumber: w.account_number,
        accountName: nickname,
        nickname: nickname,
        balance: balance,
        initialBalance: parseFloat(w.initial_balance || w.starting_balance || 10000.00),
        equity: equity,
        margin: parseFloat(margin.toFixed(2)),
        isConfigured: w.balance_configured,
        isActive: w.id === activeWallet.id,
        accountType: type,
        leverage: lev,
        currency: w.currency || 'USD',
        executionType: w.execution_type || 'Market',
        platform: w.platform || 'MT5',
        isDemo: w.is_demo !== undefined ? w.is_demo : true,
        accountTypeDetails: typeDetails,
        createdAt: w.created_at || w.updated_at || new Date().toISOString()
      };
    });

    const activeAccountType = activeWallet.account_type === 'standard_micro' ? 'standard_cent' : (activeWallet.account_type || 'standard');
    const activeLeverage = parseInt(activeWallet.leverage || 100, 10);
    const activeTypeDetails = accountTypes.find(t => t.id === activeAccountType) || accountTypes[0];
    const activeNickname = activeWallet.nickname || activeWallet.account_name || `Demo #${activeWallet.account_number}`;
    const activeBal = parseFloat(activeWallet.virtual_balance || activeWallet.balance || 0);

    const activeObj = formattedAccounts.find(a => a.id === activeWallet.id) || {
      id: activeWallet.id,
      accountNumber: activeWallet.account_number,
      accountName: activeNickname,
      nickname: activeNickname,
      balance: activeBal,
      initialBalance: parseFloat(activeWallet.initial_balance || 10000.00),
      equity: activeBal,
      margin: 0,
      isConfigured: activeWallet.balance_configured,
      accountType: activeAccountType,
      leverage: activeLeverage,
      currency: activeWallet.currency || 'USD',
      executionType: activeWallet.execution_type || 'Market',
      platform: activeWallet.platform || 'MT5',
      isDemo: activeWallet.is_demo !== undefined ? activeWallet.is_demo : true,
      accountTypeDetails: activeTypeDetails,
      isActive: true
    };

    return NextResponse.json({
      accountNumber: activeWallet.account_number,
      accountName: activeNickname,
      nickname: activeNickname,
      balance: activeBal,
      accountType: activeAccountType,
      leverage: activeLeverage,
      currency: activeWallet.currency || 'USD',
      executionType: activeWallet.execution_type || 'Market',
      platform: activeWallet.platform || 'MT5',
      isDemo: activeWallet.is_demo !== undefined ? activeWallet.is_demo : true,
      accountTypeDetails: activeTypeDetails,
      activeAccount: activeObj,
      accounts: formattedAccounts,
      accountTypes,
      allowedLeverages: ALLOWED_LEVERAGES,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      supportedPlatforms: SUPPORTED_PLATFORMS,
      supportedExecutionTypes: SUPPORTED_EXECUTION_TYPES,
      limitReached: wallets.length >= maxLimit,
      maxLimit
    });

  } catch (error) {
    console.error('Error fetching user account details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  let walletId = searchParams.get('walletId') || searchParams.get('id');
  if (!walletId) {
    try {
      const body = await request.json();
      walletId = body.walletId || body.id;
    } catch (e) {}
  }

  const { POST } = await import('./delete/route');
  const dummyReq = {
    json: async () => ({ walletId })
  };
  return POST(dummyReq);
}
