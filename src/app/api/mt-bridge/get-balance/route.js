import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountNumber = searchParams.get('accountNumber') || searchParams.get('login');

    if (!accountNumber) {
      return NextResponse.json({ error: 'Missing accountNumber parameter' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const localDbPath = path.join(process.cwd(), 'local_db.json');

    let wallet = null;
    try {
      const { data } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('account_number', String(accountNumber))
        .maybeSingle();
      wallet = data;
    } catch (e) {}

    if (!wallet && fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        wallet = (db.wallets_multi || []).find(w => w.account_number === String(accountNumber));
      } catch (e) {}
    }

    if (!wallet) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    let openTrades = [];
    try {
      const { data } = await supabaseAdmin
        .from('trades')
        .select('*')
        .eq('wallet_id', wallet.id)
        .eq('status', 'open');
      if (data) openTrades = data;
    } catch (e) {}

    const balance = parseFloat(wallet.virtual_balance || wallet.balance || 0);
    const usedMargin = openTrades.reduce((sum, t) => sum + parseFloat(t.usd_amount || 0), 0);
    const floatingPnl = openTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
    const equity = parseFloat((balance + usedMargin + floatingPnl).toFixed(2));
    const freeMargin = parseFloat((equity - usedMargin).toFixed(2));
    const marginLevel = usedMargin > 0 ? parseFloat(((equity / usedMargin) * 100).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      accountNumber: wallet.account_number,
      currency: wallet.currency || 'USD',
      balance: balance,
      equity: equity,
      margin: usedMargin,
      freeMargin: freeMargin,
      marginLevel: marginLevel + '%',
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MT Bridge Get Balance Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal balance fetch error' }, { status: 500 });
  }
}
