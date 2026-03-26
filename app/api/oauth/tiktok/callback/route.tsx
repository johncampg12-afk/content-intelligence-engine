import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  
  console.log('TikTok callback received:', { code: !!code, error })
  
  if (error) {
    console.error('TikTok OAuth error:', error)
    return NextResponse.redirect('/dashboard/settings?error=tiktok_oauth_failed&details=' + error)
  }
  
  if (!code) {
    console.error('No code received')
    return NextResponse.redirect('/dashboard/settings?error=no_code')
  }

  try {
    console.log('Exchanging code for token...')
    console.log('Client ID:', process.env.TIKTOK_CLIENT_ID?.substring(0, 10) + '...')
    console.log('Redirect URI:', process.env.TIKTOK_REDIRECT_URI)
    
    // Intercambiar código por token de acceso
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
    console.log('Token response:', JSON.stringify(tokenData, null, 2))
    
    if (!tokenData.access_token) {
      console.error('No access token received:', tokenData)
      const errorMsg = tokenData.error || tokenData.error_description || 'unknown_error'
      return NextResponse.redirect(`/dashboard/settings?error=no_access_token&details=${errorMsg}`)
    }
    
    console.log('Access token received, getting user info...')
    
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
    console.log('User info response:', JSON.stringify(userInfo, null, 2))
    
    const tiktokUserId = userInfo.data?.user?.id
    
    if (!tiktokUserId) {
      throw new Error('Could not get TikTok user ID')
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
            } catch {
              // Handle error
            }
          },
        },
      }
    )
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect('/login')
    }

    // Verificar si ya existe una cuenta conectada
    const { data: existingAccount } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .single()
    
    if (existingAccount) {
      // Actualizar cuenta existente
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
      // Insertar nueva cuenta
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
    
    console.log('TikTok account connected successfully!')
    return NextResponse.redirect('/dashboard/settings?success=tiktok_connected')
    
  } catch (error) {
    console.error('TikTok OAuth callback error:', error)
    return NextResponse.redirect('/dashboard/settings?error=tiktok_callback_failed')
  }
}