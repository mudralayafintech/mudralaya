
import { createBrowserClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'

const createSupabaseClient = (options?: CookieOptions) => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        ...options,
        domain: process.env.NODE_ENV === 'production' ? '.mudralaya.com' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Workaround for "Runtime AbortError" in Next.js 15 Dev (HMR).
        // The 'lock' option expects a function matching navigator.locks.request signature.
        lock: (name: string, ...args: any[]) => {
            const callback = args[args.length - 1];
            if (typeof callback === 'function') {
                return callback({ name });
            }
            return Promise.resolve();
        },
      }
    }
  )
}

export function createClient(options?: CookieOptions) {
  if (typeof window === 'undefined') {
    return createSupabaseClient(options)
  }

  // Persist client on window in dev to prevent multiple instances/locks during HMR
  const globalWithSupabase = global as typeof globalThis & {
    __supabaseClient?: ReturnType<typeof createBrowserClient>
  }

  if (!globalWithSupabase.__supabaseClient) {
    globalWithSupabase.__supabaseClient = createSupabaseClient(options)
  }

  return globalWithSupabase.__supabaseClient
}
