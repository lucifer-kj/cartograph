import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { env } from "@/lib/env";

/**
 * Creates a server-side Supabase client carrying the current Clerk identity token.
 * 
 * Architectural decisions:
 * 1. Clerk owns the session exclusively. Supabase session cookies and refresh flows
 *    are disabled (persistSession: false, autoRefreshToken: false) to prevent session collisions.
 * 2. Every request attaches the Clerk JWT in the Authorization header so Postgres
 *    Row-Level Security (RLS) policies can inspect the user and organization claims.
 */
export async function createServerClient() {
  const { getToken } = await auth();
  const token = await getToken();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
