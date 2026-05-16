import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('=== AUTH CALLBACK START ===')
  console.log('Code present:', !!code)
  console.log('Error:', error, errorDescription)

  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(new URL(`/login?error=oauth_failed`, requestUrl.origin))
  }

  if (!code) {
    console.error('No code received')
    return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Intercambiar código por sesión
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    console.error('Exchange error:', exchangeError)
    return NextResponse.redirect(new URL('/login?error=exchange_failed', requestUrl.origin))
  }

  // Verificar que la sesión realmente se creó
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  console.log('Session created:', !!session, sessionError)

  if (!session) {
    console.error('No session after exchange')
    return NextResponse.redirect(new URL('/login?error=no_session', requestUrl.origin))
  }

  // Redirigir al dashboard
  console.log('Redirecting to dashboard')
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}