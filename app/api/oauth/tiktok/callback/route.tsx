import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
  
  console.log('=== TikTok Callback Started ===')
  console.log('Code present:', !!code)
  console.log('Error:', error)
  console.log('Error description:', error_description)
  
  if (error) {
    console.error('TikTok OAuth error:', error, error_description)
    const redirectUrl = new URL('/settings', baseUrl)
    redirectUrl.searchParams.set('error', error)
    if (error_description) redirectUrl.searchParams.set('details', error_description)
    return NextResponse.redirect(redirectUrl)
  }
  
  if (!code) {
    console.error('No code received')
    const redirectUrl = new URL('/settings', baseUrl)
    redirectUrl.searchParams.set('error', 'no_code')
    return NextResponse.redirect(redirectUrl)
  }

  try {
    console.log('Exchanging code for token...')
    console.log('Client ID exists:', !!process.env.TIKTOK_CLIENT_ID)
    console.log('Redirect URI:', process.env.TIKTOK_REDIRECT_URI)
    
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
    console.log('Token response status:', tokenResponse.status)
    console.log('Token data keys:', Object.keys(tokenData))
    
    if (!tokenData.access_token) {
      console.error('No access token:', tokenData)
      const redirectUrl = new URL('/settings', baseUrl)
      redirectUrl.searchParams.set('error', 'token_error')
      redirectUrl.searchParams.set('details', tokenData.error || 'unknown')
      return NextResponse.redirect(redirectUrl)
    }
    
    console.log('Access token obtained successfully')
    
    // Obtener información del usuario
    console.log('Fetching user info...')
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
    console.log('User info response status:', userInfoResponse.status)
    console.log('User info full response:', JSON.stringify(userInfo, null, 2))
    
    // TikTok puede devolver la info en diferentes estructuras
    let tiktokUserId = null
    let tiktokUsername = null
    
    // Probar diferentes estructuras posibles
    if (userInfo.data?.user?.id) {
      tiktokUserId = userInfo.data.user.id
      tiktokUsername = userInfo.data.user.username
      console.log('Found user in data.user')
    } else if (userInfo.user?.id) {
      tiktokUserId = userInfo.user.id
      tiktokUsername = userInfo.user.username
      console.log('Found user in user')
    } else if (userInfo.id) {
      tiktokUserId = userInfo.id
      tiktokUsername = userInfo.username
      console.log('Found user in root')
    }
    
    console.log('Extracted - User ID:', tiktokUserId)
    console.log('Extracted - Username:', tiktokUsername)
    
    if (!tiktokUserId) {
      console.error('Could not extract user ID from response')
      const redirectUrl = new URL('/settings', baseUrl)
      redirectUrl.searchParams.set('error', 'no_user_id')
      redirectUrl.searchParams.set('details', 'Could not extract user ID from TikTok response')
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
    
    console.log('Saving to Supabase for user:', user.id)
    
    // Verificar si ya existe
    const { data: existingAccount } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .single()
    
    const expiresAt = tokenData.expires_in 
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null
    
    if (existingAccount) {
      await supabase
        .from('connected_accounts')
        .update({
          platform_user_id: tiktokUserId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt,
          scope: tokenData.scope,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAccount.id)
      console.log('Updated existing account')
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
          scope: tokenData.scope,
        })
      console.log('Created new account')
    }
    
    console.log('TikTok connection successful!')
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