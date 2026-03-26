import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const scopes = searchParams.get('scopes')
  const error = searchParams.get('error')
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
  
  console.log('=== TikTok Callback ===')
  console.log('Code:', code ? 'YES' : 'NO')
  console.log('Scopes:', scopes)
  console.log('Error:', error)
  
  if (error || !code) {
    const redirectUrl = new URL('/settings', baseUrl)
    redirectUrl.searchParams.set('error', error || 'no_code')
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
      })
    })

    const tokenData = await tokenResponse.json()
    console.log('Token response:', JSON.stringify(tokenData))
    
    if (!tokenData.access_token) {
      throw new Error(`No access token: ${JSON.stringify(tokenData)}`)
    }
    
    // Obtener información del usuario
    const userInfoUrl = 'https://open-api.tiktok.com/user/info/'
    const userInfoResponse = await fetch(`${userInfoUrl}?access_token=${tokenData.access_token}`)
    const userInfo = await userInfoResponse.json()
    console.log('User info:', JSON.stringify(userInfo))
    
    const tiktokUserId = userInfo.data?.user?.id || tokenData.open_id
    
    if (!tiktokUserId) {
      throw new Error('Could not get user ID')
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
      throw new Error('No authenticated user')
    }
    
    // Guardar cuenta
    const { data: existingAccount } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .single()
    
    const accountData = {
      platform_user_id: tiktokUserId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      scope: scopes,
      updated_at: new Date().toISOString(),
    }
    
    if (existingAccount) {
      await supabase
        .from('connected_accounts')
        .update(accountData)
        .eq('id', existingAccount.id)
    } else {
      await supabase
        .from('connected_accounts')
        .insert({
          user_id: user.id,
          platform: 'tiktok',
          ...accountData
        })
    }
    
    // Redirigir a settings con éxito
    const successUrl = new URL('/settings', baseUrl)
    successUrl.searchParams.set('success', 'tiktok_connected')
    return NextResponse.redirect(successUrl)
    
  } catch (err) {
    console.error('Callback error:', err)
    const errorUrl = new URL('/settings', baseUrl)
    errorUrl.searchParams.set('error', 'callback_failed')
    errorUrl.searchParams.set('details', err instanceof Error ? err.message : 'unknown')
    return NextResponse.redirect(errorUrl)
  }
}