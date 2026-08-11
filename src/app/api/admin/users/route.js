import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';

async function checkAdmin(user) {
  const supabaseAdmin = createAdminClient();
  const { data: callerUser } = await supabaseAdmin
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  const ADMIN_EMAILS = [
    'patilabhijeet409@gmail.com',
    'abhieet881@gmail.com',
    'abhijeetpatil881@gmail.com',
    'abhijeet881@gmail.com',
    'gzabhijeet@gmail.com'
  ];
  const emailMatch = ADMIN_EMAILS.some(
    (e) => e.toLowerCase() === (user.email || '').toLowerCase()
  );
  
  return callerUser?.is_admin === true || emailMatch;
}

// PUT: Edit user profile details, plan, balance, or active status
export async function PUT(request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate caller
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if caller is admin
    const isAdmin = await checkAdmin(user);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Parse request body
    const body = await request.json();
    const { userId, status, name, plan_type, virtual_balance } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 4. Perform updates in Supabase
    const userUpdates = {};
    if (status !== undefined) userUpdates.status = status;
    if (name !== undefined) userUpdates.name = name;
    if (plan_type !== undefined) userUpdates.plan_type = plan_type;

    if (Object.keys(userUpdates).length > 0) {
      const { error: userUpdateErr } = await supabaseAdmin
        .from('users')
        .update(userUpdates)
        .eq('id', userId);
      if (userUpdateErr) {
        console.error('[Admin Users PUT] User update error:', userUpdateErr);
        return NextResponse.json({ error: userUpdateErr.message || 'Failed to update user' }, { status: 500 });
      }
    }

    if (virtual_balance !== undefined) {
      const { error: walletUpdateErr } = await supabaseAdmin
        .from('wallets')
        .update({ virtual_balance: parseFloat(virtual_balance), updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (walletUpdateErr) {
        console.error('[Admin Users PUT] Wallet update error:', walletUpdateErr);
        return NextResponse.json({ error: walletUpdateErr.message || 'Failed to update user wallet' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Users PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Permanently delete a user account and cascade to all trade, wallet, and participation records
export async function DELETE(request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate caller
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if caller is admin
    const isAdmin = await checkAdmin(user);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Resolve user to delete
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 4. Perform deletes in Supabase
    // Deleting public.users cascades to trades, wallets, and competition_participants tables
    const { error: deleteErr } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (deleteErr) {
      console.error('[Admin Users DELETE Error]:', deleteErr);
      return NextResponse.json({ error: deleteErr.message || 'Failed to delete user' }, { status: 500 });
    }

    // Clean up Supabase Auth account using Admin Service Role client
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    } catch (authDeleteErr) {
      console.warn('[Admin Users DELETE] Auth user cleanup warning:', authDeleteErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Users DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

