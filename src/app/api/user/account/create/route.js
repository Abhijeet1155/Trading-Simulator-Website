import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { 
  getAccountTypes, 
  validateLeverage, 
  validateNickname, 
  validateStartingBalance,
  SUPPORTED_CURRENCIES,
  SUPPORTED_PLATFORMS,
  SUPPORTED_EXECUTION_TYPES
} from '@/lib/accountTypes';
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
    const accountTypes = await getAccountTypes();

    // 2. Parse request body
    const body = await request.json();
    const { 
      amount, 
      startingBalance,
      name, 
      nickname, 
      accountType = 'standard', 
      leverage = 100,
      currency = 'USD',
      executionType = 'Market',
      platform = 'MT5',
      isDemo = true
    } = body;

    const rawAmount = amount !== undefined ? amount : (startingBalance !== undefined ? startingBalance : 10000);
    const rawNickname = nickname !== undefined ? nickname : (name || '');

    // 3. Validate Account Type
    const normalizedType = accountType === 'standard_micro' ? 'standard_cent' : accountType;
    const typeConfig = accountTypes.find(t => t.id === normalizedType) || accountTypes.find(t => t.id === 'standard');
    if (!typeConfig) {
      return NextResponse.json({ error: 'Invalid account type selected.' }, { status: 400 });
    }

    // 4. Validate Starting Balance against Account Type Min Deposit
    const balanceValidation = validateStartingBalance(rawAmount, normalizedType, accountTypes);
    if (!balanceValidation.valid) {
      return NextResponse.json({ error: balanceValidation.error }, { status: 400 });
    }
    const numAmount = balanceValidation.amount;

    // 5. Validate Nickname
    const nicknameValidation = validateNickname(rawNickname);
    if (!nicknameValidation.valid) {
      return NextResponse.json({ error: nicknameValidation.error }, { status: 400 });
    }
    const sanitizedNickname = nicknameValidation.nickname;

    // 6. Validate Leverage
    const leverageValidation = validateLeverage(leverage, normalizedType, accountTypes);
    if (!leverageValidation.valid) {
      return NextResponse.json({ error: leverageValidation.error }, { status: 400 });
    }
    const numLeverage = leverageValidation.leverage;

    // 7. Validate Currency, Platform, Execution Type
    const validCurrency = SUPPORTED_CURRENCIES.includes(currency?.toUpperCase()) ? currency.toUpperCase() : 'USD';
    const validPlatform = SUPPORTED_PLATFORMS.includes(platform) ? platform : 'MT5';
    const validExecType = SUPPORTED_EXECUTION_TYPES.includes(executionType) ? executionType : 'Market';
    const validIsDemo = Boolean(isDemo);

    // 8. Resolve user plan type & account limits (Free: 5, Premium: 10)
    let planType = 'free';
    try {
      const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('plan_type')
        .eq('id', user.id)
        .single();
      if (dbUser && dbUser.plan_type) {
        planType = dbUser.plan_type.toLowerCase();
      }
    } catch (e) {
      // default to free
    }

    const maxAccounts = planType === 'premium' ? 10 : 5;

    // 9. Fetch existing wallets / accounts count
    let existingWallets = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('wallets')
        .select('id, account_name, nickname')
        .eq('user_id', user.id);
      if (!error && data) {
        existingWallets = data;
      }
    } catch (e) {
      // ignore
    }

    const localDbPath = path.join(process.cwd(), 'local_db.json');
    if (existingWallets.length === 0 && fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        existingWallets = db.wallets_multi?.filter(w => w.user_id === user.id) || [];
      } catch (e) {}
    }

    if (existingWallets.length >= maxAccounts) {
      const planMsg = planType === 'premium' 
        ? `Maximum limit of ${maxAccounts} accounts reached for Premium plan.` 
        : `Maximum limit of ${maxAccounts} accounts reached for Free plan. Upgrade to Premium for up to 10 accounts!`;
      return NextResponse.json({ error: planMsg }, { status: 400 });
    }

    // Check Nickname uniqueness per user
    if (sanitizedNickname) {
      const isDuplicate = existingWallets.some(w => 
        (w.nickname || w.account_name || '').toLowerCase() === sanitizedNickname.toLowerCase()
      );
      if (isDuplicate) {
        return NextResponse.json({ 
          error: `An account with nickname "${sanitizedNickname}" already exists. Please choose a unique nickname.` 
        }, { status: 400 });
      }
    }

    // 10. Generate unique 6-digit account number
    let newAccountNumber = '';
    let collision = true;
    let attempts = 0;
    while (collision && attempts < 20) {
      attempts++;
      const randNum = String(Math.floor(100000 + Math.random() * 900000));
      
      try {
        const { data } = await supabaseAdmin
          .from('wallets')
          .select('id')
          .eq('account_number', randNum)
          .maybeSingle();
        
        if (!data) {
          newAccountNumber = randNum;
          collision = false;
        }
      } catch (e) {
        newAccountNumber = randNum;
        collision = false;
      }
    }

    if (!newAccountNumber) {
      newAccountNumber = String(Math.floor(100000 + Math.random() * 900000));
    }

    // 11. Create entry in accounts_setup table if exists
    let accountSetupId = null;
    try {
      const { data: setupData, error: setupError } = await supabaseAdmin
        .from('accounts_setup')
        .insert({
          user_id: user.id,
          account_number: newAccountNumber,
          account_type: normalizedType,
          nickname: sanitizedNickname || null,
          leverage: numLeverage,
          starting_balance: numAmount,
          currency: validCurrency,
          execution_type: validExecType,
          platform: validPlatform,
          is_demo: validIsDemo,
          balance: numAmount,
          equity: numAmount,
          margin: 0.00,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (!setupError && setupData) {
        accountSetupId = setupData.id;
      }
    } catch (err) {
      console.warn('accounts_setup insert warning:', err.message);
    }

    // 12. Create entry in wallets table
    let insertData = {
      user_id: user.id,
      account_number: newAccountNumber,
      account_name: sanitizedNickname || null,
      nickname: sanitizedNickname || null,
      virtual_balance: numAmount,
      currency: validCurrency,
      initial_balance: numAmount,
      balance_configured: true,
      account_type: normalizedType,
      leverage: numLeverage,
      execution_type: validExecType,
      platform: validPlatform,
      is_demo: validIsDemo,
      account_setup_id: accountSetupId,
      updated_at: new Date().toISOString()
    };

    let createdWallet = null;
    let insertError = null;

    try {
      const res = await supabaseAdmin
        .from('wallets')
        .insert(insertData)
        .select()
        .single();
      createdWallet = res.data;
      insertError = res.error;
    } catch (e) {
      insertError = e;
    }

    // Fallback if some new columns are missing in Supabase wallets table schema
    if (insertError) {
      console.warn('[Account Create] Supabase full insert failed, trying minimal columns:', insertError.message);
      const minimalData = {
        user_id: user.id,
        account_number: newAccountNumber,
        account_name: sanitizedNickname || null,
        virtual_balance: numAmount,
        currency: validCurrency,
        initial_balance: numAmount,
        balance_configured: true,
        account_type: normalizedType,
        leverage: numLeverage,
        updated_at: new Date().toISOString()
      };
      
      try {
        const retry = await supabaseAdmin
          .from('wallets')
          .insert(minimalData)
          .select()
          .single();
        createdWallet = retry.data;
        insertError = retry.error;
      } catch (retryErr) {
        insertError = retryErr;
      }
    }

    // Local DB fallback support
    if (!createdWallet || insertError) {
      try {
        const db = fs.existsSync(localDbPath) ? JSON.parse(fs.readFileSync(localDbPath, 'utf8')) : { trades: [], wallets_multi: [] };
        if (!db.wallets_multi) db.wallets_multi = [];
        
        const localWalletId = 'w_' + Math.random().toString(36).substring(2, 11);
        const localWallet = {
          id: localWalletId,
          ...insertData
        };
        db.wallets_multi.push(localWallet);
        fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
        createdWallet = localWallet;
        insertError = null;
      } catch (localErr) {
        console.error('Failed to write to local_db.json:', localErr);
      }
    }

    if (!createdWallet) {
      return NextResponse.json({ error: insertError?.message || 'Failed to create account.' }, { status: 500 });
    }

    // 13. Set active wallet cookie
    const cookieStore = await cookies();
    cookieStore.set('pp_active_wallet_id', createdWallet.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json({ 
      success: true, 
      wallet: createdWallet,
      account: {
        id: createdWallet.id,
        accountNumber: createdWallet.account_number,
        nickname: sanitizedNickname || `Demo #${newAccountNumber}`,
        accountType: normalizedType,
        accountTypeDetails: typeConfig,
        leverage: numLeverage,
        currency: validCurrency,
        executionType: validExecType,
        platform: validPlatform,
        isDemo: validIsDemo,
        balance: numAmount,
        initialBalance: numAmount,
        equity: numAmount,
        margin: 0,
        isActive: true
      }
    });
  } catch (error) {
    console.error('[Account Create API Fatal Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
