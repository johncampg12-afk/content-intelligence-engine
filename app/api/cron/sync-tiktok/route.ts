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
      console.error('TikTok account not found:', accountError)
      return NextResponse.json({ error: 'TikTok account not found' }, { status: 404 })
    }
    
    console.log('TikTok account found, syncing videos...')
    
    // Obtener videos
    const tiktok = new TikTokAPI(account.access_token)
    const videos = await tiktok.getUserVideos(20)
    
    console.log(`Found ${videos.length} videos`)
    
    let videosSaved = 0
    let metricsSaved = 0
    
    for (const video of videos) {
      console.log(`Processing video: ${video.id}`)
      
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
        console.error('Error saving video:', videoError)
        continue
      }
      
      videosSaved++
      
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
      
      if (!metricsError) {
        metricsSaved++
      }
    }
    
    console.log(`Synced: ${videosSaved} videos, ${metricsSaved} metrics`)
    console.log('=== SYNC TIKTOK END ===')
    
    return NextResponse.json({
      success: true,
      videosSaved,
      metricsSaved,
      totalVideos: videos.length
    })
    
  } catch (error) {
    console.error('Sync TikTok error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}