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
    
    // Obtener videos
    const tiktok = new TikTokAPI(account.access_token)
    const videos = await tiktok.getUserVideos(100)
    
    console.log(`Found ${videos.length} videos from TikTok`)
    
    if (!videos || videos.length === 0) {
      console.log('No videos found')
      return NextResponse.json({ success: true, videosSaved: 0, message: 'No videos found' })
    }
    
    let videosSaved = 0
    let metricsSaved = 0
    
    for (const video of videos) {
      console.log(`Processing video: ${video.id} - ${video.title || 'no title'}`)
      
      // Guardar video con los datos disponibles
      const { data: videoRecord, error: videoError } = await supabase
        .from('videos')
        .upsert({
          user_id: userId,
          platform: 'tiktok',
          platform_video_id: video.id,
          title: video.title || '',
          description: '', // TikTok no devuelve description
          thumbnail_url: video.cover_image_url,
          duration: video.duration || 0,
          published_at: video.create_time ? new Date(video.create_time * 1000).toISOString() : new Date().toISOString(),
          metadata: {
            share_url: video.share_url
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
          saves: 0, // TikTok no devuelve download_count
          reach: 0, // No disponible en video/list
          avg_watch_time: 0, // No disponible en video/list
          avg_watch_percentage: 0, // No disponible en video/list
        })
      
      if (metricsError) {
        console.error(`Error saving metrics for ${video.id}:`, metricsError)
      } else {
        metricsSaved++
        console.log(`Metrics saved: views=${video.view_count}, likes=${video.like_count}`)
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