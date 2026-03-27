import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { TikTokAPI } from '@/lib/platforms/tiktok'

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
    console.log('Token scopes:', account.scope)
    
    // Verificar que el token tiene el scope video.list
    if (!account.scope?.includes('video.list')) {
      console.error('Token does NOT have video.list scope. Scopes:', account.scope)
      return NextResponse.json({ 
        error: 'Missing video.list scope. Please reconnect TikTok and authorize video permissions.' 
      }, { status: 400 })
    }
    
    // Verificar si el token ha expirado
    if (account.expires_at && new Date(account.expires_at) < new Date()) {
      console.log('Token expired! Need refresh')
      return NextResponse.json({ error: 'Token expired, please reconnect' }, { status: 401 })
    }
    
    // Obtener videos usando TikTokAPI
    const tiktok = new TikTokAPI(account.access_token)
    const videos = await tiktok.getUserVideos(20)
    
    console.log(`Found ${videos.length} videos from TikTok API`)
    
    if (videos.length === 0) {
      console.log('No videos found')
      return NextResponse.json({ success: true, videosSaved: 0, message: 'No videos found' })
    }
    
    let videosSaved = 0
    let metricsSaved = 0
    
    for (const video of videos) {
      console.log(`Processing video: ${video.id} - ${video.title || 'no title'}`)
      
      // Guardar video
      const { data: videoRecord, error: videoError } = await supabase
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
        .select()
        .single()
      
      if (videoError) {
        console.error(`Error saving video ${video.id}:`, videoError)
        continue
      }
      
      videosSaved++
      console.log(`Video saved: ${videoRecord.id}`)
      
      // Guardar métricas
      const { error: metricsError } = await supabase
        .from('video_metrics')
        .insert({
          video_id: videoRecord.id,
          recorded_at: new Date().toISOString(),
          views: video.view_count || 0,
          likes: video.like_count || 0,
          comments: video.comment_count || 0,
          shares: video.share_count || 0,
          saves: video.download_count || 0,
        })
      
      if (metricsError) {
        console.error(`Error saving metrics for ${video.id}:`, metricsError)
      } else {
        metricsSaved++
      }
    }
    
    console.log(`Sync complete: ${videosSaved} videos, ${metricsSaved} metrics`)
    console.log('=== SYNC TIKTOK END ===')
    
    return NextResponse.json({ 
      success: true, 
      videosSaved, 
      metricsSaved,
      totalVideos: videos.length 
    })
    
  } catch (error) {
    console.error('Sync TikTok error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Sync failed', details: errorMessage }, { status: 500 })
  }
}