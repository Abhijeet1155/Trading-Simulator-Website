import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { getActiveWallet } from '@/lib/activeWallet';

export async function POST(request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // 2. Parse request body
    const body = await request.json();
    const { amount, name } = body;
    const numAmount = parseFloat(amount);
    const trimmedName = name ? name.trim().substring(0, 30) : '';

    if (isNaN(numAmount) || numAmount < 100 || numAmount > 1000000) {
      return NextResponse.json({ error: 'Invalid amount. Minimum is $100 and maximum is $1,000,000.' }, { status: 400 });
    }

    if (trimmedName.length > 30) {
      return NextResponse.json({ error: 'Account name cannot exceed 30 characters.' }, { status: 400 });
    }

    // Resolve active wallet first
    const { activeWallet } = await getActiveWallet(user.id);

    // 3. Update active wallet in Supabase using Admin Client
    const { data, error: updateErr } = await supabaseAdmin
      .from('wallets')
      .update({
        virtual_balance: numAmount,
        initial_balance: numAmount,
        balance_configured: true,
        account_name: trimmedName || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', activeWallet.id)
      .select();

    if (updateErr || !data || data.length === 0) {
      console.error('[Wallets Onboard API Error]:', updateErr);
      return NextResponse.json({ error: updateErr?.message || 'Failed to update starting balance' }, { status: 500 });
    }

    return NextResponse.json({ success: true, balance: numAmount });
  } catch (error) {
    console.error('[Wallets Onboard API Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

