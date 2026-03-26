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
  console.log('Code:', code ? 'Yes (length: ' + code.length + ')' : 'No')
  console.log('Error:', error)
  console.log('Error description:', error_description)
  
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
    console.log('Redirect URI:', process.env.TIKTOK_REDIRECT_URI)
    
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
    console.log('Token response keys:', Object.keys(tokenData))
    
    if (!tokenData.access_token) {
      console.error('Token error response:', JSON.stringify(tokenData, null, 2))
      const errorMsg = tokenData.error || tokenData.error_description || 'unknown_error'
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=token_error&details=${encodeURIComponent(errorMsg)}`)
    }
    
    console.log('Step 2: Token obtained, expires in:', tokenData.expires_in)
    
    // Obtener información del usuario con el token
    console.log('Step 3: Getting user info from TikTok...')
    
    const userInfoResponse = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    })
    
    const userInfoRaw = await userInfoResponse.text()
    console.log('User info raw response:', userInfoRaw.substring(0, 500))
    
    let userInfo
    try {
      userInfo = JSON.parse(userInfoRaw)
    } catch (e) {
      console.error('Failed to parse user info:', e)
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=parse_error`)
    }
    
    console.log('User info response status:', userInfoResponse.status)
    console.log('User info structure:', Object.keys(userInfo))
    
    // TikTok puede devolver los datos en diferentes estructuras
    let tiktokUserId = null
    let tiktokUsername = null
    let tiktokDisplayName = null
    let tiktokAvatarUrl = null
    
    // Probar diferentes estructuras de respuesta
    if (userInfo.data?.user) {
      tiktokUserId = userInfo.data.user.id
      tiktokUsername = userInfo.data.user.username
      tiktokDisplayName = userInfo.data.user.display_name
      tiktokAvatarUrl = userInfo.data.user.avatar_url
    } else if (userInfo.user) {
      tiktokUserId = userInfo.user.id
      tiktokUsername = userInfo.user.username
      tiktokDisplayName = userInfo.user.display_name
      tiktokAvatarUrl = userInfo.user.avatar_url
    } else if (userInfo.data?.id) {
      tiktokUserId = userInfo.data.id
    }
    
    console.log('Extracted user ID:', tiktokUserId)
    console.log('Extracted username:', tiktokUsername)
    
    if (!tiktokUserId) {
      console.error('Could not find user ID in response:', JSON.stringify(userInfo, null, 2))
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=no_user_id&details=${encodeURIComponent(JSON.stringify(userInfo))}`)
    }
    
    console.log('Step 4: User found successfully')
    
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
    
    // Guardar la cuenta con los datos obtenidos
    const { error: upsertError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: user.id,
        platform: 'tiktok',
        platform_user_id: String(tiktokUserId),
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: new Date(Date.now() + (tokenData.expires_in || 7200) * 1000).toISOString(),
        scope: tokenData.scope || 'user.info.profile,user.info.stats,video.list',
        metadata: {
          username: tiktokUsername,
          display_name: tiktokDisplayName,
          avatar_url: tiktokAvatarUrl,
          raw_data: userInfo.data || userInfo
        }
      }, {
        onConflict: 'user_id,platform'
      })
    
    if (upsertError) {
      console.error('Supabase error:', upsertError)
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=db_error&details=${encodeURIComponent(upsertError.message)}`)
    }
    
    console.log('Step 7: Successfully saved to Supabase')
    console.log('=== TIKTOK CALLBACK SUCCESS ===')
    
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?success=tiktok_connected`)
    
  } catch (err) {
    console.error('=== TIKTOK CALLBACK ERROR ===')
    console.error(err)
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=exception&details=${encodeURIComponent(errorMessage)}`)
  }
}