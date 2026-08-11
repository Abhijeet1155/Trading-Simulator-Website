import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const supabase = await createClient();
    const emailLower = email.toLowerCase().trim();
    const requestUrl = new URL(req.url);
    const origin = requestUrl.origin;

    // Supabase resetPasswordForEmail removed to prevent Supabase built-in emails.
    // Custom email / Nodemailer flow is handled separately.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}
