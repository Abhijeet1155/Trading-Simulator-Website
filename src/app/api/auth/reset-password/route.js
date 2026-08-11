import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(req) {
  try {
    const { token, password, confirmPassword } = await req.json();

    if (!token || !token.trim()) {
      return NextResponse.json({ success: false, error: 'Reset token is required.' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match.' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch token record from DB
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('id, user_id, expires_at, used')
      .eq('token', token.trim())
      .maybeSingle();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, error: 'This password reset link is invalid or has already been used.' },
        { status: 400 }
      );
    }

    if (tokenData.used) {
      return NextResponse.json(
        { success: false, error: 'This password reset link has already been used. Please request a new one.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, error: 'This password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 2. Update user's auth password via Supabase Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(tokenData.user_id, {
      password: password,
    });

    if (updateError) {
      console.error('[Reset Password] Supabase Admin updateUserById error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message || 'Failed to update password.' },
        { status: 400 }
      );
    }

    // 3. Mark token as used immediately to ensure single-use security
    const { error: markUsedError } = await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id);

    if (markUsedError) {
      console.error('[Reset Password] Error marking token as used:', markUsedError);
    }

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully.',
    });
  } catch (error) {
    console.error('[Reset Password API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
