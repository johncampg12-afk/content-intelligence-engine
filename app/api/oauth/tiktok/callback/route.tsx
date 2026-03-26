import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  console.log('TikTok callback received')
  console.log('Code:', code ? 'Yes' : 'No')
  console.log('Error:', error)
  console.log('Error description:', error_description)
  
  if (error) {
    console.error('TikTok OAuth error:', error, error_description)
    return NextResponse.redirect(`/dashboard/settings?error=tiktok_oauth_failed&details=${error_description || error}`)
  }
  
  if (!code) {
    console.error('No code received')
    return NextResponse.redirect('/dashboard/settings?error=no_code')
  }

  try {
    console.log('Exchanging code for token...')
    
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
      return NextResponse.redirect(`/dashboard/settings?error=no_access_token&details=${errorMsg}`)
    }
    
    console.log('Access token received successfully')
    
    // Obtener información del usuario (incluyendo perfil y estadísticas)
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
    console.log('User info:', JSON.stringify(userInfo, null, 2))
    
    const tiktokUserId = userInfo.data?.user?.id
    const tiktokUsername = userInfo.data?.user?.username
    const tiktokDisplayName = userInfo.data?.user?.display_name
    const tiktokAvatarUrl = userInfo.data?.user?.avatar_url
    const tiktokBio = userInfo.data?.user?.bio_description
    const tiktokFollowers = userInfo.data?.user?.follower_count
    const tiktokFollowing = userInfo.data?.user?.following_count
    const tiktokVideoCount = userInfo.data?.user?.video_count
    
    if (!tiktokUserId) {
      console.error('Could not get TikTok user ID:', userInfo)
      throw new Error('Could not get TikTok user ID')
    }
    
    console.log('TikTok user:', tiktokUsername, tiktokDisplayName)
    console.log('Followers:', tiktokFollowers)
    console.log('Videos:', tiktokVideoCount)
    
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

    // Guardar metadata adicional en connected_accounts
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
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      scope: tokenData.scope,
      metadata: {
        username: tiktokUsername,
        display_name: tiktokDisplayName,
        avatar_url: tiktokAvatarUrl,
        bio: tiktokBio,
        followers: tiktokFollowers,
        following: tiktokFollowing,
        video_count: tiktokVideoCount
      },
      updated_at: new Date().toISOString(),
    }
    
    if (existingAccount) {
      await supabase
        .from('connected_accounts')
        .update(accountData)
        .eq('id', existingAccount.id)
      console.log('Updated existing TikTok account')
    } else {
      await supabase
        .from('connected_accounts')
        .insert({
          user_id: user.id,
          platform: 'tiktok',
          ...accountData
        })
      console.log('Inserted new TikTok account')
    }
    
    console.log('TikTok account connected successfully!')
    return NextResponse.redirect('/dashboard/settings?success=tiktok_connected')
    
  } catch (error) {
    console.error('TikTok OAuth callback error:', error)
    return NextResponse.redirect('/dashboard/settings?error=tiktok_callback_failed')
  }
}