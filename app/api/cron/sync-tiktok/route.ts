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
    
    // 1. Obtener videos de TikTok (los más recientes)
    const videosFromTikTok = await tiktok.getUserVideos(20)
    console.log(`Found ${videosFromTikTok.length} videos from TikTok API`)
    
    // 2. Obtener TODOS los videos existentes en Supabase
    const { data: existingVideos, error: existingError } = await supabase
      .from('videos')
      .select('id, platform_video_id')
      .eq('user_id', userId)
      .eq('platform', 'tiktok')
    
    if (existingError) {
      console.error('Error fetching existing videos:', existingError)
    }
    
    console.log(`Found ${existingVideos?.length || 0} existing videos in Supabase`)
    
    // Crear un Set con los IDs de TikTok que ya tenemos
    const existingVideoIds = new Set(existingVideos?.map(v => v.platform_video_id) || [])
    
    let metricsInserted = 0
    let newVideosAdded = 0
    let updatedVideos = 0
    
    // 3. Procesar videos nuevos de TikTok
    for (const video of videosFromTikTok) {
      console.log(`\n--- Processing TikTok video: ${video.id} ---`)
      
      let videoId
      const isNew = !existingVideoIds.has(video.id)
      
      if (isNew) {
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
        newVideosAdded++
        console.log(`  - New video inserted (ID: ${videoId})`)
      } else {
        // Video ya existe, actualizar título y thumbnail
        const existing = existingVideos?.find(v => v.platform_video_id === video.id)
        videoId = existing?.id
        
        await supabase
          .from('videos')
          .update({
            title: video.title || '',
            thumbnail_url: video.cover_image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', videoId)
        
        updatedVideos++
        console.log(`  - Video updated (ID: ${videoId})`)
      }
      
      // Insertar métricas actuales
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
      console.log(`  - Metrics inserted (views: ${video.view_count || 0})`)
    }
    
    // 4. Para videos antiguos que ya no están en la API de TikTok,
    // intentar obtener métricas individuales
    const videosOnlyInSupabase = existingVideos?.filter(
      v => !videosFromTikTok.some(tv => tv.id === v.platform_video_id)
    ) || []
    
    console.log(`\n--- Found ${videosOnlyInSupabase.length} videos only in Supabase (older videos) ---`)
    
    for (const oldVideo of videosOnlyInSupabase) {
      console.log(`\n--- Processing older video: ${oldVideo.platform_video_id} ---`)
      
      try {
        const insights = await tiktok.getVideoInsights(oldVideo.platform_video_id)
        
        if (insights && insights.view_count) {
          console.log(`  - Found insights: views=${insights.view_count}, likes=${insights.like_count}`)
          
          await supabase
            .from('video_metrics')
            .insert({
              video_id: oldVideo.id,
              recorded_at: new Date().toISOString(),
              views: insights.view_count || 0,
              likes: insights.like_count || 0,
              comments: insights.comment_count || 0,
              shares: insights.share_count || 0,
              saves: insights.download_count || 0,
              reach: insights.reach || 0,
              avg_watch_time: insights.avg_watch_time || 0,
              avg_watch_percentage: 0,
            })
          
          metricsInserted++
          console.log(`  - Metrics inserted for older video!`)
        } else {
          console.log(`  - No insights available for this video`)
        }
      } catch (err) {
        console.log(`  - Error getting insights:`, err)
      }
    }
    
    console.log(`\n=== SYNC TIKTOK COMPLETE ===`)
    console.log(`New videos added: ${newVideosAdded}`)
    console.log(`Videos updated: ${updatedVideos}`)
    console.log(`Metric records inserted: ${metricsInserted}`)
    
    return NextResponse.json({ 
      success: true, 
      newVideosAdded,
      updatedVideos,
      metricsInserted,
      totalVideosInSupabase: existingVideos?.length || 0,
      videosFromAPI: videosFromTikTok.length
    })
    
  } catch (error) {
    console.error('Sync TikTok error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Sync failed', details: errorMessage }, { status: 500 })
  }
}