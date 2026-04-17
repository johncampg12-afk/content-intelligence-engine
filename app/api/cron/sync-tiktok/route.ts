import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { TikTokAPI } from '@/lib/platforms/tiktok'

// Función para extraer hashtags del texto
function extractHashtags(text: string): string[] {
  if (!text) return []
  const hashtagRegex = /#[\w\u00f1\u00d1\u00e1\u00e9\u00ed\u00f3\u00fa\u00fc]+/gi
  const matches = text.match(hashtagRegex)
  if (!matches) return []
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
    
    console.log('TikTok account found')
    
    let tiktok = new TikTokAPI(account.access_token)
    
    // Verificar si el token está por expirar (menos de 1 día)
    if (account.expires_at) {
      const tokenExpiresAt = new Date(account.expires_at)
      const now = new Date()
      const hoursUntilExpiry = (tokenExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      if (hoursUntilExpiry < 24) {
        console.log(`Token expires in ${hoursUntilExpiry.toFixed(1)} hours. Refreshing...`)
        
        try {
          const refreshData = await tiktok.refreshToken(account.refresh_token)
          
          if (refreshData.access_token) {
            // Actualizar token en Supabase
            await supabase
              .from('connected_accounts')
              .update({
                access_token: refreshData.access_token,
                refresh_token: refreshData.refresh_token,
                expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
              })
              .eq('id', account.id)
            
            // Actualizar el token en la instancia actual
            account.access_token = refreshData.access_token
            tiktok = new TikTokAPI(refreshData.access_token)
            
            console.log('Token refreshed successfully')
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError)
        }
      }
    }
    
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
      
      // Generar thumbnail URL desde múltiples fuentes
      let thumbnailUrl = ''
      
      if (video.cover_image_url) {
        thumbnailUrl = video.cover_image_url
      } else if (video.metadata?.cover_image_url) {
        thumbnailUrl = video.metadata.cover_image_url
      } else if (video.id) {
        // Formato alternativo de TikTok
        thumbnailUrl = `https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/${video.id}~tplv-tiktokx.jpeg`
      }
      
      console.log(`Processing video: ${video.id} - Thumbnail: ${thumbnailUrl ? 'YES' : 'NO'}`)
      
      // Guardar video
      const { data: videoRecord, error: videoError } = await supabase
        .from('videos')
        .upsert({
          user_id: userId,
          platform: 'tiktok',
          platform_video_id: video.id,
          title: title,
          description: video.description || '',
          thumbnail_url: thumbnailUrl,
          duration: video.duration || 0,
          published_at: video.create_time ? new Date(video.create_time * 1000).toISOString() : new Date().toISOString(),
          hashtags: extractedHashtags,
          sound: 'Original Sound',
          metadata: {
            share_url: video.share_url,
            cover_image_url: video.cover_image_url,
            video_url: video.video_url,
            original_data: video
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
    
    // ============================================
    // MATCHEAR IDEAS PENDIENTES CON VIDEOS NUEVOS
    // ============================================
    try {
      const { data: pendingIdeas } = await supabase
        .from('ideas_history')
        .select('*')
        .eq('user_id', userId)
        .is('used_at', null)
        .gte('generated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('generated_at', { ascending: false })
        .limit(50)

      if (pendingIdeas && pendingIdeas.length > 0 && videos && videos.length > 0) {
        console.log(`[Matcher] Checking ${pendingIdeas.length} pending ideas against ${videos.length} videos`)
        
        for (const video of videos) {
          const videoTitle = video.title || ''
          const videoDesc = video.description || ''
          const videoText = `${videoTitle} ${videoDesc}`.toLowerCase()

          for (const idea of pendingIdeas) {
            // Si ya tiene matched_video_id, saltar
            if (idea.matched_video_id) continue
            
            // Extraer palabras clave del hook (mínimo 4 letras, excluyendo palabras comunes)
            const stopWords = ['sobre', 'para', 'como', 'esto', 'que', 'una', 'unas', 'unos', 'con', 'sin', 'por', 'los', 'las', 'esa', 'ese', 'esa', 'del', 'al', 'lo', 'le', 'la', 'el', 'en']
            const hookWords = idea.hook.toLowerCase()
              .split(' ')
              .filter((w: string) => w.length > 4 && !stopWords.includes(w))

            // Contar cuántas de esas palabras aparecen en el título/descripción del video
            const matches = hookWords.filter((word: string) => videoText.includes(word)).length

            // Si coinciden al menos 3 palabras, consideramos que la idea fue usada
            if (matches >= 3) {
              // Calcular engagement rate
              const views = video.view_count || 0
              const likes = video.like_count || 0
              const comments = video.comment_count || 0
              const shares = video.share_count || 0
              const saves = video.download_count || 0
              const engagementRate = views > 0 
                ? (((likes + comments + shares) / views) * 100).toFixed(2)
                : '0'

              await supabase
                .from('ideas_history')
                .update({
                  used_at: video.create_time ? new Date(video.create_time * 1000).toISOString() : new Date().toISOString(),
                  matched_video_id: video.id,
                  performance: {
                    views,
                    likes,
                    comments,
                    shares,
                    saves,
                    engagement_rate: parseFloat(engagementRate)
                  }
                })
                .eq('id', idea.id)

              console.log(`[Matcher] ✅ Idea "${idea.title}" matched with video ${video.id} (${matches} keywords)`)
              break // Una idea solo se matchea con un video
            }
          }
        }
      }
    } catch (error) {
      console.error('[Matcher] Error matching ideas:', error)
      // No romper el sync si falla el matcher
    }
    
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