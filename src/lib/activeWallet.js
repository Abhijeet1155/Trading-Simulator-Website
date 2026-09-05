import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabaseAdmin';
import fs from 'fs';
import path from 'path';

export async function getActiveWallet(userId) {
  const supabase = createAdminClient();
  const cookieStore = await cookies();
  const activeWalletId = cookieStore.get('pp_active_wallet_id')?.value;

  let wallets = [];
  let useLocalFallback = false;

  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    wallets = (data || []).map(item => ({
      ...item,
      balance_configured: item.balance_configured ?? true,
      account_name: item.nickname || item.account_name || 'Primary Demo',
      nickname: item.nickname || item.account_name || 'Primary Demo',
      account_type: item.account_type || 'standard',
      leverage: parseInt(item.leverage || 100, 10),
      currency: item.currency || 'USD',
      execution_type: item.execution_type || 'Market',
      platform: item.platform || 'MT5',
      is_demo: item.is_demo !== undefined ? item.is_demo : true,
      virtual_balance: parseFloat(item.virtual_balance || item.balance || 0),
      initial_balance: parseFloat(item.initial_balance || item.starting_balance || 10000.00)
    }));
  } catch (err) {
    console.error('[getActiveWallet Error]:', err);
    useLocalFallback = true;
  }

  const localDbPath = path.join(process.cwd(), 'local_db.json');

  if (useLocalFallback || wallets.length === 0) {
    if (fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        
        // Migrate old single wallet structure to wallets_multi if needed
        if (db.wallets && db.wallets[userId] !== undefined) {
          if (!db.wallets_multi) db.wallets_multi = [];
          const exists = db.wallets_multi.some(w => w.id === userId && w.user_id === userId);
          if (!exists) {
            const hash = userId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
            const defaultAccNum = String(Math.abs(hash % 900000) + 100000);
            
            db.wallets_multi.push({
              id: userId,
              user_id: userId,
              account_number: defaultAccNum,
              account_name: 'Primary Demo',
              nickname: 'Primary Demo',
              account_type: 'standard',
              leverage: 100,
              currency: 'USD',
              execution_type: 'Market',
              platform: 'MT5',
              is_demo: true,
              virtual_balance: db.wallets[userId],
              initial_balance: db.initial_balances?.[userId] || 10000.00,
              balance_configured: db.wallets_configured?.[userId] !== undefined ? db.wallets_configured[userId] : true,
              updated_at: new Date().toISOString()
            });
            fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
          }
        }

        if (useLocalFallback) {
          const rawWallets = db.wallets_multi?.filter(w => w.user_id === userId) || [];
          wallets = rawWallets.map(w => ({
            ...w,
            balance_configured: w.balance_configured ?? true,
            account_name: w.nickname || w.account_name || 'Primary Demo',
            nickname: w.nickname || w.account_name || 'Primary Demo',
            account_type: w.account_type || 'standard',
            leverage: parseInt(w.leverage || 100, 10),
            currency: w.currency || 'USD',
            execution_type: w.execution_type || 'Market',
            platform: w.platform || 'MT5',
            is_demo: w.is_demo !== undefined ? w.is_demo : true,
            virtual_balance: parseFloat(w.virtual_balance || w.balance || 0),
            initial_balance: parseFloat(w.initial_balance || w.starting_balance || 10000.00)
          }));
        }
      } catch (e) {
        console.error('Error reading local db in active wallet resolution:', e);
      }
    }
  }

  // If still no wallets found, create a default onboarding wallet
  if (wallets.length === 0) {
    const hash = userId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const defaultAccNum = String(Math.abs(hash % 900000) + 100000);
    
    const newWallet = {
      id: userId,
      user_id: userId,
      account_number: defaultAccNum,
      account_name: 'Primary Demo',
      nickname: 'Primary Demo',
      account_type: 'standard',
      leverage: 100,
      currency: 'USD',
      execution_type: 'Market',
      platform: 'MT5',
      is_demo: true,
      virtual_balance: 10000.00,
      initial_balance: 10000.00,
      balance_configured: true,
      updated_at: new Date().toISOString()
    };

    if (!useLocalFallback) {
      try {
        const { data, error } = await supabase
          .from('wallets')
          .insert(newWallet)
          .select()
          .single();
        
        if (error) {
          if (error.message?.includes('schema cache') || error.message?.includes('does not exist') || error.message?.includes('column')) {
            useLocalFallback = true;
          } else {
            throw error;
          }
        } else if (data) {
          wallets = [data];
        }
      } catch (e) {
        console.warn('Failed to insert default wallet in Supabase, using local fallback:', e.message);
        useLocalFallback = true;
      }
    }

    if (useLocalFallback) {
      try {
        const db = fs.existsSync(localDbPath) ? JSON.parse(fs.readFileSync(localDbPath, 'utf8')) : { trades: [], wallets: {} };
        if (!db.wallets_multi) db.wallets_multi = [];
        const exists = db.wallets_multi.some(w => w.user_id === userId && w.id === userId);
        if (!exists) {
          db.wallets_multi.push(newWallet);
          fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
        }
        wallets = [newWallet];
      } catch (e) {
        console.error('Failed to create default local wallet:', e);
      }
    }
  }

  // Ensure all wallets have an account_number and account_name fallback
  wallets = wallets.map(w => {
    const hash = (w.id || userId).split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const defaultAccNum = String(Math.abs(hash % 900000) + 100000);
    return {
      ...w,
      account_number: w.account_number || defaultAccNum,
      account_name: w.nickname || w.account_name || null,
      nickname: w.nickname || w.account_name || null,
      account_type: w.account_type || 'standard',
      leverage: parseInt(w.leverage || 100, 10),
      currency: w.currency || 'USD',
      execution_type: w.execution_type || 'Market',
      platform: w.platform || 'MT5',
      is_demo: w.is_demo !== undefined ? w.is_demo : true
    };
  });

  // Sort wallets so the primary one (id === userId or account_name === 'Primary Demo') is first
  wallets.sort((a, b) => {
    const aIsPrimary = a.id === userId || a.account_name === 'Primary Demo';
    const bIsPrimary = b.id === userId || b.account_name === 'Primary Demo';
    if (aIsPrimary && !bIsPrimary) return -1;
    if (!aIsPrimary && bIsPrimary) return 1;
    return 0;
  });

  // Find active wallet based on cookie
  let activeWallet = wallets.find(w => w.id === activeWalletId);
  if (!activeWallet) {
    activeWallet = wallets.find(w => w.account_number === activeWalletId);
  }
  if (!activeWallet) {
    activeWallet = wallets[0];
  }

  return {
    activeWallet,
    wallets,
    useLocalFallback
  };
}
