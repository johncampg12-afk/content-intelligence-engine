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
    
    const tiktok = new TikTokAPI(account.access_token)
    const videos = await tiktok.getUserVideos(20)
    
    console.log(`Found ${videos.length} videos from TikTok`)
    
    let videosProcessed = 0
    let metricsInserted = 0
    
    for (const video of videos) {
      console.log(`\n--- Processing video: ${video.id} ---`)
      console.log(`  - Title: ${video.title?.substring(0, 50)}...`)
      console.log(`  - Views from list: ${video.view_count}, Likes: ${video.like_count}`)
      
      // Buscar o insertar video
      const { data: existingVideo } = await supabase
        .from('videos')
        .select('id')
        .eq('user_id', userId)
        .eq('platform', 'tiktok')
        .eq('platform_video_id', video.id)
        .single()
      
      let videoId
      
      if (existingVideo) {
        videoId = existingVideo.id
        console.log(`  - Video exists (ID: ${videoId})`)
      } else {
        const { data: newVideo, error: insertError } = await supabase
          .from('videos')
          .insert({
            user_id: userId,
            platform: 'tiktok',
            platform_video_id: video.id,
            title: video.title || '',
            description: '',
            thumbnail_url: video.cover_image_url,
            duration: 0,
            published_at: new Date(video.create_time * 1000).toISOString(),
            metadata: {}
          })
          .select()
          .single()
        
        if (insertError) {
          console.error(`  - Error inserting video:`, insertError)
          continue
        }
        
        videoId = newVideo.id
        console.log(`  - Video inserted (ID: ${videoId})`)
      }
      
      videosProcessed++
      
      // Insertar métricas usando los datos de la lista
      await supabase
        .from('video_metrics')
        .insert({
          video_id: videoId,
          recorded_at: new Date().toISOString(),
          views: video.view_count || 0,
          likes: video.like_count || 0,
          comments: video.comment_count || 0,
          shares: video.share_count || 0,
          saves: 0,
          reach: 0,
          avg_watch_time: 0,
          avg_watch_percentage: 0,
        })
      
      metricsInserted++
      console.log(`  - Metrics inserted from list (views: ${video.view_count || 0})`)
      
      // Intentar obtener métricas detalladas adicionales
      try {
        const insights = await tiktok.getVideoInsights(video.id)
        
        if (insights && insights.view_count) {
          console.log(`  - Found additional insights: reach=${insights.reach}, watch_time=${insights.avg_watch_time}`)
          
          // Insertar métricas más detalladas como un segundo registro (o actualizar)
          await supabase
            .from('video_metrics')
            .insert({
              video_id: videoId,
              recorded_at: new Date().toISOString(),
              views: insights.view_count || video.view_count || 0,
              likes: insights.like_count || video.like_count || 0,
              comments: insights.comment_count || video.comment_count || 0,
              shares: insights.share_count || video.share_count || 0,
              saves: insights.download_count || 0,
              reach: insights.reach || 0,
              avg_watch_time: insights.avg_watch_time || 0,
              avg_watch_percentage: (insights.avg_watch_time / (video.duration || 1)) * 100 || 0,
            })
          
          metricsInserted++
          console.log(`  - Detailed metrics inserted!`)
        }
      } catch (err) {
        console.log(`  - No detailed insights available for this video`)
      }
    }
    
    console.log(`\n=== SYNC TIKTOK COMPLETE ===`)
    console.log(`Videos processed: ${videosProcessed}`)
    console.log(`Metric records inserted: ${metricsInserted}`)
    
    return NextResponse.json({ 
      success: true, 
      videosProcessed, 
      metricsInserted
    })
    
  } catch (error) {
    console.error('Sync TikTok error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Sync failed', details: errorMessage }, { status: 500 })
  }
}