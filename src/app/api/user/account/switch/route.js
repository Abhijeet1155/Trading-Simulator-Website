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

    // 2. Parse walletId
    const body = await request.json();
    const { walletId } = body;
    if (!walletId) {
      return NextResponse.json({ error: 'walletId is required' }, { status: 400 });
    }

    // 3. Verify wallet ownership
    const { data: ownWallet, error: fetchError } = await supabaseAdmin
      .from('wallets')
      .select('id')
      .eq('id', walletId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('[Account Switch API Error]:', fetchError);
      return NextResponse.json({ error: fetchError.message || 'Error verifying account' }, { status: 500 });
    }

    if (!ownWallet) {
      return NextResponse.json({ error: 'Wallet not found or access denied' }, { status: 404 });
    }

    // 4. Set cookie
    const cookieStore = await cookies();
    cookieStore.set('pp_active_wallet_id', walletId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true, activeWalletId: walletId });
  } catch (error) {
    console.error('[Account Switch API Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

