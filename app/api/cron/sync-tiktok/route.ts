import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { TikTokAPI } from '@/lib/platforms/tiktok'

// Función para extraer hashtags del texto
function extractHashtags(text: string): string[] {
  if (!text) return []
  // Expresión regular más robusta para hashtags (permite letras, números, guión bajo, acentos)
  const hashtagRegex = /#[\w\u00f1\u00d1\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc]+/gi
  const matches = text.match(hashtagRegex)
  if (!matches) return []
  // Limpiar: eliminar el '#' y convertir a minúsculas (opcional)
  return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))]
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
    
    // Obtener videos recientes
    const videos = await tiktok.getUserVideos(50)
    console.log(`Found ${videos.length} videos from TikTok`)
    
    let videosSaved = 0
    let metricsUpdated = 0
    
    const processedVideoIds = new Set()
    
    for (const video of videos) {
      if (processedVideoIds.has(video.id)) continue
      processedVideoIds.add(video.id)
      
      // Extraer hashtags del título
      const title = video.title || ''
      const extractedHashtags = extractHashtags(title)
      
      console.log(`Processing video: ${video.id} - Hashtags: ${extractedHashtags.join(', ') || 'none'}`)
      
      // Guardar video
      const { data: videoRecord, error: videoError } = await supabase
        .from('videos')
        .upsert({
          user_id: userId,
          platform: 'tiktok',
          platform_video_id: video.id,
          title: title,
          description: '',
          thumbnail_url: video.cover_image_url,
          duration: video.duration || 0,
          published_at: video.create_time ? new Date(video.create_time * 1000).toISOString() : new Date().toISOString(),
          hashtags: extractedHashtags,
          sound: 'Original Sound',
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
      
      const newViews = video.view_count || 0
      const newLikes = video.like_count || 0
      const newComments = video.comment_count || 0
      const newShares = video.share_count || 0
      
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
            views: newViews,
            likes: newLikes,
            comments: newComments,
            shares: newShares,
            recorded_at: new Date().toISOString()
          })
          .eq('id', existingMetric[0].id)
        
        if (!updateError) {
          metricsUpdated++
          console.log(`Updated metrics for ${video.id}: views=${newViews}`)
        }
      } else {
        // Insertar primera métrica
        const { error: insertError } = await supabase
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
        
        if (!insertError) {
          metricsUpdated++
          console.log(`Inserted metrics for ${video.id}`)
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