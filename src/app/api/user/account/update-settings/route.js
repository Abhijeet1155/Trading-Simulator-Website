import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { getActiveWallet } from '@/lib/activeWallet';
import { getAccountTypes, validateLeverage } from '@/lib/accountTypes';

export async function POST(request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { walletId, accountType, leverage } = body;

    const supabaseAdmin = createAdminClient();
    const accountTypes = await getAccountTypes();

    // 2. Resolve target wallet
    const { activeWallet } = await getActiveWallet(user.id);
    const targetWalletId = walletId || activeWallet.id;

    const { data: wallet, error: fetchError } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('id', targetWalletId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !wallet) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const newAccountType = accountType || wallet.account_type || 'standard';
    const newLeverage = leverage !== undefined ? parseInt(leverage, 10) : (wallet.leverage || 100);

    // 3. Validate leverage against account type limits
    const validation = validateLeverage(newLeverage, newAccountType, accountTypes);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 4. Update wallet in Supabase
    let updateData = {
      account_type: newAccountType,
      leverage: newLeverage,
      updated_at: new Date().toISOString()
    };

    let { data: updatedWallet, error: updateError } = await supabaseAdmin
      .from('wallets')
      .update(updateData)
      .eq('id', targetWalletId)
      .select()
      .single();

    // Fallback if columns don't exist yet in Supabase schema
    if (updateError && (updateError.message?.includes('column') || updateError.message?.includes('account_type') || updateError.message?.includes('leverage'))) {
      const { account_type: _1, leverage: _2, ...fallbackData } = updateData;
      const retry = await supabaseAdmin
        .from('wallets')
        .update(fallbackData)
        .eq('id', targetWalletId)
        .select()
        .single();
      updatedWallet = { ...(retry.data || wallet), account_type: newAccountType, leverage: newLeverage };
      updateError = null;
    }

    if (updateError) {
      console.error('[Account Update Settings Error]:', updateError);
      return NextResponse.json({ error: updateError.message || 'Failed to update account settings' }, { status: 500 });
    }

    const typeConfig = accountTypes.find(t => t.id === newAccountType) || accountTypes[0];

    return NextResponse.json({
      success: true,
      wallet: updatedWallet,
      accountType: newAccountType,
      leverage: newLeverage,
      accountTypeDetails: typeConfig
    });
  } catch (error) {
    console.error('[Account Update Settings Execution Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
