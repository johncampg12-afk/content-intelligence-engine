import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://content-intelligence-engine-eta.vercel.app'
  
  console.log('=== TIKTOK CALLBACK START ===')
  console.log('Code present:', !!code)
  
  if (error) {
    console.error('TikTok OAuth error:', error, error_description)
    return NextResponse.redirect(`${baseUrl}/login?error=tiktok_oauth_failed`)
  }
  
  if (!code) {
    console.error('No code received')
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`)
  }

  try {
    // Crear un response que vamos a modificar
    let response = NextResponse.next()
    
    // Crear el cliente de Supabase que puede modificar las cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    
    // Obtener el usuario autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('No user found:', userError)
      return NextResponse.redirect(`${baseUrl}/login?error=no_user`)
    }
    
    console.log('User found:', user.email)
    
    console.log('Step 1: Exchanging code for token...')
    
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
    
    if (!tokenData.access_token) {
      console.error('Token error:', tokenData)
      return NextResponse.redirect(`${baseUrl}/login?error=token_error`)
    }
    
    console.log('Step 2: Token obtained')
    
    // Obtener información del usuario de TikTok
    console.log('Step 3: Getting user info from TikTok...')
    
    const fields = [
      'username',
      'display_name',
      'avatar_url',
      'bio_description',
      'follower_count',
      'following_count',
      'video_count',
      'is_verified'
    ].join(',')
    
    const userInfoResponse = await fetch(
      `https://open.tiktokapis.com/v2/user/info/?fields=${fields}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      }
    )
    
    const userInfo = await userInfoResponse.json()
    
    const userData = userInfo.data?.user
    const tiktokUserId = tokenData.open_id
    const tiktokUsername = userData?.username
    
    console.log('Using Open ID:', tiktokUserId)
    console.log('Username:', tiktokUsername)
    
    if (!tiktokUserId) {
      console.error('No open_id in token response')
      return NextResponse.redirect(`${baseUrl}/login?error=no_user_id`)
    }
    
    // Guardar la cuenta
    console.log('Step 4: Saving to Supabase...')
    
    const { error: upsertError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: user.id,
        platform: 'tiktok',
        platform_user_id: String(tiktokUserId),
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: new Date(Date.now() + (tokenData.expires_in || 7200) * 1000).toISOString(),
        scope: tokenData.scope || '',
        metadata: {
          open_id: tokenData.open_id,
          username: userData?.username,
          display_name: userData?.display_name,
          avatar_url: userData?.avatar_url,
          bio: userData?.bio_description,
          followers: userData?.follower_count,
          following: userData?.following_count,
          video_count: userData?.video_count
        }
      }, {
        onConflict: 'user_id,platform'
      })
    
    if (upsertError) {
      console.error('Supabase error:', upsertError)
      return NextResponse.redirect(`${baseUrl}/login?error=db_error`)
    }
    
    console.log('Step 5: Successfully saved to Supabase')
    
    // Disparar sincronización
    console.log('Triggering video sync...')
    fetch(`${baseUrl}/api/cron/sync-tiktok`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    }).catch(err => console.error('Background sync error:', err))
    
    console.log('=== TIKTOK CALLBACK SUCCESS ===')
    
    // =====================================================
    // CAMBIO AQUÍ: Redirigir directamente al login
    // =====================================================
    return NextResponse.redirect(`${baseUrl}/login?tiktok_connected=true`)
    
  } catch (err) {
    console.error('=== TIKTOK CALLBACK ERROR ===')
    console.error(err)
    return NextResponse.redirect(`${baseUrl}/login?error=callback_failed`)
  }
}