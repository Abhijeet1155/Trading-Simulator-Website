import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token || !token.trim()) {
      return NextResponse.json(
        { valid: false, error: 'Reset token is missing or invalid.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Query password_reset_tokens
    const { data: tokenData, error } = await supabase
      .from('password_reset_tokens')
      .select('id, user_id, expires_at, used')
      .eq('token', token.trim())
      .maybeSingle();

    if (error || !tokenData) {
      return NextResponse.json(
        { valid: false, error: 'This password reset link is invalid or has already been used.' },
        { status: 400 }
      );
    }

    if (tokenData.used) {
      return NextResponse.json(
        { valid: false, error: 'This password reset link has already been used.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (now > expiresAt) {
      return NextResponse.json(
        { valid: false, error: 'This password reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('[Verify Reset Token API Error]:', error);
    return NextResponse.json(
      { valid: false, error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
