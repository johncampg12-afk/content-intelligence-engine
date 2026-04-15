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
    
    // ============================================
    // REFRESH TOKEN AUTOMÁTICO
    // ============================================
    let accessToken = account.access_token
    const tokenExpiresAt = new Date(account.expires_at)
    const now = new Date()
    const hoursUntilExpiry = (tokenExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilExpiry < 24) {
      console.log(`Token expires in ${hoursUntilExpiry.toFixed(1)} hours. Refreshing...`)
      
      try {
        const refreshResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_ID!,
            client_secret: process.env.TIKTOK_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: account.refresh_token,
          })
        })
        
        const refreshData = await refreshResponse.json()
        
        if (refreshData.access_token) {
          await supabase
            .from('connected_accounts')
            .update({
              access_token: refreshData.access_token,
              refresh_token: refreshData.refresh_token,
              expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
            })
            .eq('id', account.id)
          
          accessToken = refreshData.access_token
          console.log('Token refreshed successfully')
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError)
      }
    }
    // ============================================
    
    const tiktok = new TikTokAPI(accessToken)
    
    // Obtener videos recientes
    const videos = await tiktok.getUserVideos(50)
    console.log(`Found ${videos.length} videos from TikTok`)
    
    let videosSaved = 0
    let metricsUpdated = 0
    
    const processedVideoIds = new Set()
    
    for (const video of videos) {
      if (processedVideoIds.has(video.id)) continue
      processedVideoIds.add(video.id)
      
      const title = video.title || ''
      const extractedHashtags = extractHashtags(title)
      
      console.log(`Processing video: ${video.id}`)
      
      // Guardar video con thumbnail mejorado
      const { data: videoRecord, error: videoError } = await supabase
        .from('videos')
        .upsert({
          user_id: userId,
          platform: 'tiktok',
          platform_video_id: video.id,
          title: title,
          description: '',
          thumbnail_url: video.cover_image_url || video.cover_image_url,
          duration: video.duration || 0,
          published_at: video.create_time ? new Date(video.create_time * 1000).toISOString() : new Date().toISOString(),
          hashtags: extractedHashtags,
          sound: 'Original Sound',
          metadata: {
            share_url: video.share_url,
            cover_url: video.cover_image_url,
            video_url: video.video_url
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
      
      const { data: existingMetric } = await supabase
        .from('video_metrics')
        .select('id')
        .eq('video_id', videoRecord.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
      
      if (existingMetric && existingMetric.length > 0) {
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