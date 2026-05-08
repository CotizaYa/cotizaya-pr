import { createBrowserClient } from "@supabase/ssr";
import { getSafeSupabaseBrowserConfig } from "./config";

export function createClient() {
  const { url, anonKey } = getSafeSupabaseBrowserConfig();

  return createBrowserClient(url, anonKey);
}
