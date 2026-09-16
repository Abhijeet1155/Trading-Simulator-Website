import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client equipped with the Service Role key.
 * This allows backend administrative tasks like updating user passwords
 * without requiring the user's active session or old password.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      '[Supabase Admin Warning] SUPABASE_SERVICE_ROLE_KEY is not set in environment variables. Falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Lazy/Instance export for direct consumption
export const supabaseAdmin = createAdminClient();
export default createAdminClient;
