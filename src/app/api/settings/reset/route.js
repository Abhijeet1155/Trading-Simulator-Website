import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { getActiveWallet } from '@/lib/activeWallet';

export async function POST(request) {
  const supabase = await createClient();
  
  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { activeWallet } = await getActiveWallet(user.id);
    const initialBalance = parseFloat(activeWallet.initial_balance || 10000.00);

    // 1. Reset virtual_balance to initialBalance
    const { error: walletError } = await supabaseAdmin
      .from('wallets')
      .update({ virtual_balance: initialBalance, updated_at: new Date().toISOString() })
      .eq('id', activeWallet.id);

    if (walletError) {
      console.error('[Settings Reset] Wallet update error:', walletError);
      throw new Error(`Failed to reset wallet balance: ${walletError.message}`);
    }

    // 2. Clear open positions in Supabase
    let query = supabaseAdmin
      .from('trades')
      .delete()
      .eq('user_id', user.id)
      .eq('status', 'open');
    
    if (activeWallet.id === user.id) {
      query = query.or(`wallet_id.eq.${activeWallet.id},wallet_id.is.null`);
    } else {
      query = query.eq('wallet_id', activeWallet.id);
    }

    let { error: tradesError } = await query;
    
    // Fallback if wallet_id column doesn't exist in trades table yet
    if (tradesError && (tradesError.message?.includes('column') || tradesError.message?.includes('wallet_id'))) {
      const fallbackDelete = await supabaseAdmin
        .from('trades')
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'open');
      tradesError = fallbackDelete.error;
    }

    if (tradesError) {
      console.error('[Settings Reset] Trades delete error:', tradesError);
      throw new Error(`Failed to clear open trades: ${tradesError.message}`);
    }

    return NextResponse.json({
      message: 'Demo account balance reset and open positions cleared successfully',
      newBalance: initialBalance
    });
  } catch (error) {
    console.error('[Settings Reset API Error]:', error);
    return NextResponse.json({ error: error.message || 'Reset failed' }, { status: 500 });
  }
}

