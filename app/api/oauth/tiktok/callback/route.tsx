import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
  
  console.log('=== TikTok Callback ===')
  console.log('Code:', code)
  console.log('Error:', error)
  
  if (error || !code) {
    const redirectUrl = new URL('/settings', baseUrl)
    redirectUrl.searchParams.set('error', error || 'no_code')
    if (error_description) redirectUrl.searchParams.set('details', error_description)
    return NextResponse.redirect(redirectUrl)
  }

  try {
    // Intercambiar código por token
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
      console.error('No access token:', tokenData)
      const redirectUrl = new URL('/settings', baseUrl)
      redirectUrl.searchParams.set('error', 'token_error')
      return NextResponse.redirect(redirectUrl)
    }
    
    // Obtener información del usuario
    const userInfoUrl = 'https://open-api.tiktok.com/user/info/'
    const userInfoResponse = await fetch(`${userInfoUrl}?access_token=${tokenData.access_token}`)
    const userInfo = await userInfoResponse.json()
    console.log('User info response:', JSON.stringify(userInfo, null, 2))
    
    const tiktokUserId = userInfo.data?.user?.id || userInfo.data?.open_id
    
    if (!tiktokUserId) {
      console.error('Could not get user ID')
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
    
    // Guardar la cuenta
    const expiresAt = tokenData.expires_in 
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null
    
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
          expires_at: expiresAt,
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