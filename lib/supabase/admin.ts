import { createClient } from "@supabase/supabase-js";

export function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return "";
  let clean = rawUrl.trim();
  clean = clean.replace(/\/+$/, "");
  clean = clean.replace(/\/rest\/v1\/?$/i, "");
  clean = clean.replace(/\/+$/, "");
  return clean;
}

export function isSupabaseConfigured(): boolean {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !serviceRoleKey) return false;
  if (
    rawUrl.includes("placeholder") ||
    rawUrl.includes("your-project") ||
    serviceRoleKey.includes("placeholder") ||
    serviceRoleKey.includes("...")
  ) {
    return false;
  }
  return true;
}

export function createAdminClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabaseUrl = sanitizeSupabaseUrl(rawUrl);

  if (!isSupabaseConfigured()) {
    // Return dummy client without spamming warnings
  }

  return createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    serviceRoleKey || "placeholder-key",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
