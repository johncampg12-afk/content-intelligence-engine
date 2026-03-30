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
    
    const tiktok = new TikTokAPI(account.access_token)
    
    // 1. Obtener videos (solo metadata básica)
    const videos = await tiktok.getUserVideos(20)
    console.log(`Found ${videos.length} recent videos`)
    
    let videosSaved = 0
    let metricsUpdated = 0
    
    for (const video of videos) {
      console.log(`Processing video: ${video.id}`)
      
      // Guardar video
      const { data: videoRecord, error: videoError } = await supabase
        .from('videos')
        .upsert({
          user_id: userId,
          platform: 'tiktok',
          platform_video_id: video.id,
          title: video.title || '',
          description: '',
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
      
      // 2. Obtener insights actualizados para este video
      const insights = await tiktok.getVideoInsights(video.id)
      
      if (insights) {
        // Buscar la métrica más reciente
        const { data: existingMetric } = await supabase
          .from('video_metrics')
          .select('id')
          .eq('video_id', videoRecord.id)
          .order('recorded_at', { ascending: false })
          .limit(1)
        
        if (existingMetric && existingMetric.length > 0) {
          // Actualizar métrica existente
          const { error: updateError } = await supabase
            .from('video_metrics')
            .update({
              views: insights.view_count || 0,
              likes: insights.like_count || 0,
              comments: insights.comment_count || 0,
              shares: insights.share_count || 0,
              reach: insights.reach_count || 0,
              avg_watch_time: insights.avg_watch_time_seconds || 0,
              recorded_at: new Date().toISOString()
            })
            .eq('id', existingMetric[0].id)
          
          if (!updateError) {
            metricsUpdated++
            console.log(`Updated metrics for video ${video.id}: views=${insights.view_count}`)
          }
        } else {
          // Insertar nueva métrica
          const { error: insertError } = await supabase
            .from('video_metrics')
            .insert({
              video_id: videoRecord.id,
              recorded_at: new Date().toISOString(),
              views: insights.view_count || 0,
              likes: insights.like_count || 0,
              comments: insights.comment_count || 0,
              shares: insights.share_count || 0,
              saves: 0,
              reach: insights.reach_count || 0,
              avg_watch_time: insights.avg_watch_time_seconds || 0,
              avg_watch_percentage: 0,
            })
          
          if (!insertError) {
            metricsUpdated++
            console.log(`Inserted metrics for video ${video.id}`)
          }
        }
      } else {
        console.log(`No insights available for video ${video.id}`)
      }
    }
    
    console.log(`Sync complete: ${videosSaved} videos, ${metricsUpdated} metrics updated`)
    console.log('=== SYNC TIKTOK END ===')
    
    return NextResponse.json({ 
      success: true, 
      videosSaved, 
      metricsUpdated,
      totalVideos: videos.length 
    })
    
  } catch (error) {
    console.error('Sync TikTok error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Sync failed', details: errorMessage }, { status: 500 })
  }
}