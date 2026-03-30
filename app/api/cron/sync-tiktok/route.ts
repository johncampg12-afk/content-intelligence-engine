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
    
    // Verificar si el token ha expirado
    if (account.expires_at && new Date(account.expires_at) < new Date()) {
      console.log('Token expired, refreshing...')
      const tiktok = new TikTokAPI(account.access_token)
      const refreshData = await tiktok.refreshToken(account.refresh_token)
      
      if (refreshData.access_token) {
        await supabase
          .from('connected_accounts')
          .update({
            access_token: refreshData.access_token,
            refresh_token: refreshData.refresh_token,
            expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          })
          .eq('id', account.id)
        
        account.access_token = refreshData.access_token
      }
    }
    
    // Obtener TODOS los videos usando paginación
    const tiktok = new TikTokAPI(account.access_token)
    const videos = await tiktok.getAllUserVideos()
    
    console.log(`Found ${videos.length} videos total`)
    
    let videosSaved = 0
    let metricsSaved = 0
    let errors = 0
    
    for (const video of videos) {
      try {
        console.log(`Processing video: ${video.id} - ${video.title || 'no title'}`)
        
        // Guardar video y obtener el ID generado
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
          errors++
          continue
        }
        
        videosSaved++
        
        // Guardar métricas - USAR videoRecord.id (el UUID de Supabase)
        const { error: metricsError } = await supabase
          .from('video_metrics')
          .insert({
            video_id: videoRecord.id,  // ← USAR EL ID DE SUPABASE, NO EL DE TIKTOK
            recorded_at: new Date().toISOString(),
            views: video.view_count || 0,
            likes: video.like_count || 0,
            comments: video.comment_count || 0,
            shares: video.share_count || 0,
            saves: video.download_count || 0,
            reach: video.reach || 0,
            avg_watch_time: video.avg_watch_time || 0,
            avg_watch_percentage: video.avg_watch_percentage || 0,
          })
        
        if (metricsError) {
          console.error(`Error saving metrics for ${video.id}:`, metricsError)
          errors++
        } else {
          metricsSaved++
          console.log(`✓ Metrics saved for ${video.id}: views=${video.view_count}, likes=${video.like_count}`)
        }
        
      } catch (err) {
        console.error(`Error processing video ${video.id}:`, err)
        errors++
      }
    }
    
    console.log(`=== SYNC TIKTOK COMPLETE ===`)
    console.log(`Videos saved: ${videosSaved}/${videos.length}`)
    console.log(`Metrics saved: ${metricsSaved}`)
    console.log(`Errors: ${errors}`)
    
    return NextResponse.json({ 
      success: true, 
      videosSaved, 
      metricsSaved,
      totalVideos: videos.length,
      errors
    })
    
  } catch (error) {
    console.error('Sync TikTok error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Sync failed', details: errorMessage }, { status: 500 })
  }
}