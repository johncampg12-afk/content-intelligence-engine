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
    
    // Obtener videos usando TikTokAPI
    const tiktok = new TikTokAPI(account.access_token)
    const videos = await tiktok.getUserVideos(20)
    
    console.log(`Found ${videos.length} videos from TikTok`)
    
    let videosUpdated = 0
    let metricsInserted = 0
    
    for (const video of videos) {
      console.log(`Processing video: ${video.id}`)
      console.log(`  - Views: ${video.view_count}, Likes: ${video.like_count}, Comments: ${video.comment_count}, Shares: ${video.share_count}`)
      
      // 1. Buscar si el video ya existe
      const { data: existingVideo, error: findError } = await supabase
        .from('videos')
        .select('id')
        .eq('user_id', userId)
        .eq('platform', 'tiktok')
        .eq('platform_video_id', video.id)
        .single()
      
      let videoId
      
      if (existingVideo) {
        // Video existe, solo actualizar título y thumbnail si cambiaron
        videoId = existingVideo.id
        await supabase
          .from('videos')
          .update({
            title: video.title || '',
            thumbnail_url: video.cover_image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', videoId)
        videosUpdated++
        console.log(`  - Video updated (ID: ${videoId})`)
      } else {
        // Video nuevo, insertar
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
          console.error(`Error inserting video ${video.id}:`, insertError)
          continue
        }
        
        videoId = newVideo.id
        videosUpdated++
        console.log(`  - Video inserted (ID: ${videoId})`)
      }
      
      // 2. Insertar métricas SIEMPRE (incluso si ya existen métricas anteriores)
      const { error: metricsError } = await supabase
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
      
      if (metricsError) {
        console.error(`Error saving metrics for ${video.id}:`, metricsError)
      } else {
        metricsInserted++
        console.log(`  - New metrics inserted! (Total: ${metricsInserted})`)
      }
    }
    
    console.log(`Sync complete: ${videosUpdated} videos updated, ${metricsInserted} new metric records`)
    console.log('=== SYNC TIKTOK END ===')
    
    return NextResponse.json({ 
      success: true, 
      videosUpdated, 
      metricsInserted,
      totalVideos: videos.length 
    })
    
  } catch (error) {
    console.error('Sync TikTok error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Sync failed', details: errorMessage }, { status: 500 })
  }
}