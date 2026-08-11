import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { getActiveWallet } from '@/lib/activeWallet';

// GET: Fetch trades for the logged-in user and active account
export async function GET(request) {
  const supabase = await createClient();
  
  // 1. Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'open'; // 'open', 'closed', or 'all'

  try {
    const { activeWallet } = await getActiveWallet(user.id);
    const supabaseAdmin = createAdminClient();

    let query = supabaseAdmin
      .from('trades')
      .select('*')
      .eq('user_id', user.id);
    
    // Filter by wallet_id
    const isPrimary = activeWallet.id === user.id || activeWallet.account_name === 'Primary Demo';
    if (isPrimary) {
      // For default primary wallet, fetch both explicitly marked trades and unassigned trades
      query = query.or(`wallet_id.eq.${activeWallet.id},wallet_id.is.null`);
    } else {
      query = query.eq('wallet_id', activeWallet.id);
    }

    let { data: trades, error } = await query;

    // Fallback if wallet_id column doesn't exist in trades table yet
    if (error && (error.message?.includes('column') || error.message?.includes('wallet_id'))) {
      const fallbackRes = await supabaseAdmin
        .from('trades')
        .select('*')
        .eq('user_id', user.id);
      trades = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      throw error;
    }

    // Filter by status if not 'all'
    let filtered = trades || [];
    if (status !== 'all') {
      filtered = filtered.filter(t => t.status === status);
    }
    
    // Sort
    if (status === 'closed') {
      filtered.sort((a, b) => new Date(b.closed_at) - new Date(a.closed_at));
    } else {
      filtered.sort((a, b) => new Date(b.opened_at || b.created_at) - new Date(a.opened_at || a.created_at));
    }

    // Map to the format expected by the frontend
    const formattedTrades = filtered.map(t => {
      const parsedSize = parseFloat(t.quantity) || parseFloat(t.size) || 0;
      return {
        id: t.id,
        symbol: t.symbol,
        side: t.side,
        entry: parseFloat(t.entry_price),
        exit: t.exit_price ? parseFloat(t.exit_price) : null,
        size: parsedSize,
        quantity: parsedSize,
        usd_amount: parseFloat(t.usd_amount || 0),
        pnl: t.pnl ? parseFloat(t.pnl) : 0,
        time: new Date(t.opened_at || t.created_at).toLocaleString(),
        closed_time: t.closed_at ? new Date(t.closed_at).toLocaleString() : null,
        status: t.status,
        take_profit: t.take_profit ? parseFloat(t.take_profit) : null,
        stop_loss: t.stop_loss ? parseFloat(t.stop_loss) : null
      };
    });

    return NextResponse.json(formattedTrades);
  } catch (error) {
    console.error('[Trades API GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch trades' }, { status: 500 });
  }
}

// POST: Place/Execute a new trade order
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

  const { symbol, side, quantity, entry_price, usd_amount, take_profit, stop_loss } = bodyData;

  // Basic validation
  if (!symbol || !side || !quantity || !entry_price || !usd_amount) {
    return NextResponse.json({ error: 'Missing required trade details' }, { status: 400 });
  }

  const numQuantity = parseFloat(quantity);
  const numEntryPrice = parseFloat(entry_price);
  const numUsdAmount = parseFloat(usd_amount);

  if (numQuantity <= 0 || numEntryPrice <= 0 || numUsdAmount <= 0) {
    return NextResponse.json({ error: 'Invalid quantity, price, or amount' }, { status: 400 });
  }

  try {
    const { activeWallet } = await getActiveWallet(user.id);
    const supabaseAdmin = createAdminClient();

    const balance = parseFloat(activeWallet.virtual_balance) || 0;
    if (balance < numUsdAmount) {
      return NextResponse.json({ error: 'Required margin/amount exceeds available balance' }, { status: 400 });
    }

    // 3. Deduct committed usd_amount from active wallet virtual_balance
    const newBalance = balance - numUsdAmount;
    const { error: updateWalletError } = await supabaseAdmin
      .from('wallets')
      .update({ virtual_balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', activeWallet.id);

    if (updateWalletError) {
      console.error('[Trades API POST] Wallet update error:', updateWalletError);
      throw new Error(`Failed to update wallet balance: ${updateWalletError.message}`);
    }

    // 4. Insert trade row
    let insertData = {
      user_id: user.id,
      wallet_id: activeWallet.id,
      symbol,
      side: side.toLowerCase(), // Store lowercase
      status: 'open',
      entry_price: numEntryPrice,
      quantity: numQuantity,
      size: numQuantity, // compatibility
      usd_amount: numUsdAmount,
      pnl: 0.00,
      take_profit: take_profit ? parseFloat(take_profit) : null,
      stop_loss: stop_loss ? parseFloat(stop_loss) : null
    };

    let { data: trade, error: insertError } = await supabaseAdmin
      .from('trades')
      .insert(insertData)
      .select()
      .single();

    // Fallback if wallet_id column doesn't exist in trades table yet
    if (insertError && (insertError.message?.includes('column') || insertError.message?.includes('wallet_id'))) {
      const fallbackInsertData = { ...insertData };
      delete fallbackInsertData.wallet_id;
      
      const fallbackInsert = await supabaseAdmin
        .from('trades')
        .insert(fallbackInsertData)
        .select()
        .single();
      trade = fallbackInsert.data;
      insertError = fallbackInsert.error;
    }

    if (insertError) {
      console.error('[Trades API POST] Trade insert error:', insertError);
      // Rollback wallet balance update if trade insert fails
      await supabaseAdmin
         .from('wallets')
         .update({ virtual_balance: balance, updated_at: new Date().toISOString() })
         .eq('id', activeWallet.id);
      
      throw new Error(`Failed to record trade: ${insertError.message}`);
    }

    return NextResponse.json({
      message: 'Order placed successfully',
      trade,
      newBalance
    });
  } catch (error) {
    console.error('[Trades API POST Execution Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute trade. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT: Close an active trade position
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

  const { tradeId, exitPrice } = bodyData;

  if (!tradeId || !exitPrice) {
    return NextResponse.json({ error: 'Missing trade ID or exit price' }, { status: 400 });
  }

  const numExitPrice = parseFloat(exitPrice);
  if (numExitPrice <= 0) {
    return NextResponse.json({ error: 'Invalid exit price' }, { status: 400 });
  }

  try {
    const supabaseAdmin = createAdminClient();

    // 2. Fetch trade details
    const { data: trade, error: fetchError } = await supabaseAdmin
      .from('trades')
      .select('*')
      .eq('id', tradeId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !trade) {
      console.error('[Trades API PUT] Fetch trade error:', fetchError);
      throw new Error(`Position not found: ${fetchError?.message || 'Trade record missing'}`);
    }

    if (trade.status === 'closed') {
      return NextResponse.json({ error: 'Position is already closed' }, { status: 400 });
    }

    // 3. Calculate final P&L
    const quantity = parseFloat(trade.quantity || trade.size || 0);
    const entryPrice = parseFloat(trade.entry_price);
    const usdAmount = parseFloat(trade.usd_amount || 0);
    
    // Leverage multiplier
    const getMultiplier = (symbol) => {
      if (['EUR/USD', 'GBP/USD'].includes(symbol)) return 100000;
      if (symbol === 'XAU/USD') return 100;
      if (symbol === 'AAPL') return 100;
      return 1;
    };
    const multiplier = getMultiplier(trade.symbol);
    
    let pnl = 0;
    if (trade.side.toLowerCase() === 'buy') {
      pnl = (numExitPrice - entryPrice) * multiplier * quantity;
    } else {
      pnl = (entryPrice - numExitPrice) * multiplier * quantity;
    }

    pnl = parseFloat(pnl.toFixed(2));
    const returnedAmount = usdAmount + pnl;

    // 4. Resolve correct target wallet
    const targetWalletId = trade.wallet_id || user.id;

    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('id', targetWalletId)
      .single();

    if (walletError || !wallet) {
      console.error('[Trades API PUT] Wallet fetch error:', walletError);
      throw new Error(`Target wallet not found: ${walletError?.message || 'Wallet missing'}`);
    }

    const balance = parseFloat(wallet.virtual_balance);
    const newBalance = parseFloat((balance + returnedAmount).toFixed(2));

    // 5. Update wallet balance
    const { error: updateWalletError } = await supabaseAdmin
      .from('wallets')
      .update({ virtual_balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', targetWalletId);

    if (updateWalletError) {
      console.error('[Trades API PUT] Wallet update error:', updateWalletError);
      throw new Error(`Failed to credit wallet balance: ${updateWalletError.message}`);
    }

    // 6. Update trade record status to closed
    const { error: updateTradeError } = await supabaseAdmin
      .from('trades')
      .update({
        status: 'closed',
        exit_price: numExitPrice,
        pnl,
        closed_at: new Date().toISOString()
      })
      .eq('id', tradeId);

    if (updateTradeError) {
      console.error('[Trades API PUT] Trade update error:', updateTradeError);
      // Rollback wallet balance
      await supabaseAdmin
        .from('wallets')
        .update({ virtual_balance: balance, updated_at: new Date().toISOString() })
        .eq('id', targetWalletId);

      throw new Error(`Failed to close trade: ${updateTradeError.message}`);
    }

    return NextResponse.json({
      message: 'Position closed successfully',
      tradeId,
      pnl,
      newBalance
    });
  } catch (error) {
    console.error('[Trades API PUT Execution Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to close position. Please try again.' },
      { status: 500 }
    );
  }
}

