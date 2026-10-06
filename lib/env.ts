/**
 * Environment configuration validator.
 * Fails loudly on application startup if any required environment variable is missing or empty.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `[FATAL CONFIG ERROR] Missing required environment variable: ${key}. Ensure it is defined in .env.local`
    );
  }
  return value.trim();
}

export const env = {
  get NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY(): string {
    return requireEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  },
  get CLERK_SECRET_KEY(): string {
    return requireEnv("CLERK_SECRET_KEY");
  },
  get NEXT_PUBLIC_SUPABASE_URL(): string {
    return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  },
  get SUPABASE_ANON_KEY(): string {
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key || key.trim() === "") {
      throw new Error(
        "[FATAL CONFIG ERROR] Missing Supabase client key: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local"
      );
    }
    return key.trim();
  },
};

export function validateEnv(): void {
  const values = [
    env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    env.CLERK_SECRET_KEY,
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
  ];

  if (values.some((v) => !v || v.length === 0)) {
    throw new Error("[FATAL CONFIG ERROR] Incomplete environment configuration detected at startup.");
  }
}
