import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';

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
    const trimmedName = name ? name.trim().substring(0, 50) : '';

    if (isNaN(numAmount) || numAmount < 100 || numAmount > 1000000) {
      return NextResponse.json({ error: 'Invalid amount. Minimum is $100 and maximum is $1,000,000.' }, { status: 400 });
    }

    // 3. Resolve user plan type
    let planType = 'free';
    try {
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('plan_type')
        .eq('id', user.id)
        .single();
      if (dbUser && dbUser.plan_type) {
        planType = dbUser.plan_type.toLowerCase();
      }
    } catch (e) {
      // default to free
    }

    // Define account limits based on plan
    const maxAccounts = planType === 'premium' ? 5 : 2;

    // 4. Fetch existing wallets
    const { data: existingWalletsData, error: walletsFetchError } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', user.id);

    if (walletsFetchError) {
      console.error('[Account Create] Error fetching user wallets:', walletsFetchError);
      return NextResponse.json({ error: 'Failed to retrieve user accounts.' }, { status: 500 });
    }

    const existingWallets = existingWalletsData || [];

    // Check account limit
    if (existingWallets.length >= maxAccounts) {
      const planMsg = planType === 'premium' 
        ? 'Maximum limit of 5 demo accounts reached for Premium plan.' 
        : 'Maximum limit of 2 demo accounts reached for Free plan. Upgrade to Premium for more accounts!';
      return NextResponse.json({ error: planMsg }, { status: 400 });
    }

    // 5. Generate a unique 6-digit account number
    let newAccountNumber = '';
    let collision = true;
    let attempts = 0;
    while (collision && attempts < 20) {
      attempts++;
      const randNum = String(Math.floor(100000 + Math.random() * 900000));
      
      const { data } = await supabaseAdmin
        .from('wallets')
        .select('id')
        .eq('account_number', randNum)
        .maybeSingle();
      
      if (!data) {
        newAccountNumber = randNum;
        collision = false;
      }
    }

    if (!newAccountNumber) {
      newAccountNumber = String(Math.floor(100000 + Math.random() * 900000));
    }

    // 6. Create new account
    const { data: createdWallet, error: insertError } = await supabaseAdmin
      .from('wallets')
      .insert({
        user_id: user.id,
        account_number: newAccountNumber,
        account_name: trimmedName || null,
        virtual_balance: numAmount,
        currency: 'USD',
        initial_balance: numAmount,
        balance_configured: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError || !createdWallet) {
      console.error('[Account Create API Error]:', insertError);
      return NextResponse.json({ error: insertError?.message || 'Failed to create demo account' }, { status: 500 });
    }

    // 7. Set cookie to make it the active wallet
    const cookieStore = await cookies();
    cookieStore.set('pp_active_wallet_id', createdWallet.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true, wallet: createdWallet });
  } catch (error) {
    console.error('[Account Create API Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

