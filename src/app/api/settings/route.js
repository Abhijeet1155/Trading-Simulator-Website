import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('name, email, plan_type, status, theme_preference')
      .eq('id', user.id)
      .single();

    if (error || !dbUser) {
      return NextResponse.json({
        name: user.user_metadata?.name || 'Trader',
        email: user.email,
        theme_preference: user.user_metadata?.theme_preference || 'light'
      });
    }

    return NextResponse.json({
      name: dbUser.name,
      email: dbUser.email,
      plan_type: dbUser.plan_type,
      theme_preference: dbUser.theme_preference || 'light'
    });
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const supabase = await createClient();
  
  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, theme, theme_preference } = body;
    const targetTheme = theme_preference || theme;

    const updates = {};
    const metadataUpdates = {};

    if (name !== undefined) {
      const cleanName = name.trim();
      if (!cleanName) {
        return NextResponse.json({ error: 'Full name cannot be empty.' }, { status: 400 });
      }
      updates.name = cleanName;
      metadataUpdates.name = cleanName;
    }

    if (targetTheme !== undefined) {
      const validThemes = ['light', 'dark', 'system'];
      if (validThemes.includes(targetTheme)) {
        updates.theme_preference = targetTheme;
        metadataUpdates.theme_preference = targetTheme;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No changes provided' });
    }

    // 1. Update public.users table
    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (updateError) {
      if (updateError.message?.includes('schema cache') || updateError.message?.includes('does not exist') || updateError.message?.includes('theme_preference')) {
        console.warn('[Supabase settings fallback] Handled column/cache gracefully:', updateError.message);
      } else {
        throw updateError;
      }
    }

    // 2. Update auth user metadata so session reflects changes
    if (Object.keys(metadataUpdates).length > 0) {
      try {
        await supabase.auth.updateUser({
          data: metadataUpdates
        });
      } catch (authMetaErr) {
        console.warn('Failed to update auth metadata:', authMetaErr);
      }
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      ...updates
    });
  } catch (error) {
    console.error('Failed to update profile settings:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
