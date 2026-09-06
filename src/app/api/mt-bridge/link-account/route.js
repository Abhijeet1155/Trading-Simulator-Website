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

export async function POST(request) {
  try {
    const body = await request.json();
    const { login, password, server, platform = 'MT5' } = body;

    if (!login || !password) {
      return NextResponse.json({ error: 'Missing account login ID or password.' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const localDbPath = path.join(process.cwd(), 'local_db.json');

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
      return NextResponse.json({ error: 'Trading account not found. Please verify your Account ID.' }, { status: 404 });
    }

    const expectedMaster = wallet.mt_master_password || generateDemoPassword(wallet.account_number);
    const expectedInvestor = wallet.mt_investor_password || getInvestorPassword(wallet.account_number);

    const isMaster = password === expectedMaster;
    const isInvestor = password === expectedInvestor;

    if (!isMaster && !isInvestor) {
      return NextResponse.json({ error: 'Invalid password. Check your Master or Investor password in the Account Setup portal.' }, { status: 401 });
    }

    const balance = parseFloat(wallet.virtual_balance || wallet.balance || 0);

    return NextResponse.json({
      success: true,
      message: 'Account successfully linked with MetaTrader ' + platform + ' bridge.',
      accessLevel: isMaster ? 'Full Trading' : 'Investor Read-Only',
      account: {
        id: wallet.id,
        accountNumber: wallet.account_number,
        nickname: wallet.nickname || wallet.account_name || ('Demo #' + wallet.account_number),
        platform: wallet.platform || platform,
        balance: balance,
        equity: balance,
        currency: wallet.currency || 'USD',
        leverage: wallet.leverage || 100,
        server: server || ('PaperPulse-Demo-' + (wallet.platform || platform)),
        lastSync: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[MT Bridge Link Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal link error' }, { status: 500 });
  }
}
