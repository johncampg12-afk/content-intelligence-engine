import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('=== SYNC TIKTOK START ===')
    console.log('User ID:', userId)
    
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
    
    // Obtener la cuenta de TikTok
    const { data: account, error: accountError } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'tiktok')
      .single()
    
    if (accountError || !account) {
      console.error('Account error:', accountError)
      return NextResponse.json({ error: 'TikTok account not found' }, { status: 404 })
    }
    
    console.log('TikTok account found')
    console.log('Access token exists:', !!account.access_token)
    console.log('Token expires at:', account.expires_at)
    
    // Verificar si el token ha expirado
    if (account.expires_at && new Date(account.expires_at) < new Date()) {
      console.log('Token expired! Need refresh')
      return NextResponse.json({ error: 'Token expired, please reconnect' }, { status: 401 })
    }
    
    // Hacer la petición a TikTok directamente para ver la respuesta
    console.log('Calling TikTok API...')
    
    const fields = [
      'id',
      'title',
      'description',
      'create_time',
      'cover_image_url',
      'share_url',
      'video_url',
      'duration',
      'view_count',
      'like_count',
      'comment_count',
      'share_count',
      'download_count',
      'music_info'
    ].join(',')
    
    const url = `https://open.tiktokapis.com/v2/video/list/?fields=${fields}&max_count=20`
    console.log('URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${account.access_token}`,
        'Content-Type': 'application/json',
      },
    })
    
    // Obtener la respuesta como texto primero
    const responseText = await response.text()
    console.log('Response status:', response.status)
    console.log('Response text (first 500 chars):', responseText.substring(0, 500))
    
    // Intentar parsear como JSON
    let data
    try {
      data = JSON.parse(responseText)
      console.log('Parsed JSON successfully')
    } catch (e) {
      console.error('Failed to parse JSON:', e)
      console.error('Full response:', responseText)
      return NextResponse.json({ 
        error: 'Invalid response from TikTok', 
        response: responseText.substring(0, 500) 
      }, { status: 500 })
    }
    
    if (!data.data?.videos) {
      console.error('No videos in response:', data)
      return NextResponse.json({ error: 'No videos found', details: data }, { status: 500 })
    }
    
    const videos = data.data.videos
    console.log(`Found ${videos.length} videos`)
    
    let videosSaved = 0
    
    for (const video of videos) {
      const { error: videoError } = await supabase
        .from('videos')
        .upsert({
          user_id: userId,
          platform: 'tiktok',
          platform_video_id: video.id,
          title: video.title || video.description?.substring(0, 200) || '',
          description: video.description || '',
          thumbnail_url: video.cover_image_url,
          duration: video.duration,
          published_at: new Date(video.create_time * 1000).toISOString(),
          metadata: {
            share_url: video.share_url,
            video_url: video.video_url,
            music_info: video.music_info
          }
        }, {
          onConflict: 'user_id,platform,platform_video_id'
        })
      
      if (!videoError) {
        videosSaved++
        
        // Guardar métricas
        await supabase
          .from('video_metrics')
          .insert({
            video_id: video.id,
            recorded_at: new Date().toISOString(),
            views: video.view_count || 0,
            likes: video.like_count || 0,
            comments: video.comment_count || 0,
            shares: video.share_count || 0,
            saves: video.download_count || 0,
          })
      }
    }
    
    console.log(`Saved ${videosSaved} videos`)
    console.log('=== SYNC TIKTOK END ===')
    
    return NextResponse.json({ success: true, videosSaved })
    
  } catch (error) {
    console.error('Sync TikTok error:', error)
    return NextResponse.json({ error: 'Sync failed', details: String(error) }, { status: 500 })
  }
}