import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Custom storage implementation to share session via cookies across subdomains
const cookieStorage = {
  getItem: (key) => {
    const match = document.cookie.match(new RegExp("(^| )" + key + "=([^;]+)"));
    return match ? match[2] : null;
  },
  setItem: (key, value) => {
    // Determine domain: if on localhost, don't set domain (or set localhost).
    // If on mudralaya.com or subdomains, set .mudralaya.com
    const isProd = window.location.hostname.endsWith("mudralaya.com");
    const domainPart = isProd ? ";domain=.mudralaya.com" : "";
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    document.cookie = `${key}=${value};path=/;max-age=${maxAge};SameSite=Lax;Secure${domainPart}`;
  },
  removeItem: (key) => {
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
