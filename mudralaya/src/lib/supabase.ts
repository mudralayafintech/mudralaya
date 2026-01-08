import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (typeof window !== "undefined") {
  console.log("Supabase URL:", supabaseUrl ? "Present" : "Missing");
  console.log("Supabase Anon Key:", supabaseAnonKey ? "Present" : "Missing");
}

// Custom storage implementation to share session via cookies across subdomains
const cookieStorage = {
  getItem: (key: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp("(^| )" + key + "=([^;]+)"));
    return match ? match[2] : null;
  },
  setItem: (key: string, value: string) => {
    if (typeof document === 'undefined') return;
    const isProd = window.location.hostname.endsWith("mudralaya.com");
    const domainPart = isProd ? ";domain=.mudralaya.com" : "";
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    document.cookie = `${key}=${value};path=/;max-age=${maxAge};SameSite=Lax;Secure${domainPart}`;
  },
  removeItem: (key: string) => {
    if (typeof document === 'undefined') return;
    const isProd = window.location.hostname.endsWith("mudralaya.com");
    const domainPart = isProd ? ";domain=.mudralaya.com" : "";
    document.cookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=Lax;Secure${domainPart}`;
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
