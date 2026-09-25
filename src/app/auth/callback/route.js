import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle forwarded host for production deployment (e.g. Vercel)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  let redirectBase = origin;
  if (!isLocalEnv && forwardedHost) {
    redirectBase = `https://${forwardedHost}`;
  }

  // Determine where to redirect next
  const next = searchParams.get('next') ?? (type === 'recovery' ? '/reset-password' : '/dashboard');

  // Handle explicit errors passed by Supabase (e.g. link expired)
  if (errorParam) {
    const msg = errorDescription || 'Could not verify link. It may be expired or already used.';
    return NextResponse.redirect(`${redirectBase}/login?error=${encodeURIComponent(msg)}`);
  }

  // 1. Handle token_hash OTP verification (email verification links with token_hash)
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`);
    } else {
      console.error('verifyOtp error in callback route:', error);
      return NextResponse.redirect(
        `${redirectBase}/login?error=${encodeURIComponent(error.message || 'Invalid or expired verification link.')}`
      );
    }
  }

  // 2. Handle PKCE authorization code exchange
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`);
    } else {
      console.error('exchangeCodeForSession error in callback route:', error);

      // If code exchange failed because the PKCE code verifier cookie is absent in this browser
      // (e.g. user opened the email verification link in a different browser/device/mail app),
      // Supabase Auth server has already confirmed the email at /auth/v1/verify.
      // Redirect with a success message so the user can log in seamlessly.
      const isPkceStorageError =
        error.message?.includes('code verifier') ||
        error.message?.includes('PKCE') ||
        error.code === 'pkce_code_verifier_not_found';

      if (isPkceStorageError) {
        return NextResponse.redirect(
          `${redirectBase}/login?message=${encodeURIComponent('Email verified successfully! Please log in to continue.')}`
        );
      }

      return NextResponse.redirect(
        `${redirectBase}/login?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // Fallback if no code and no token_hash parameters provided
  return NextResponse.redirect(
    `${redirectBase}/login?error=${encodeURIComponent('Invalid or expired authentication link.')}`
  );
}
