import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { sendPasswordResetEmail } from '@/lib/mailer';

// In-memory rate limiting fallback map (email -> array of timestamps)
const rateLimitMap = new Map();

function checkRateLimit(email) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 3;

  const timestamps = rateLimitMap.get(email) || [];
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(email, validTimestamps);
  return true;
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // In-memory rate limit check
    if (!checkRateLimit(emailLower)) {
      return NextResponse.json(
        { success: false, error: 'Too many password reset requests for this email. Please try again in an hour.' },
        { status: 429 }
      );
    }

    const supabase = createAdminClient();

    // 1. Look up user in public.users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', emailLower)
      .maybeSingle();

    // Always respond with success to prevent email enumeration attacks
    const genericSuccessResponse = NextResponse.json({
      success: true,
      message: 'If this email exists in our system, a reset link has been sent.',
    });

    if (userError || !user) {
      console.log(`[Forgot Password] Requested email ${emailLower} not found in users table.`);
      return genericSuccessResponse;
    }

    // DB Rate limit check: max 3 tokens generated in the last 60 minutes
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('password_reset_tokens')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (!countError && count >= 3) {
      return NextResponse.json(
        { success: false, error: 'Too many password reset requests. Please wait an hour before requesting another link.' },
        { status: 429 }
      );
    }

    // 2. Generate secure cryptographically random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    // 3. Store token in password_reset_tokens table
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: token,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (insertError) {
      console.error('[Forgot Password] Error inserting reset token into DB:', insertError);
      // Fallback response if table doesn't exist yet or DB error
      return genericSuccessResponse;
    }

    // 4. Construct reset link URL
    const requestUrl = new URL(req.url);
    const origin = requestUrl.origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    // 5. Send email via Nodemailer
    await sendPasswordResetEmail({
      toEmail: emailLower,
      name: user.name,
      resetUrl: resetUrl,
    });

    return genericSuccessResponse;
  } catch (error) {
    console.error('[Forgot Password API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
