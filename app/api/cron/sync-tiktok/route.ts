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
    
    const tiktok = new TikTokAPI(account.access_token)
    
    // Obtener videos recientes (con métricas incluidas)
    const videos = await tiktok.getUserVideos(20)
    console.log(`Found ${videos.length} recent videos`)
    
    let videosSaved = 0
    let metricsUpdated = 0
    
    // Para evitar duplicados, usamos un Set para procesar cada video una sola vez
    const processedVideoIds = new Set()
    
    for (const video of videos) {
      // Saltar duplicados
      if (processedVideoIds.has(video.id)) continue
      processedVideoIds.add(video.id)
      
      // Guardar video (upsert)
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
          hashtags: video.hashtags || [], // Guardar array de hashtags
          sound: video.music_info?.title || 'Original',   // Guardar título del sonido
          metadata: {
            share_url: video.share_url,
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
      
      const newViews = video.view_count || 0
      const newLikes = video.like_count || 0
      const newComments = video.comment_count || 0
      const newShares = video.share_count || 0
      
      console.log(`Processing video record ID: ${videoRecord.id} (TikTok ID: ${video.id})`)
      
      // Buscar la métrica más reciente de este video
      const { data: existingMetric, error: metricFetchError } = await supabase
        .from('video_metrics')
        .select('id, recorded_at, views, likes, comments, shares')
        .eq('video_id', videoRecord.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
      
      if (metricFetchError) {
        console.error(`Error fetching existing metric for video ${video.id}:`, metricFetchError)
      }
      
      console.log(`Existing metric found: ${existingMetric ? existingMetric.length : 0}`)
      if (existingMetric && existingMetric.length > 0) {
        console.log(`Current metric values: views=${existingMetric[0].views}, likes=${existingMetric[0].likes}, recorded_at=${existingMetric[0].recorded_at}`)
      }
      
      if (existingMetric && existingMetric.length > 0) {
        // Actualizar la métrica existente
        const { data: updatedMetric, error: updateError } = await supabase
          .from('video_metrics')
          .update({
            views: newViews,
            likes: newLikes,
            comments: newComments,
            shares: newShares,
            recorded_at: new Date().toISOString()
          })
          .eq('id', existingMetric[0].id)
          .select()
        
        if (updateError) {
          console.error(`❌ Update error for video ${video.id}:`, updateError)
        } else {
          metricsUpdated++
          console.log(`✅ Updated metrics for video ${video.id}: views=${newViews}, likes=${newLikes}, comments=${newComments}, shares=${newShares}`)
          if (updatedMetric && updatedMetric.length > 0) {
            console.log(`   DB row ID: ${updatedMetric[0].id}, new recorded_at: ${updatedMetric[0].recorded_at}`)
          } else {
            console.log(`   No data returned from update (possible no change?)`)
          }
        }
      } else {
        // Insertar primera métrica
        const { data: insertedMetric, error: insertError } = await supabase
          .from('video_metrics')
          .insert({
            video_id: videoRecord.id,
            recorded_at: new Date().toISOString(),
            views: newViews,
            likes: newLikes,
            comments: newComments,
            shares: newShares,
            saves: 0,
            reach: 0,
            avg_watch_time: 0,
            avg_watch_percentage: 0,
          })
          .select()
        
        if (insertError) {
          console.error(`❌ Insert error for video ${video.id}:`, insertError)
        } else {
          metricsUpdated++
          console.log(`➕ Inserted initial metrics for video ${video.id}: views=${newViews}`)
          if (insertedMetric && insertedMetric.length > 0) {
            console.log(`   New row ID: ${insertedMetric[0].id}`)
          }
        }
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