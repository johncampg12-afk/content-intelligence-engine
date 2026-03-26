import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
  
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    const redirectUrl = new URL('/login', baseUrl)
    return NextResponse.redirect(redirectUrl)
  }
  
  // Eliminar la cuenta conectada
  await supabase
    .from('connected_accounts')
    .delete()
    .eq('user_id', user.id)
    .eq('platform', 'tiktok')
  
  // También eliminar todos los videos y métricas de TikTok
  await supabase
    .from('videos')
    .delete()
    .eq('user_id', user.id)
    .eq('platform', 'tiktok')
  
  const redirectUrl = new URL('/dashboard/settings', baseUrl)
  redirectUrl.searchParams.set('success', 'tiktok_disconnected')
  return NextResponse.redirect(redirectUrl)
}