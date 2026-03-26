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
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=tiktok_oauth_failed&details=${encodeURIComponent(error_description || error)}`)
  }
  
  if (!code) {
    console.error('No code received')
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=no_code`)
  }

  try {
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
    console.log('Token data keys:', Object.keys(tokenData))
    
    if (!tokenData.access_token) {
      console.error('Token error:', JSON.stringify(tokenData, null, 2))
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=token_error`)
    }
    
    console.log('Step 2: Token obtained, access_token starts with:', tokenData.access_token.substring(0, 10))
    
    // Obtener información del usuario
    console.log('Step 3: Getting user info from TikTok...')
    
    const fields = 'id,username,display_name,avatar_url,bio_description,follower_count,following_count,video_count'
    
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
    
    // Log COMPLETO de la respuesta
    console.log('=== FULL TIKTOK RESPONSE ===')
    console.log('Status:', userInfoResponse.status)
    console.log('Response:', JSON.stringify(userInfo, null, 2))
    console.log('=== END FULL RESPONSE ===')
    
    // Intentar diferentes formas de extraer el ID
    let tiktokUserId = null
    let userData = null
    
    if (userInfo.data?.user) {
      userData = userInfo.data.user
      tiktokUserId = userData.id
    } else if (userInfo.user) {
      userData = userInfo.user
      tiktokUserId = userData.id
    } else if (userInfo.data) {
      userData = userInfo.data
      tiktokUserId = userData.id
    }
    
    console.log('Extracted user ID:', tiktokUserId)
    console.log('User data structure:', userData ? Object.keys(userData) : 'null')
    
    if (!tiktokUserId) {
      console.error('Could not find user ID. Full response saved above.')
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=no_user_id`)
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
      return NextResponse.redirect(`${baseUrl}/login`)
    }
    
    await supabase
      .from('connected_accounts')
      .upsert({
        user_id: user.id,
        platform: 'tiktok',
        platform_user_id: String(tiktokUserId),
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: new Date(Date.now() + (tokenData.expires_in || 7200) * 1000).toISOString(),
        scope: tokenData.scope || '',
        metadata: userData || {}
      }, {
        onConflict: 'user_id,platform'
      })
    
    console.log('=== TIKTOK CALLBACK SUCCESS ===')
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?success=tiktok_connected`)
    
  } catch (err) {
    console.error('=== TIKTOK CALLBACK ERROR ===')
    console.error(err)
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=exception`)
  }
}