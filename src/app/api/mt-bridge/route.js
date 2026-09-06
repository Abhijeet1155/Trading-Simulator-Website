import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function generateDemoPassword(accountNumber, secretSalt = 'paperpulse_meta_salt') {
  return 'MT5_' + crypto.createHash('md5').update(String(accountNumber) + '_' + secretSalt).digest('hex').substring(0, 8).toUpperCase();
}

function getInvestorPassword(accountNumber, secretSalt = 'investor_salt') {
  return 'INV_' + crypto.createHash('md5').update(String(accountNumber) + '_' + secretSalt).digest('hex').substring(0, 6).toUpperCase();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountNumber = searchParams.get('accountNumber') || searchParams.get('account_number');
    const walletId = searchParams.get('walletId') || searchParams.get('wallet_id');

    if (!accountNumber && !walletId) {
      return NextResponse.json({ error: 'Missing accountNumber or walletId parameter' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    let wallet = null;

    if (accountNumber) {
      const { data } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('account_number', accountNumber)
        .maybeSingle();
      wallet = data;
    } else if (walletId) {
      const { data } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('id', walletId)
        .maybeSingle();
      wallet = data;
    }

    const localDbPath = path.join(process.cwd(), 'local_db.json');
    if (!wallet && fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        wallet = (db.wallets_multi || []).find(w => 
          (accountNumber && w.account_number === accountNumber) || (walletId && w.id === walletId)
        );
      } catch (e) {}
    }

    if (!wallet) {
      return NextResponse.json({ error: 'Trading account not found' }, { status: 404 });
    }

    const accNum = wallet.account_number;
    const masterPassword = wallet.mt_master_password || generateDemoPassword(accNum);
    const investorPassword = wallet.mt_investor_password || getInvestorPassword(accNum);
    const serverName = wallet.platform === 'MT4' ? 'PaperPulse-Demo-MT4' : 'PaperPulse-Demo-MT5';
    const serverHost = 'bridge.paperpulse.io:443';

    let openTrades = [];
    let closedTrades = [];
    try {
      const { data: openData } = await supabaseAdmin
        .from('trades')
        .select('*')
        .eq('wallet_id', wallet.id)
        .eq('status', 'open');
      if (openData) openTrades = openData;

      const { data: closedData } = await supabaseAdmin
        .from('trades')
        .select('*')
        .eq('wallet_id', wallet.id)
        .eq('status', 'closed')
        .order('closed_at', { ascending: false })
        .limit(20);
      if (closedData) closedTrades = closedData;
    } catch (e) {}

    const usedMargin = openTrades.reduce((sum, t) => sum + parseFloat(t.usd_amount || 0), 0);
    const balance = parseFloat(wallet.virtual_balance || wallet.balance || 0);
    const floatingPnl = openTrades.reduce((sum, t) => sum + parseFloat(t.pnl || 0), 0);
    const equity = parseFloat((balance + usedMargin + floatingPnl).toFixed(2));
    const freeMargin = parseFloat((equity - usedMargin).toFixed(2));
    const marginLevel = usedMargin > 0 ? parseFloat(((equity / usedMargin) * 100).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      account: {
        id: wallet.id,
        accountNumber: accNum,
        nickname: wallet.nickname || wallet.account_name || ('Demo #' + accNum),
        platform: wallet.platform || 'MT5',
        accountType: wallet.account_type || 'standard',
        currency: wallet.currency || 'USD',
        leverage: wallet.leverage || 100,
        isDemo: wallet.is_demo !== undefined ? wallet.is_demo : true
      },
      credentials: {
        login: accNum,
        masterPassword,
        investorPassword,
        server: serverName,
        serverHost,
        protocol: 'MetaTrader REST / WebSockets Bridge v2.4',
        connectionStatus: 'Online / Synced'
      },
      metrics: {
        balance,
        equity,
        margin: usedMargin,
        freeMargin,
        marginLevel: marginLevel + '%',
        openPositionsCount: openTrades.length,
        closedTradesCount: closedTrades.length
      },
      openPositions: openTrades.map(t => ({
        ticket: t.id,
        symbol: t.symbol,
        type: (t.side || 'buy').toUpperCase(),
        lots: t.quantity || t.size,
        openPrice: t.entry_price,
        currentPrice: t.entry_price,
        sl: t.stop_loss,
        tp: t.take_profit,
        pnl: t.pnl || 0,
        openTime: t.opened_at || t.created_at
      })),
      recentHistory: closedTrades.map(t => ({
        ticket: t.id,
        symbol: t.symbol,
        type: (t.side || 'buy').toUpperCase(),
        lots: t.quantity || t.size,
        openPrice: t.entry_price,
        closePrice: t.exit_price,
        profit: t.pnl,
        closeTime: t.closed_at
      }))
    });
  } catch (error) {
    console.error('[MT-Bridge API GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Bridge internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, login, password, server, tradeData, newPassword } = body;

    const supabaseAdmin = createAdminClient();
    const localDbPath = path.join(process.cwd(), 'local_db.json');

    if (action === 'verify_login') {
      if (!login || !password) {
        return NextResponse.json({ error: 'Missing login credentials (account number and password)' }, { status: 400 });
      }

      let wallet = null;
      try {
        const { data } = await supabaseAdmin
          .from('wallets')
          .select('*')
          .eq('account_number', String(login))
          .maybeSingle();
        wallet = data;
      } catch (e) {}

      if (!wallet && fs.existsSync(localDbPath)) {
        try {
          const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
          wallet = (db.wallets_multi || []).find(w => w.account_number === String(login));
        } catch (e) {}
      }

      if (!wallet) {
        return NextResponse.json({ 
          success: false, 
          error: 'Account not found. Please verify your Account ID / Login Number.' 
        }, { status: 404 });
      }

      const expectedMaster = wallet.mt_master_password || generateDemoPassword(wallet.account_number);
      const expectedInvestor = wallet.mt_investor_password || getInvestorPassword(wallet.account_number);

      const isValidMaster = password === expectedMaster;
      const isValidInvestor = password === expectedInvestor;

      if (!isValidMaster && !isValidInvestor) {
        return NextResponse.json({
          success: false,
          error: 'Invalid password. Check your Master or Investor password in the Account Setup portal.'
        }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        message: 'MT4/MT5 Authentication Successful. Connection verified and synchronized.',
        accessLevel: isValidMaster ? 'Full Trading (Master)' : 'Read-Only (Investor)',
        account: {
          id: wallet.id,
          accountNumber: wallet.account_number,
          nickname: wallet.nickname || wallet.account_name,
          balance: parseFloat(wallet.virtual_balance || wallet.balance || 0),
          leverage: wallet.leverage || 100,
          currency: wallet.currency || 'USD',
          server: server || (wallet.platform === 'MT4' ? 'PaperPulse-Demo-MT4' : 'PaperPulse-Demo-MT5'),
          syncedAt: new Date().toISOString()
        }
      });
    }

    if (action === 'update_password') {
      if (!login || !newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
      }

      try {
        await supabaseAdmin
          .from('wallets')
          .update({ mt_master_password: newPassword, updated_at: new Date().toISOString() })
          .eq('account_number', String(login));
      } catch (e) {}

      if (fs.existsSync(localDbPath)) {
        try {
          const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
          const w = (db.wallets_multi || []).find(x => x.account_number === String(login));
          if (w) {
            w.mt_master_password = newPassword;
            fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
          }
        } catch (e) {}
      }

      return NextResponse.json({ success: true, message: 'MT4/MT5 Master Password updated successfully.' });
    }

    if (action === 'execute_trade') {
      const { accountNumber, symbol, side, quantity, price, sl, tp, password: tradePwd } = tradeData || {};

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
        return NextResponse.json({ error: 'Target account not found' }, { status: 404 });
      }

      const expectedMaster = wallet.mt_master_password || generateDemoPassword(wallet.account_number);
      if (tradePwd && tradePwd !== expectedMaster) {
        return NextResponse.json({ error: 'Unauthorized: Master password required for trading' }, { status: 401 });
      }

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
        side: side.toLowerCase(),
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
        message: 'Trade placed via MT4/MT5 bridge and synchronized with website in real-time.',
        ticket: createdTrade?.id || 'MT_' + Math.random().toString(36).substring(2, 9),
        newBalance,
        margin: calculatedMargin,
        symbol,
        side
      });
    }

    if (action === 'close_trade') {
      const { tradeId, exitPrice } = body;
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
        return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
      }

      const numExitPrice = parseFloat(exitPrice || trade.entry_price);
      const isBuy = trade.side === 'buy';
      const FOREX_SYMBOLS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF'];
      const lotMultiplier = FOREX_SYMBOLS.includes(trade.symbol) ? 100000 : trade.symbol === 'XAU/USD' ? 100 : 1;
      
      const priceDiff = isBuy ? numExitPrice - trade.entry_price : trade.entry_price - numExitPrice;
      const pnl = parseFloat((priceDiff * trade.quantity * lotMultiplier).toFixed(2));
      const returnedAmount = parseFloat((trade.usd_amount + pnl).toFixed(2));

      const { data: wallet } = await supabaseAdmin.from('wallets').select('*').eq('id', trade.wallet_id).single();
      if (wallet) {
        const updatedBal = parseFloat((parseFloat(wallet.virtual_balance) + returnedAmount).toFixed(2));
        await supabaseAdmin.from('wallets').update({ virtual_balance: updatedBal }).eq('id', wallet.id);
      }

      await supabaseAdmin.from('trades').update({
        status: 'closed',
        exit_price: numExitPrice,
        pnl,
        closed_at: new Date().toISOString()
      }).eq('id', tradeId);

      return NextResponse.json({
        success: true,
        message: 'Position closed via MT4/MT5 bridge and synchronized.',
        pnl
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error) {
    console.error('[MT-Bridge API POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to process MT request' }, { status: 500 });
  }
}
