import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { TikTokAPI } from '@/lib/platforms/tiktok'

interface TikTokVideo {
  id: string
  title: string
  create_time: number
  cover_image_url: string
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
}

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
    
    // Obtener todos los videos de TikTok con paginación
    const videosFromTikTok: TikTokVideo[] = await tiktok.getUserVideos(50)
    console.log(`Found ${videosFromTikTok.length} unique videos from TikTok API`)
    
    let metricsInserted = 0
    let videosUpdated = 0
    let videosInserted = 0
    
    // Obtener la fecha de hoy para comparar
    const today = new Date().toISOString().split('T')[0]
    
    for (const video of videosFromTikTok) {
      console.log(`\n--- Processing TikTok video: ${video.id} ---`)
      console.log(`  - Title: ${video.title?.substring(0, 50)}...`)
      console.log(`  - Views: ${video.view_count}, Likes: ${video.like_count}`)
      
      // Buscar si el video ya existe
      const { data: existingVideo } = await supabase
        .from('videos')
        .select('id')
        .eq('user_id', userId)
        .eq('platform', 'tiktok')
        .eq('platform_video_id', video.id)
        .single()
      
      let videoId: string
      
      if (existingVideo) {
        // Actualizar video existente
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
        // Insertar video nuevo
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
        videosInserted++
        console.log(`  - New video inserted (ID: ${videoId})`)
      }
      
      // Verificar si ya hay una métrica para este video hoy
      const { data: existingMetric, error: metricCheckError } = await supabase
        .from('video_metrics')
        .select('id')
        .eq('video_id', videoId)
        .gte('recorded_at', `${today}T00:00:00`)
        .lte('recorded_at', `${today}T23:59:59`)
        .limit(1)
      
      if (existingMetric && existingMetric.length > 0) {
        console.log(`  - Metrics already recorded today, skipping duplicate`)
        continue
      }
      
      // Insertar métricas actuales
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
        console.error(`  - Error inserting metrics:`, metricsError)
      } else {
        metricsInserted++
        console.log(`  - Metrics inserted (views: ${video.view_count || 0})`)
      }
    }
    
    console.log(`\n=== SYNC TIKTOK COMPLETE ===`)
    console.log(`New videos inserted: ${videosInserted}`)
    console.log(`Videos updated: ${videosUpdated}`)
    console.log(`New metric records inserted: ${metricsInserted}`)
    console.log(`Total videos in database: ${videosInserted + videosUpdated}`)
    
    return NextResponse.json({ 
      success: true, 
      videosInserted,
      videosUpdated,
      metricsInserted,
      totalVideosFromAPI: videosFromTikTok.length
    })
    
  } catch (error) {
    console.error('Sync TikTok error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Sync failed', details: errorMessage }, { status: 500 })
  }
}