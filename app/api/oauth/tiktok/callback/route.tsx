import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  // URL base para redirecciones
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://content-intelligence-engine-eta.vercel.app'
  
  console.log('=== TIKTOK CALLBACK START ===')
  console.log('Code present:', !!code)
  console.log('Error:', error)
  console.log('Error description:', error_description)
  
  if (error) {
    console.error('TikTok OAuth error:', error, error_description)
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=tiktok_oauth_failed&details=${error_description || error}`)
  }
  
  if (!code) {
    console.error('No code received')
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=no_code`)
  }

  try {
    console.log('Step 1: Exchanging code for token...')
    console.log('Client ID exists:', !!process.env.TIKTOK_CLIENT_ID)
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
    console.log('Token response status:', tokenResponse.status)
    
    if (!tokenData.access_token) {
      console.error('No access token received:', tokenData)
      const errorMsg = tokenData.error || tokenData.error_description || 'unknown_error'
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=no_access_token&details=${errorMsg}`)
    }
    
    console.log('Step 2: Token obtained successfully')
    
    // Obtener información del usuario
    console.log('Step 3: Getting user info...')
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
    
    const tiktokUserId = userInfo.data?.user?.id
    const tiktokUsername = userInfo.data?.user?.username
    
    if (!tiktokUserId) {
      console.error('Could not get TikTok user ID:', userInfo)
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=no_user_id`)
    }
    
    console.log('Step 4: User found:', tiktokUsername, tiktokUserId)
    
    // Guardar en Supabase
    console.log('Step 5: Saving to Supabase...')
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
      console.error('No authenticated user')
      return NextResponse.redirect(`${baseUrl}/login`)
    }
    
    console.log('Step 6: User authenticated:', user.email)
    
    // Guardar la cuenta
    const { error: upsertError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: user.id,
        platform: 'tiktok',
        platform_user_id: tiktokUserId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        scope: tokenData.scope,
        metadata: {
          username: tiktokUsername,
          display_name: userInfo.data?.user?.display_name,
          avatar_url: userInfo.data?.user?.avatar_url,
          followers: userInfo.data?.user?.follower_count,
          following: userInfo.data?.user?.following_count,
          video_count: userInfo.data?.user?.video_count
        }
      }, {
        onConflict: 'user_id,platform'
      })
    
    if (upsertError) {
      console.error('Supabase error:', upsertError)
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=db_error&details=${upsertError.message}`)
    }
    
    console.log('Step 7: Successfully saved to Supabase')
    console.log('=== TIKTOK CALLBACK SUCCESS ===')
    
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?success=tiktok_connected`)
    
  } catch (err) {
    console.error('=== TIKTOK CALLBACK ERROR ===')
    console.error(err)
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=exception&details=${encodeURIComponent(String(err))}`)
  }
}