import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { validateNickname } from '@/lib/accountTypes';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // 2. Parse request body
    const body = await request.json();
    const { walletId, name, nickname } = body;
    const rawName = nickname !== undefined ? nickname : (name || '');
    
    if (!walletId) {
      return NextResponse.json({ error: 'walletId is required' }, { status: 400 });
    }

    const validation = validateNickname(rawName);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const sanitizedName = validation.nickname;

    // Check duplicate nickname among user's other accounts
    if (sanitizedName) {
      let otherWallets = [];
      try {
        const { data } = await supabaseAdmin
          .from('wallets')
          .select('id, account_name, nickname')
          .eq('user_id', user.id)
          .neq('id', walletId);
        if (data) otherWallets = data;
      } catch (e) {}

      const localDbPath = path.join(process.cwd(), 'local_db.json');
      if (otherWallets.length === 0 && fs.existsSync(localDbPath)) {
        try {
          const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
          otherWallets = db.wallets_multi?.filter(w => w.user_id === user.id && w.id !== walletId) || [];
        } catch (e) {}
      }

      const isDuplicate = otherWallets.some(w => 
        (w.nickname || w.account_name || '').toLowerCase() === sanitizedName.toLowerCase()
      );
      if (isDuplicate) {
        return NextResponse.json({ 
          error: `An account with nickname "${sanitizedName}" already exists. Please choose a unique nickname.` 
        }, { status: 400 });
      }
    }

    // 3. Update wallet in Supabase
    let updated = null;
    try {
      const { data, error } = await supabaseAdmin
        .from('wallets')
        .update({ 
          account_name: sanitizedName || null, 
          nickname: sanitizedName || null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', walletId)
        .eq('user_id', user.id)
        .select('id, account_setup_id')
        .maybeSingle();

      if (!error && data) {
        updated = data;
        if (data.account_setup_id) {
          try {
            await supabaseAdmin
              .from('accounts_setup')
              .update({ nickname: sanitizedName || null, updated_at: new Date().toISOString() })
              .eq('id', data.account_setup_id);
          } catch (e) {}
        }
      }
    } catch (e) {}

    // Local DB update
    const localDbPath = path.join(process.cwd(), 'local_db.json');
    if (fs.existsSync(localDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
        if (db.wallets_multi) {
          const match = db.wallets_multi.find(w => w.id === walletId && w.user_id === user.id);
          if (match) {
            match.account_name = sanitizedName || null;
            match.nickname = sanitizedName || null;
            match.updated_at = new Date().toISOString();
            fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2));
            updated = match;
          }
        }
      } catch (e) {}
    }

    if (!updated) {
      return NextResponse.json({ error: 'Account not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ success: true, nickname: sanitizedName, name: sanitizedName });
  } catch (error) {
    console.error('[Account Rename API Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
