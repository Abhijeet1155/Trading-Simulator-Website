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

    // Strictly filter trades by user_id AND active wallet_id
    const { data: trades, error } = await supabaseAdmin
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('wallet_id', activeWallet.id);

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

    const { data: trade, error: insertError } = await supabaseAdmin
      .from('trades')
      .insert(insertData)
      .select()
      .single();

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
    let wallet = null;

    if (trade.wallet_id) {
      const { data, error } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('id', trade.wallet_id)
        .maybeSingle();
      if (error) console.error('[Trades API PUT] Wallet fetch by wallet_id error:', error);
      wallet = data;
    }

    if (!wallet) {
      // Fallback for legacy trades (wallet_id is null): lookup wallet by user_id
      const { data: userWallets, error: userWalletsErr } = await supabaseAdmin
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (userWalletsErr || !userWallets || userWallets.length === 0) {
        console.error('[Trades API PUT] Fallback wallet fetch by user_id error:', userWalletsErr);
        throw new Error(`Target wallet not found for user: ${userWalletsErr?.message || 'Wallet missing'}`);
      }

      wallet = userWallets.find(w => w.is_active || w.is_default || w.balance_configured) || userWallets[0];

      // Backfill trade record with resolved wallet_id for future operations
      if (wallet && wallet.id) {
        await supabaseAdmin
          .from('trades')
          .update({ wallet_id: wallet.id })
          .eq('id', tradeId);
      }
    }

    if (!wallet) {
      throw new Error('Target wallet missing');
    }

    const targetWalletId = wallet.id;
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

