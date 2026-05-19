
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require Supabase authentication
const PROTECTED_PREFIXES = ['/dashboard', '/onboarding']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
                ...options,
                domain: process.env.NODE_ENV === 'production' ? '.mudralaya.com' : undefined,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            })
          })
        },
      },
    }
  )

  // Always refresh the session (keeps cookies alive)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only redirect to login for protected routes
  if (!user && isProtectedRoute(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

