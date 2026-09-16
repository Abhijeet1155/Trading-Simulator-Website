import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { getActiveWallet } from '@/lib/activeWallet';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Multiplier Helper
const getMultiplier = (symbol) => {
  const cleanSym = (symbol || '').toUpperCase().replace('/', '').trim();
  if (['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'AUDCAD', 'USDCAD', 'USDCHF', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY'].includes(cleanSym)) {
    return 100000;
  }
  if (cleanSym === 'XAUUSD' || cleanSym === 'GOLD' || cleanSym.startsWith('XAU')) return 100;
  if (['NQ1!', 'NAS100', 'NDX', 'USTEC'].includes(cleanSym)) return 20;
  if (['ES1!', 'US500', 'SPX'].includes(cleanSym)) return 50;
  return 1;
};

const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// GET: Fetch trades for the logged-in user with filters
export async function GET(request) {
  const supabase = await createClient();
  
  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'open'; // 'open', 'closed', or 'all'
  const accountId = searchParams.get('accountId') || searchParams.get('account_id') || searchParams.get('wallet_id');
  const allWallets = searchParams.get('all_wallets') === 'true' || accountId === 'all' || accountId === 'ALL';

  try {
    const { activeWallet, useLocalFallback } = await getActiveWallet(user.id);
    const supabaseAdmin = createAdminClient();

    let rawTrades = [];

    if (!useLocalFallback) {
      try {
        let query = supabaseAdmin
          .from('trades')
          .select('*')
          .eq('user_id', user.id);

        if (!allWallets && (accountId || activeWallet?.id)) {
          const targetWalletId = accountId || activeWallet.id;
          if (isUuid(targetWalletId)) {
            query = query.or(`wallet_id.eq.${targetWalletId},wallet_id.is.null`);
          }
        }

        const { data, error } = await query;
        if (!error && data) {
          rawTrades = data;
        } else if (error) {
          console.warn('[Trades API GET Supabase Warning]:', error.message);
        }
      } catch (err) {
        console.warn('[Trades API GET Supabase Warning]:', err.message);
      }
    }

    // Fallback and merge with local_db.json
    const localDbPath = path.join(process.cwd(), 'local_db.json');
    if (fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        let dbTrades = (db.trades || []).filter(t => t.user_id === user.id);
        if (!allWallets && (accountId || activeWallet?.id)) {
          const targetWalletId = accountId || activeWallet.id;
          dbTrades = dbTrades.filter(t => !t.wallet_id || t.wallet_id === targetWalletId);
        }
        
        const existingIds = new Set(rawTrades.map(t => String(t.id)));
        for (const lt of dbTrades) {
          if (!existingIds.has(String(lt.id))) {
            rawTrades.push(lt);
            existingIds.add(String(lt.id));
          }
        }
      } catch (e) {
        console.error('Error reading local_db in trades GET:', e);
      }
    }

    // Filter by status if not 'all'
    let filtered = rawTrades || [];
    if (status !== 'all') {
      filtered = filtered.filter(t => (t.status || '').toLowerCase() === status.toLowerCase());
    }
    
    // Sort
    if (status === 'closed') {
      filtered.sort((a, b) => new Date(b.closed_at || b.exitDate || b.created_at) - new Date(a.closed_at || a.exitDate || a.created_at));
    } else {
      filtered.sort((a, b) => new Date(b.opened_at || b.created_at || b.entryDate) - new Date(a.opened_at || a.created_at || a.entryDate));
    }

    // Map to comprehensive format for terminal, journal, and analytics
    const formattedTrades = filtered.map(t => {
      const parsedSize = parseFloat(t.quantity || t.size || t.lot_size || 0);
      const entryPrice = parseFloat(t.entry_price || t.entry || 0);
      const exitPrice = t.exit_price !== null && t.exit_price !== undefined ? parseFloat(t.exit_price) : (t.exit ? parseFloat(t.exit) : null);
      const multiplier = t.contractMultiplier || getMultiplier(t.symbol);
      const side = (t.side || 'buy').toLowerCase();
      const direction = (side === 'buy' || side === 'long') ? 'LONG' : 'SHORT';
      
      let pnl = 0;
      if (t.pnl !== undefined && t.pnl !== null) {
        pnl = parseFloat(t.pnl);
      } else if (exitPrice !== null && entryPrice > 0 && parsedSize > 0) {
        pnl = (direction === 'LONG' ? (exitPrice - entryPrice) : (entryPrice - exitPrice)) * parsedSize * multiplier;
      }
      pnl = parseFloat(pnl.toFixed(2));

      const stopLoss = t.stop_loss ? parseFloat(t.stop_loss) : (t.stopLoss ? parseFloat(t.stopLoss) : null);
      const takeProfit = t.take_profit ? parseFloat(t.take_profit) : (t.takeProfit ? parseFloat(t.takeProfit) : null);
      const openTime = t.opened_at || t.created_at || t.entryDate || new Date().toISOString();
      const closeTime = t.closed_at || t.exitDate || (t.status === 'closed' ? openTime : null);

      let rrRealized = t.rrRealized;
      if (rrRealized === undefined && stopLoss && stopLoss > 0) {
        const riskDist = Math.abs(entryPrice - stopLoss);
        if (riskDist > 0 && exitPrice) {
          const move = direction === 'LONG' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
          rrRealized = parseFloat((move / riskDist).toFixed(2));
        }
      }

      return {
        id: String(t.id),
        user_id: t.user_id,
        wallet_id: t.wallet_id || activeWallet?.id || null,
        symbol: t.symbol,
        side: side,
        direction: direction,
        status: (t.status || 'open').toLowerCase(),
        entry: entryPrice,
        entry_price: entryPrice,
        entryPrice: entryPrice,
        exit: exitPrice,
        exit_price: exitPrice,
        exitPrice: exitPrice,
        size: parsedSize,
        quantity: parsedSize,
        lotSize: parsedSize,
        usd_amount: parseFloat(t.usd_amount || 0),
        leverage: t.leverage ? parseFloat(t.leverage) : 100,
        pnl: pnl,
        netPnl: pnl,
        grossPnl: t.grossPnl !== undefined ? parseFloat(t.grossPnl) : pnl,
        commission: t.commission ? parseFloat(t.commission) : 0,
        result: pnl > 0.01 ? 'WIN' : pnl < -0.01 ? 'LOSS' : 'BE',
        time: new Date(openTime).toLocaleString(),
        entryDate: new Date(openTime).toISOString(),
        opened_at: new Date(openTime).toISOString(),
        closed_time: closeTime ? new Date(closeTime).toLocaleString() : null,
        exitDate: closeTime ? new Date(closeTime).toISOString() : null,
        closed_at: closeTime ? new Date(closeTime).toISOString() : null,
        take_profit: takeProfit,
        takeProfit: takeProfit,
        stop_loss: stopLoss,
        stopLoss: stopLoss,
        rrRealized: rrRealized !== undefined ? rrRealized : (pnl > 0 ? 2.0 : -1.0),
        rrPlanned: t.rrPlanned ? parseFloat(t.rrPlanned) : 2.5,
        session: t.session || 'NEW_YORK',
        timeframe: t.timeframe || '5m',
        setupModel: t.setupModel || t.setup_model || 'Standard Execution',
        setup_model: t.setupModel || t.setup_model || 'Standard Execution',
        confluences: Array.isArray(t.confluences) ? t.confluences : [],
        partials: Array.isArray(t.partials) ? t.partials : [],
        notes: t.notes || '',
        psychology: Array.isArray(t.psychology) ? t.psychology : [],
        mistakes: Array.isArray(t.mistakes) ? t.mistakes : [],
        rating: t.rating ? Number(t.rating) : 5,
        chartUrl: t.chartUrl || t.chart_url || null,
        chartThumbnail: t.chartThumbnail || t.chart_thumbnail || t.chartUrl || null,
      };
    });

    return NextResponse.json(formattedTrades);
  } catch (error) {
    console.error('[Trades API GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch trades' }, { status: 500 });
  }
}

// POST: Place/Execute a new trade order or log a closed journal trade
export async function POST(request) {
  const supabase = await createClient();
  
  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let bodyData;
  try {
    bodyData = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    account_id,
    wallet_id,
    symbol,
    side,
    quantity,
    lotSize,
    entry_price,
    entryPrice,
    exit_price,
    exitPrice,
    usd_amount,
    leverage = 100,
    take_profit,
    takeProfit,
    stop_loss,
    stopLoss,
    status = 'open',
    pnl,
    netPnl,
    notes,
    setupModel,
    setup_model,
    confluences,
    session,
    timeframe,
    rating,
    chartUrl,
    chartThumbnail,
    entryDate,
    exitDate
  } = bodyData;

  const resolvedSymbol = symbol;
  const resolvedSide = (side || 'buy').toLowerCase();
  const numQuantity = parseFloat(quantity || lotSize || 1.0);
  const numEntryPrice = parseFloat(entry_price || entryPrice || 0);
  const numExitPrice = exit_price || exitPrice ? parseFloat(exit_price || exitPrice) : null;
  const numLeverage = parseFloat(leverage) > 0 ? parseFloat(leverage) : 100;
  const resolvedStatus = (status || 'open').toLowerCase();

  // Basic validation
  if (!resolvedSymbol || !numQuantity || numQuantity <= 0 || !numEntryPrice || numEntryPrice <= 0) {
    return NextResponse.json({ error: 'Missing required trade details (symbol, quantity, entry price)' }, { status: 400 });
  }

  // Margin calculation
  const multiplier = getMultiplier(resolvedSymbol);
  const calculatedMargin = parseFloat(((numQuantity * numEntryPrice * multiplier) / numLeverage).toFixed(2));
  const numUsdAmount = usd_amount ? parseFloat(parseFloat(usd_amount).toFixed(2)) : calculatedMargin;

  try {
    const supabaseAdmin = createAdminClient();
    const targetWalletId = account_id || wallet_id;
    let activeWallet = null;

    if (targetWalletId) {
      try {
        const { data: specificWallet } = await supabaseAdmin
          .from('wallets')
          .select('*')
          .eq('id', targetWalletId)
          .eq('user_id', user.id)
          .maybeSingle();
        if (specificWallet) {
          activeWallet = specificWallet;
        }
      } catch (err) {
        console.warn('Supabase targetWallet lookup warning:', err?.message);
      }

      if (!activeWallet) {
        const localDbPath = path.join(process.cwd(), 'local_db.json');
        if (fs.existsSync(localDbPath)) {
          try {
            const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
            const localW = (db.wallets_multi || []).find(w => (w.id === targetWalletId || w.account_number === targetWalletId) && w.user_id === user.id);
            if (localW) activeWallet = localW;
          } catch (e) {}
        }
      }
    }

    if (!activeWallet) {
      const resolved = await getActiveWallet(user.id);
      activeWallet = resolved.activeWallet;
    }

    if (!activeWallet) {
      return NextResponse.json({ error: 'Active trading account not found' }, { status: 404 });
    }

    const currentBal = parseFloat(activeWallet.virtual_balance || activeWallet.balance || 0);

    // If opening a new position, verify margin and deduct from wallet
    let newBalance = currentBal;
    if (resolvedStatus === 'open') {
      if (currentBal < numUsdAmount) {
        return NextResponse.json({
          error: `Insufficient margin. Required: $${numUsdAmount.toFixed(2)}, Available: $${currentBal.toFixed(2)}`
        }, { status: 400 });
      }

      newBalance = parseFloat((currentBal - numUsdAmount).toFixed(2));
      try {
        await supabaseAdmin
          .from('wallets')
          .update({ virtual_balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', activeWallet.id);
      } catch (wErr) {
        console.warn('[Trades API Wallet Update Supabase Error]:', wErr.message);
      }
    }

    // Calculate PnL if logging a closed trade
    let calculatedPnl = pnl !== undefined ? parseFloat(pnl) : (netPnl !== undefined ? parseFloat(netPnl) : 0);
    if (resolvedStatus === 'closed' && numExitPrice !== null && pnl === undefined && netPnl === undefined) {
      calculatedPnl = (resolvedSide === 'buy' ? (numExitPrice - numEntryPrice) : (numEntryPrice - numExitPrice)) * numQuantity * multiplier;
      calculatedPnl = parseFloat(calculatedPnl.toFixed(2));
    }

    const nowIso = new Date().toISOString();
    const tradeId = isUuid(bodyData.id) ? bodyData.id : crypto.randomUUID();
    const validWalletId = isUuid(activeWallet.id) ? activeWallet.id : null;

    // Supabase compatible payload (only columns existing in database)
    const supabasePayload = {
      id: tradeId,
      user_id: user.id,
      wallet_id: validWalletId,
      symbol: resolvedSymbol,
      side: resolvedSide,
      status: resolvedStatus,
      entry_price: numEntryPrice,
      exit_price: numExitPrice,
      quantity: numQuantity,
      size: numQuantity,
      usd_amount: numUsdAmount,
      pnl: calculatedPnl,
      take_profit: take_profit || takeProfit ? parseFloat(take_profit || takeProfit) : null,
      stop_loss: stop_loss || stopLoss ? parseFloat(stop_loss || stopLoss) : null,
      opened_at: entryDate ? new Date(entryDate).toISOString() : nowIso,
      created_at: entryDate ? new Date(entryDate).toISOString() : nowIso,
      closed_at: resolvedStatus === 'closed' ? (exitDate ? new Date(exitDate).toISOString() : nowIso) : null
    };

    let tradeResult = null;

    // Try Supabase insert
    try {
      const { data, error } = await supabaseAdmin
        .from('trades')
        .insert(supabasePayload)
        .select()
        .single();
      
      if (!error && data) {
        tradeResult = data;
      } else if (error) {
        console.warn('[Trades API POST Supabase Insert Warning]:', error.message, error.details);
      }
    } catch (dbErr) {
      console.warn('[Trades API POST Supabase Insert Error]:', dbErr.message);
    }

    // Always sync local_db.json
    const localDbPath = path.join(process.cwd(), 'local_db.json');
    try {
      const db = fs.existsSync(localDbPath) ? JSON.parse(fs.readFileSync(localDbPath, 'utf8')) : { trades: [], wallets_multi: [] };
      if (!db.trades) db.trades = [];
      
      // Store extended journal tags in local record
      const fullTradeRecord = {
        ...supabasePayload,
        leverage: numLeverage,
        notes: notes || '',
        setupModel: setupModel || setup_model || 'Standard Execution',
        confluences: Array.isArray(confluences) ? confluences : [],
        session: session || 'NEW_YORK',
        timeframe: timeframe || '5m',
        rating: rating || 5,
        chartUrl: chartUrl || null,
        chartThumbnail: chartThumbnail || null
      };

      const existingIndex = db.trades.findIndex(t => t.id === tradeId);
      if (existingIndex >= 0) {
        db.trades[existingIndex] = fullTradeRecord;
      } else {
        db.trades.unshift(fullTradeRecord);
      }

      // Update wallet in local_db
      if (db.wallets_multi) {
        const localWallet = db.wallets_multi.find(w => w.id === activeWallet.id || w.user_id === user.id);
        if (localWallet && resolvedStatus === 'open') {
          localWallet.virtual_balance = newBalance;
        }
      }
      fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
      if (!tradeResult) tradeResult = fullTradeRecord;
    } catch (fsErr) {
      console.error('Error writing to local_db:', fsErr);
    }

    return NextResponse.json({
      message: resolvedStatus === 'closed' ? 'Trade logged successfully' : 'Order placed successfully',
      trade: tradeResult || supabasePayload,
      newBalance
    });
  } catch (error) {
    console.error('[Trades API POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to record trade' }, { status: 500 });
  }
}

// PUT: Close an active trade position or edit trade metadata
export async function PUT(request) {
  const supabase = await createClient();
  
  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let bodyData;
  try {
    bodyData = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { tradeId, id, exitPrice, exit_price, notes, setupModel, confluences, rating } = bodyData;
  const targetId = tradeId || id;

  if (!targetId) {
    return NextResponse.json({ error: 'Missing trade ID' }, { status: 400 });
  }

  const rawExitPrice = exitPrice || exit_price;
  const numExitPrice = rawExitPrice ? parseFloat(rawExitPrice) : null;

  try {
    const supabaseAdmin = createAdminClient();
    const localDbPath = path.join(process.cwd(), 'local_db.json');

    // 2. Fetch existing trade
    let trade = null;
    try {
      const { data } = await supabaseAdmin
        .from('trades')
        .select('*')
        .eq('id', targetId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) trade = data;
    } catch (e) {}

    if (!trade && fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        trade = (db.trades || []).find(t => String(t.id) === String(targetId) && t.user_id === user.id);
      } catch (e) {}
    }

    if (!trade) {
      return NextResponse.json({ error: 'Trade position not found' }, { status: 404 });
    }

    // If already closed and only editing journal metadata
    if (trade.status === 'closed' && (notes !== undefined || setupModel !== undefined || rating !== undefined)) {
      const updates = {};
      if (notes !== undefined) updates.notes = notes;
      if (setupModel !== undefined) updates.setupModel = setupModel;
      if (rating !== undefined) updates.rating = rating;

      if (fs.existsSync(localDbPath)) {
        try {
          const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
          const idx = (db.trades || []).findIndex(t => String(t.id) === String(targetId));
          if (idx >= 0) {
            db.trades[idx] = { ...db.trades[idx], ...updates };
            fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
          }
        } catch (e) {}
      }

      return NextResponse.json({ message: 'Trade log updated', trade: { ...trade, ...updates } });
    }

    if (trade.status === 'closed') {
      return NextResponse.json({ error: 'Position is already closed' }, { status: 400 });
    }

    if (!numExitPrice || numExitPrice <= 0) {
      return NextResponse.json({ error: 'Valid exit price is required to close position' }, { status: 400 });
    }

    // Calculate P&L: (exit_price - entry_price) * quantity * multiplier for buy
    const quantity = parseFloat(trade.quantity || trade.size || 0);
    const entryPrice = parseFloat(trade.entry_price || trade.entry);
    const usdAmount = parseFloat(trade.usd_amount || 0);
    const multiplier = getMultiplier(trade.symbol);
    
    let pnl = 0;
    const side = (trade.side || 'buy').toLowerCase();
    if (side === 'buy' || side === 'long') {
      pnl = (numExitPrice - entryPrice) * multiplier * quantity;
    } else {
      pnl = (entryPrice - numExitPrice) * multiplier * quantity;
    }
    pnl = parseFloat(pnl.toFixed(2));
    const returnedAmount = usdAmount + pnl;

    // Resolve wallet to credit
    let wallet = null;
    if (trade.wallet_id) {
      const { data } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('id', trade.wallet_id)
        .maybeSingle();
      if (data) wallet = data;
    }

    if (!wallet) {
      const resolved = await getActiveWallet(user.id);
      wallet = resolved.activeWallet;
    }

    const currentBal = parseFloat(wallet?.virtual_balance || wallet?.balance || 0);
    const newBalance = parseFloat((currentBal + returnedAmount).toFixed(2));

    // Update wallet
    if (wallet?.id) {
      try {
        await supabaseAdmin
          .from('wallets')
          .update({ virtual_balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', wallet.id);
      } catch (e) {}
    }

    const closeTimeIso = new Date().toISOString();

    // Update trade in Supabase
    try {
      await supabaseAdmin
        .from('trades')
        .update({
          status: 'closed',
          exit_price: numExitPrice,
          pnl,
          closed_at: closeTimeIso
        })
        .eq('id', targetId);
    } catch (e) {}

    // Update trade and wallet in local_db
    if (fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        const idx = (db.trades || []).findIndex(t => String(t.id) === String(targetId));
        if (idx >= 0) {
          db.trades[idx] = {
            ...db.trades[idx],
            status: 'closed',
            exit_price: numExitPrice,
            pnl,
            closed_at: closeTimeIso
          };
        }
        if (db.wallets_multi && wallet?.id) {
          const wIdx = db.wallets_multi.findIndex(w => w.id === wallet.id);
          if (wIdx >= 0) db.wallets_multi[wIdx].virtual_balance = newBalance;
        }
        fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
      } catch (e) {}
    }

    return NextResponse.json({
      message: 'Position closed successfully',
      tradeId: targetId,
      pnl,
      newBalance
    });
  } catch (error) {
    console.error('[Trades API PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to close position' }, { status: 500 });
  }
}

// DELETE: Remove a trade log or cancel open trade
export async function DELETE(request) {
  const supabase = await createClient();
  
  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let tradeId = searchParams.get('tradeId') || searchParams.get('id');

  if (!tradeId) {
    try {
      const body = await request.json();
      tradeId = body.tradeId || body.id;
    } catch (e) {}
  }

  if (!tradeId) {
    return NextResponse.json({ error: 'Missing trade ID' }, { status: 400 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const localDbPath = path.join(process.cwd(), 'local_db.json');

    // Fetch trade first to refund margin if open
    let trade = null;
    try {
      const { data } = await supabaseAdmin
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) trade = data;
    } catch (e) {}

    if (!trade && fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        trade = (db.trades || []).find(t => String(t.id) === String(tradeId) && t.user_id === user.id);
      } catch (e) {}
    }

    if (trade && trade.status === 'open' && trade.usd_amount && trade.wallet_id) {
      // Refund committed margin
      try {
        const { data: w } = await supabaseAdmin.from('wallets').select('*').eq('id', trade.wallet_id).maybeSingle();
        if (w) {
          const newBal = parseFloat((parseFloat(w.virtual_balance) + parseFloat(trade.usd_amount)).toFixed(2));
          await supabaseAdmin.from('wallets').update({ virtual_balance: newBal }).eq('id', trade.wallet_id);
        }
      } catch (e) {}
    }

    // Delete from Supabase
    try {
      await supabaseAdmin.from('trades').delete().eq('id', tradeId).eq('user_id', user.id);
    } catch (e) {}

    // Delete from local_db
    if (fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        if (db.trades) {
          db.trades = db.trades.filter(t => String(t.id) !== String(tradeId));
          fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
        }
      } catch (e) {}
    }

    return NextResponse.json({ message: 'Trade log deleted successfully', tradeId });
  } catch (error) {
    console.error('[Trades API DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete trade' }, { status: 500 });
  }
}

// PATCH: Update TP and SL for an open position
export async function PATCH(request) {
  const supabase = await createClient();
  
  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let bodyData;
  try {
    bodyData = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { tradeId, id, take_profit, takeProfit, stop_loss, stopLoss } = bodyData;
  const targetId = tradeId || id;

  if (!targetId) {
    return NextResponse.json({ error: 'Missing trade ID' }, { status: 400 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const updates = {};
    const rawTp = take_profit !== undefined ? take_profit : takeProfit;
    const rawSl = stop_loss !== undefined ? stop_loss : stopLoss;

    if (rawTp !== undefined) {
      updates.take_profit = rawTp === null || rawTp === '' ? null : parseFloat(rawTp);
    }
    if (rawSl !== undefined) {
      updates.stop_loss = rawSl === null || rawSl === '' ? null : parseFloat(rawSl);
    }

    // Update Supabase
    try {
      await supabaseAdmin
        .from('trades')
        .update(updates)
        .eq('id', targetId)
        .eq('user_id', user.id);
    } catch (e) {}

    // Update local_db
    const localDbPath = path.join(process.cwd(), 'local_db.json');
    if (fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        const idx = (db.trades || []).findIndex(t => String(t.id) === String(targetId));
        if (idx >= 0) {
          db.trades[idx] = { ...db.trades[idx], ...updates };
          fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
        }
      } catch (e) {}
    }

    return NextResponse.json({
      message: 'TP/SL updated successfully',
      tradeId: targetId,
      updates
    });
  } catch (error) {
    console.error('[Trades API PATCH Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update position' }, { status: 500 });
  }
}
