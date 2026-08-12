import { createAdminClient } from './src/lib/supabaseAdmin.js';

async function verifySchemaAndTrades() {
  const supabaseAdmin = createAdminClient();
  const { data: trades, error } = await supabaseAdmin
    .from('trades')
    .select('id, user_id, wallet_id, symbol, side, entry_price, status');

  if (error) {
    console.error("Error fetching trades:", error);
    return;
  }

  console.log(`Success! Fetched ${trades.length} trades with wallet_id column:`);
  trades.forEach(t => {
    console.log({
      id: t.id,
      user_id: t.user_id,
      wallet_id: t.wallet_id,
      symbol: t.symbol,
      side: t.side,
      entry_price: t.entry_price,
      status: t.status
    });
  });
}

verifySchemaAndTrades();
