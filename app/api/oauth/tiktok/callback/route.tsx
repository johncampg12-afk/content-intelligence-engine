import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const scopes = searchParams.get('scopes')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
  
  console.log('=== TikTok Callback Received ===')
  console.log('Code:', code ? code.substring(0, 20) + '...' : 'No code')
  console.log('Scopes:', scopes)
  console.log('State:', state)
  console.log('Error:', error)
  
  if (error || !code) {
    console.error('Error or no code:', { error, code })
    const redirectUrl = new URL('/settings', baseUrl)
    redirectUrl.searchParams.set('error', error || 'no_code')
    return NextResponse.redirect(redirectUrl)
  }

  try {
    console.log('Exchanging code for token...')
    
    // Intercambiar código por token - Usando la URL correcta de TikTok
    const tokenUrl = 'https://open-api.tiktok.com/oauth/access_token/'
    const tokenResponse = await fetch(tokenUrl, {
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
    console.log('Token response:', JSON.stringify(tokenData, null, 2))
    
    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData)
      const redirectUrl = new URL('/settings', baseUrl)
      redirectUrl.searchParams.set('error', 'token_error')
      redirectUrl.searchParams.set('details', tokenData.error || 'unknown')
      return NextResponse.redirect(redirectUrl)
    }
    
    console.log('Access token obtained successfully')
    
    // Obtener información del usuario
    const userInfoUrl = 'https://open-api.tiktok.com/user/info/'
    const userInfoResponse = await fetch(`${userInfoUrl}?access_token=${tokenData.access_token}`)
    const userInfo = await userInfoResponse.json()
    console.log('User info response:', JSON.stringify(userInfo, null, 2))
    
    // Extraer el ID del usuario (puede estar en diferentes lugares)
    const tiktokUserId = userInfo.data?.user?.id || userInfo.data?.open_id || tokenData.open_id
    
    if (!tiktokUserId) {
      console.error('Could not extract user ID from response')
      const redirectUrl = new URL('/settings', baseUrl)
      redirectUrl.searchParams.set('error', 'no_user_id')
      redirectUrl.searchParams.set('details', 'Could not extract user ID')
      return NextResponse.redirect(redirectUrl)
    }
    
    console.log('TikTok User ID:', tiktokUserId)
    
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
      console.error('No authenticated user found')
      const redirectUrl = new URL('/login', baseUrl)
      return NextResponse.redirect(redirectUrl)
    }
    
    console.log('Saving to Supabase for user:', user.id)
    
    // Calcular fecha de expiración
    const expiresAt = tokenData.expires_in 
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null
    
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
          expires_at: expiresAt,
          scope: scopes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAccount.id)
      console.log('Updated existing TikTok account')
    } else {
      await supabase
        .from('connected_accounts')
        .insert({
          user_id: user.id,
          platform: 'tiktok',
          platform_user_id: tiktokUserId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt,
          scope: scopes,
        })
      console.log('Created new TikTok account')
    }
    
    console.log('TikTok connection successful!')
    const successUrl = new URL('/settings', baseUrl)
    successUrl.searchParams.set('success', 'tiktok_connected')
    return NextResponse.redirect(successUrl)
    
  } catch (err) {
    console.error('Callback error:', err)
    const redirectUrl = new URL('/settings', baseUrl)
    redirectUrl.searchParams.set('error', 'callback_failed')
    redirectUrl.searchParams.set('details', err instanceof Error ? err.message : 'unknown')
    return NextResponse.redirect(redirectUrl)
  }
}