import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const { walletId } = body;

    if (!walletId) {
      return NextResponse.json({ error: 'walletId is required.' }, { status: 400 });
    }

    // 2. Fetch all user wallets
    let wallets = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('user_id', user.id);
      if (!error && data) wallets = data;
    } catch (e) {}

    const localDbPath = path.join(process.cwd(), 'local_db.json');
    if (wallets.length === 0 && fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        wallets = db.wallets_multi?.filter(w => w.user_id === user.id) || [];
      } catch (e) {}
    }

    // 3. Verify user has at least 2 accounts to delete one
    if (wallets.length <= 1) {
      return NextResponse.json({ 
        error: 'Cannot delete your only trading account. You must maintain at least one active account.' 
      }, { status: 400 });
    }

    const targetWallet = wallets.find(w => w.id === walletId);
    if (!targetWallet) {
      return NextResponse.json({ error: 'Account not found or access denied.' }, { status: 404 });
    }

    // 4. Delete trades associated with this wallet
    try {
      await supabaseAdmin
        .from('trades')
        .delete()
        .eq('wallet_id', walletId)
        .eq('user_id', user.id);
    } catch (e) {}

    // 5. Delete from accounts_setup if referenced
    if (targetWallet.account_setup_id) {
      try {
        await supabaseAdmin
          .from('accounts_setup')
          .delete()
          .eq('id', targetWallet.account_setup_id);
      } catch (e) {}
    }

    // 6. Delete from wallets in Supabase
    try {
      await supabaseAdmin
        .from('wallets')
        .delete()
        .eq('id', walletId)
        .eq('user_id', user.id);
    } catch (e) {}

    // 7. Delete from local_db.json if present
    if (fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        if (db.wallets_multi) {
          db.wallets_multi = db.wallets_multi.filter(w => !(w.id === walletId && w.user_id === user.id));
        }
        if (db.trades) {
          db.trades = db.trades.filter(t => !(t.wallet_id === walletId && t.user_id === user.id));
        }
        fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
      } catch (e) {}
    }

    // 8. If the deleted wallet was active, switch to next available wallet
    const cookieStore = await cookies();
    const activeWalletId = cookieStore.get('pp_active_wallet_id')?.value;
    
    const remainingWallets = wallets.filter(w => w.id !== walletId);
    let newActiveId = activeWalletId;

    if (activeWalletId === walletId || !remainingWallets.some(w => w.id === activeWalletId)) {
      newActiveId = remainingWallets[0]?.id;
      if (newActiveId) {
        cookieStore.set('pp_active_wallet_id', newActiveId, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      deletedId: walletId, 
      activeWalletId: newActiveId,
      remainingCount: remainingWallets.length 
    });
  } catch (error) {
    console.error('[Account Delete API Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
