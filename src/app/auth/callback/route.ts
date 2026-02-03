import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  
  // 🚀 IMPORTANT: Origin ko hardcode karein ya env se uthayein
  // Taake Tauri app ko pata chale ke wapas kahan jana hai
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://chatapp-nine-tau-55.vercel.app'

  if (code) {
    const cookieStore = await cookies() 

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.delete(name) // 👈 delete() use karein remove ke liye
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 🚀 Redirect to the absolute live URL
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
    
    console.error('Auth Error:', error.message)
  }

  // Error case mein wapas login par
  return NextResponse.redirect(`${baseUrl}/login?error=auth-code-error`)
}
