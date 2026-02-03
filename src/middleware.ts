import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Initial response create karein
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // ✅ Request aur Response dono ko ek saath sync karein
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          
          // Naya response object create karne ki bajaye purane mein hi cookies daalein
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 🛡️ Session refresh ke liye getUser() zaroori hai
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // 🛑 Protected Routes Logic
  if (!user && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 🛑 Auth Pages Logic (Login user ko login/register se dashboard bhejna)
  if (user && (url.pathname === '/login' || url.pathname === '/register')) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Matcher mein auth/callback aur api ko handle karna zaroori hai
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 
