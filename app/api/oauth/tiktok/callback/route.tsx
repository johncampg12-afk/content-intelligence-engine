import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  // Obtener la URL base absoluta
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
  
  console.log('TikTok callback - Code:', code ? 'Yes' : 'No')
  console.log('Error:', error, error_description)
  
  if (error) {
    const redirectUrl = new URL('/settings', baseUrl)
    redirectUrl.searchParams.set('error', error)
    if (error_description) {
      redirectUrl.searchParams.set('details', error_description)
    }
    return NextResponse.redirect(redirectUrl)
  }
  
  if (!code) {
    const redirectUrl = new URL('/settings', baseUrl)
    redirectUrl.searchParams.set('error', 'no_code')
    return NextResponse.redirect(redirectUrl)
  }

  try {
    // Intercambiar código por token
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_ID!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
      })
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenData.access_token) {
      console.error('Token error:', tokenData)
      const redirectUrl = new URL('/settings', baseUrl)
      redirectUrl.searchParams.set('error', 'token_error')
      redirectUrl.searchParams.set('details', tokenData.error || 'unknown')
      return NextResponse.redirect(redirectUrl)
    }
    
    // Obtener información del usuario
    const userInfoResponse = await fetch(
      'https://open.tiktokapis.com/v2/user/info/',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    )
    
    const userInfo = await userInfoResponse.json()
    const tiktokUserId = userInfo.data?.user?.id
    
    if (!tiktokUserId) {
      console.error('User info error:', userInfo)
      const redirectUrl = new URL('/settings', baseUrl)
      redirectUrl.searchParams.set('error', 'no_user_id')
      return NextResponse.redirect(redirectUrl)
    }
    
    // Guardar en Supabase
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

    // Verificar si ya existe
    const { data: existingAccount } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .single()
    
    if (existingAccount) {
      await supabase
        .from('connected_accounts')
        .update({
          platform_user_id: tiktokUserId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          scope: tokenData.scope,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAccount.id)
    } else {
      await supabase
        .from('connected_accounts')
        .insert({
          user_id: user.id,
          platform: 'tiktok',
          platform_user_id: tiktokUserId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          scope: tokenData.scope,
        })
    }
    
    const successUrl = new URL('/settings', baseUrl)
    successUrl.searchParams.set('success', 'tiktok_connected')
    return NextResponse.redirect(successUrl)
    
  } catch (err) {
    console.error('Callback error:', err)
    const redirectUrl = new URL('/settings', baseUrl)
    redirectUrl.searchParams.set('error', 'callback_failed')
    return NextResponse.redirect(redirectUrl)
  }
}