import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabaseAdmin';

async function verifyAdmin(supabase) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const supabaseAdmin = createAdminClient();
  const { data: dbUser } = await supabaseAdmin
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
  
  let isAdmin = dbUser?.is_admin === true || emailMatch;

  if (!isAdmin) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user };
}

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Competitions GET Error]:', error);
      return NextResponse.json({ error: error.message || 'Failed to fetch competitions' }, { status: 500 });
    }

    return NextResponse.json({ competitions: data || [] });
  } catch (error) {
    console.error('[Admin Competitions GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const adminCheck = await verifyAdmin(supabase);
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const { 
      title, description, entry_fee, start_date, end_date, target_profit_percent,
      prize_pool, max_participants, initial_equity, status, banner_image_url, banner_video_url,
      is_premium_only
    } = body;

    if (!title || !start_date || !end_date || target_profit_percent === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newComp = {
      title,
      description: description || '',
      entry_fee: parseFloat(entry_fee || 0),
      start_date,
      end_date,
      target_profit_percent: parseFloat(target_profit_percent),
      prize_pool: parseFloat(prize_pool || 0),
      max_participants: parseInt(max_participants || 1000),
      initial_equity: parseFloat(initial_equity || 10000),
      status: status || 'upcoming',
      banner_image_url: banner_image_url || null,
      banner_video_url: banner_video_url || null,
      is_premium_only: !!is_premium_only
    };

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('competitions')
      .insert(newComp)
      .select()
      .single();

    if (error || !data) {
      console.error('[Admin Competitions POST Error]:', error);
      return NextResponse.json({ error: error?.message || 'Failed to create competition' }, { status: 500 });
    }

    return NextResponse.json({ success: true, competition: data });
  } catch (error) {
    console.error('[Admin Competitions POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient();
    const adminCheck = await verifyAdmin(supabase);
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const { 
      id, title, description, entry_fee, start_date, end_date, target_profit_percent, 
      status, prize_pool, max_participants, initial_equity, banner_image_url, banner_video_url,
      is_premium_only
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing competition id' }, { status: 400 });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (entry_fee !== undefined) updates.entry_fee = parseFloat(entry_fee);
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;
    if (target_profit_percent !== undefined) updates.target_profit_percent = parseFloat(target_profit_percent);
    if (status !== undefined) updates.status = status;
    if (prize_pool !== undefined) updates.prize_pool = parseFloat(prize_pool);
    if (max_participants !== undefined) updates.max_participants = parseInt(max_participants);
    if (initial_equity !== undefined) updates.initial_equity = parseFloat(initial_equity);
    if (banner_image_url !== undefined) updates.banner_image_url = banner_image_url;
    if (banner_video_url !== undefined) updates.banner_video_url = banner_video_url;
    if (is_premium_only !== undefined) updates.is_premium_only = !!is_premium_only;

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('competitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('[Admin Competitions PUT Error]:', error);
      return NextResponse.json({ error: error?.message || 'Failed to update competition' }, { status: 500 });
    }

    return NextResponse.json({ success: true, competition: data });
  } catch (error) {
    console.error('[Admin Competitions PUT Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const adminCheck = await verifyAdmin(supabase);
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing competition id' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from('competitions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Admin Competitions DELETE Error]:', error);
      return NextResponse.json({ error: error.message || 'Failed to delete competition' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Competitions DELETE Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

