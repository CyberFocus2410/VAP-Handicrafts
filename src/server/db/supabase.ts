import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Creates an anonymous / public client bounded by RLS policies.
 */
export function getSupabaseAnonClient() {
  return createClient(
    env.client.NEXT_PUBLIC_SUPABASE_URL,
    env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}

/**
 * Creates a privileged service-role client that bypasses RLS for administrative operations,
 * background workers, and database seeding.
 *
 * STAYS STRICTLY ON THE SERVER.
 */
export function getSupabaseAdminClient() {
  const serviceKey = env.server.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "[Supabase Admin Error] SUPABASE_SERVICE_ROLE_KEY is required for privileged server operations."
    );
  }

  return createClient(env.client.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
