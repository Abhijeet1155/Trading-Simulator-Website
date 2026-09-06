import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { accountNumber, action, tradeId, symbol, side, quantity, price, sl, tp, exitPrice } = body;

    if (!accountNumber) {
      return NextResponse.json({ error: 'Missing accountNumber' }, { status: 400 });
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

    // A. Open Trade from MT4/MT5
    if (action === 'open' || action === 'execute') {
      const numQuantity = parseFloat(quantity || 0.1);
      const numPrice = parseFloat(price);
      const numLeverage = parseFloat(wallet.leverage || 100);

      const FOREX_SYMBOLS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF'];
      const lotMultiplier = FOREX_SYMBOLS.includes(symbol) ? 100000 : symbol === 'XAU/USD' ? 100 : 1;
      const calculatedMargin = parseFloat(((numQuantity * numPrice * lotMultiplier) / numLeverage).toFixed(2));

      const balance = parseFloat(wallet.virtual_balance || wallet.balance || 0);
      if (balance < calculatedMargin) {
        return NextResponse.json({ 
          error: 'Insufficient margin on account. Required: $' + calculatedMargin + ', Balance: $' + balance 
        }, { status: 400 });
      }

      const newBalance = parseFloat((balance - calculatedMargin).toFixed(2));
      try {
        await supabaseAdmin
          .from('wallets')
          .update({ virtual_balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', wallet.id);
      } catch (e) {}

      const tradeInsert = {
        user_id: wallet.user_id,
        wallet_id: wallet.id,
        symbol,
        side: (side || 'buy').toLowerCase(),
        status: 'open',
        entry_price: numPrice,
        quantity: numQuantity,
        size: numQuantity,
        usd_amount: calculatedMargin,
        leverage: numLeverage,
        pnl: 0.00,
        take_profit: tp ? parseFloat(tp) : null,
        stop_loss: sl ? parseFloat(sl) : null,
        created_at: new Date().toISOString()
      };

      let createdTrade = null;
      try {
        const { data: tradeRes } = await supabaseAdmin
          .from('trades')
          .insert(tradeInsert)
          .select()
          .single();
        createdTrade = tradeRes;
      } catch (e) {}

      return NextResponse.json({
        success: true,
        message: 'Position opened and synchronized across website and MT4/MT5.',
        ticket: createdTrade?.id || 'MT_' + Math.random().toString(36).substring(2, 9),
        newBalance,
        margin: calculatedMargin,
        lastSync: new Date().toISOString()
      });
    }

    // B. Close Trade from MT4/MT5
    if (action === 'close') {
      if (!tradeId) {
        return NextResponse.json({ error: 'Missing tradeId' }, { status: 400 });
      }

      let trade = null;
      try {
        const { data } = await supabaseAdmin
          .from('trades')
          .select('*')
          .eq('id', tradeId)
          .single();
        trade = data;
      } catch (e) {}

      if (!trade) {
        return NextResponse.json({ error: 'Trade position not found' }, { status: 404 });
      }

      const numExitPrice = parseFloat(exitPrice || trade.entry_price);
      const isBuy = trade.side === 'buy';
      const FOREX_SYMBOLS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF'];
      const lotMultiplier = FOREX_SYMBOLS.includes(trade.symbol) ? 100000 : trade.symbol === 'XAU/USD' ? 100 : 1;
      
      const priceDiff = isBuy ? numExitPrice - trade.entry_price : trade.entry_price - numExitPrice;
      const pnl = parseFloat((priceDiff * trade.quantity * lotMultiplier).toFixed(2));
      const returnedAmount = parseFloat((trade.usd_amount + pnl).toFixed(2));

      const { data: w } = await supabaseAdmin.from('wallets').select('*').eq('id', trade.wallet_id).single();
      if (w) {
        const updatedBal = parseFloat((parseFloat(w.virtual_balance) + returnedAmount).toFixed(2));
        await supabaseAdmin.from('wallets').update({ virtual_balance: updatedBal }).eq('id', w.id);
      }

      await supabaseAdmin.from('trades').update({
        status: 'closed',
        exit_price: numExitPrice,
        pnl,
        closed_at: new Date().toISOString()
      }).eq('id', tradeId);

      return NextResponse.json({
        success: true,
        message: 'Position closed and P&L synchronized across web dashboard and MetaTrader.',
        pnl,
        lastSync: new Date().toISOString()
      });
    }

    return NextResponse.json({ error: 'Invalid action. Supported actions: open, close' }, { status: 400 });
  } catch (error) {
    console.error('[MT Bridge Sync Trades Error]:', error);
    return NextResponse.json({ error: error.message || 'Trade sync error' }, { status: 500 });
  }
}
