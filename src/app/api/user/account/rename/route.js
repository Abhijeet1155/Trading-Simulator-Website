import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';

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
    const { walletId, name } = body;
    
    if (!walletId) {
      return NextResponse.json({ error: 'walletId is required' }, { status: 400 });
    }

    const trimmedName = name ? name.trim().substring(0, 50) : '';

    // 3. Update wallet in Supabase
    const { data, error } = await supabaseAdmin
      .from('wallets')
      .update({ account_name: trimmedName || null, updated_at: new Date().toISOString() })
      .eq('id', walletId)
      .eq('user_id', user.id)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('[Account Rename API Error]:', error);
      return NextResponse.json({ error: error.message || 'Failed to rename account' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Wallet not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ success: true, name: trimmedName });
  } catch (error) {
    console.error('[Account Rename API Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

