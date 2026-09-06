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

    return NextResponse.json({
      success: true,
      accountNumber: wallet.account_number,
      totalPositions: openTrades.length,
      positions: openTrades.map(t => ({
        ticket: t.id,
        symbol: t.symbol,
        type: (t.side || 'buy').toUpperCase(),
        lots: parseFloat(t.quantity || t.size || 0),
        openPrice: parseFloat(t.entry_price || 0),
        sl: t.stop_loss ? parseFloat(t.stop_loss) : null,
        tp: t.take_profit ? parseFloat(t.take_profit) : null,
        margin: parseFloat(t.usd_amount || 0),
        pnl: parseFloat(t.pnl || 0),
        openTime: t.opened_at || t.created_at
      })),
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MT Bridge Get Positions Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal positions fetch error' }, { status: 500 });
  }
}
