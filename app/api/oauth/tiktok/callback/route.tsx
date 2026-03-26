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
    
    if (!tokenData.access_token) {
      console.error('Token error:', tokenData)
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=token_error`)
    }
    
    console.log('Step 2: Token obtained')
    
    // Obtener información del usuario - INCLUIR 'id' en los fields
    console.log('Step 3: Getting user info from TikTok...')
    
    // ¡IMPORTANTE! Incluir 'id' en la lista de campos
    const fields = [
      'id',                    // <--- ESTE ES EL QUE FALTABA
      'username',
      'display_name',
      'avatar_url',
      'bio_description',
      'follower_count',
      'following_count',
      'video_count',
      'is_verified'
    ].join(',')
    
    console.log('Requesting fields:', fields)
    
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
    
    console.log('User info response status:', userInfoResponse.status)
    console.log('User data keys:', userInfo.data?.user ? Object.keys(userInfo.data.user) : 'no user data')
    
    // Extraer datos del usuario
    const userData = userInfo.data?.user
    const tiktokUserId = userData?.id
    const tiktokUsername = userData?.username
    const tiktokDisplayName = userData?.display_name
    const tiktokAvatarUrl = userData?.avatar_url
    const tiktokBio = userData?.bio_description
    const tiktokFollowers = userData?.follower_count
    const tiktokFollowing = userData?.following_count
    const tiktokVideoCount = userData?.video_count
    
    console.log('Extracted user ID:', tiktokUserId)
    console.log('Extracted username:', tiktokUsername)
    console.log('Display name:', tiktokDisplayName)
    console.log('Followers:', tiktokFollowers)
    
    if (!tiktokUserId) {
      console.error('Could not find user ID. Response:', JSON.stringify(userInfo, null, 2))
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=no_user_id`)
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
    
    // Guardar la cuenta
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
          username: tiktokUsername,
          display_name: tiktokDisplayName,
          avatar_url: tiktokAvatarUrl,
          bio: tiktokBio,
          followers: tiktokFollowers,
          following: tiktokFollowing,
          video_count: tiktokVideoCount
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