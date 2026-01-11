import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mhsizqmhqngcaztresmh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oc2l6cW1ocW5nY2F6dHJlc21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjQ0NDYsImV4cCI6MjA4MjYwMDQ0Nn0.mURvS7dVh0jE5SSWDW2laVe00IhpUtgizBuMWPzEKH0";

export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Workaround for "Runtime AbortError" in Next.js 15 Dev (HMR).
        lock: (name: string, ...args: any[]) => {
            const callback = args[args.length - 1];
            if (typeof callback === 'function') {
                return callback({ name });
            }
            return Promise.resolve();
        },
      }
    }
  );
}
