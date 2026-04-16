import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DeepSeekAI } from '@/lib/ai/deepseek'

export async function POST(request: NextRequest) {
  try {
    const { 
      videoIdea, 
      contentType, 
      duration, 
      hashtags, 
      sound 
    } = await request.json()
    
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
            } catch {}
          },
        },
      }
    )
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Obtener perfil del usuario (nicho, objetivo, audiencia)
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type_id, content_goal, target_audience')
      .eq('id', user.id)
      .single()
    
    // Obtener el nombre del tipo de cuenta
    let accountTypeName = 'No especificado'
    if (profile?.account_type_id) {
      const { data: accountType } = await supabase
        .from('account_types')
        .select('name')
        .eq('id', profile.account_type_id)
        .single()
      if (accountType) {
        accountTypeName = accountType.name
      }
    }
    
    // Obtener patrones de éxito del nicho
    let nichePatterns = ''
    if (profile?.account_type_id) {
      const { data: patterns } = await supabase
        .from('success_patterns')
        .select('*')
        .eq('account_type_id', profile.account_type_id)
      
      if (patterns && patterns.length > 0) {
        nichePatterns = patterns.map(p => {
          if (p.pattern_type === 'title_style') {
            return `- Estilo de título exitoso: ${JSON.stringify(p.pattern_value)}`
          }
          if (p.pattern_type === 'best_duration') {
            return `- Duración óptima: ${JSON.stringify(p.pattern_value)}`
          }
          if (p.pattern_type === 'hashtags') {
            return `- Hashtags que funcionan: ${JSON.stringify(p.pattern_value)}`
          }
          return ''
        }).filter(p => p).join('\n')
      }
    }
    
    // Obtener estadísticas reales del usuario
    const { data: videos } = await supabase
      .from('videos')
      .select('duration, video_metrics(views, likes, comments, shares)')
      .eq('user_id', user.id)
      .limit(50)
    
    let realStats = {
      avgViews: 0,
      avgEngagementRate: 0,
      avgDuration: 0,
      videosOver60s: 0,
      totalVideos: 0
    }
    
    if (videos && videos.length > 0) {
      const totalViews = videos.reduce((sum, v) => sum + (v.video_metrics?.[0]?.views || 0), 0)
      const totalEngagement = videos.reduce((sum, v) => {
        const metrics = v.video_metrics?.[0] || {}
        return sum + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)
      }, 0)
      const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0)
      const videosOver60s = videos.filter(v => (v.duration || 0) >= 60).length
      
      realStats = {
        avgViews: totalViews / videos.length,
        avgEngagementRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0,
        avgDuration: totalDuration / videos.length,
        videosOver60s,
        totalVideos: videos.length
      }
    }
    
    // Detectar si la idea tiene CTA
    const hasCTA = videoIdea.toLowerCase().includes('link') || 
                   videoIdea.toLowerCase().includes('bio') ||
                   videoIdea.toLowerCase().includes('comentarios') ||
                   videoIdea.toLowerCase().includes('sígueme')
    
    // Llamar a DeepSeek para validar la idea
    const deepseek = new DeepSeekAI()
    const prediction = await deepseek.predictViral(
      { videoIdea, contentType, duration, hashtags, sound, hasCTA },
      {
        accountType: accountTypeName,
        contentGoal: profile?.content_goal || 'viral_growth',
        targetAudience: profile?.target_audience || 'general',
        nichePatterns
      },
      realStats
    )
    
    // Guardar predicción en la base de datos
    const { data: savedPrediction, error: saveError } = await supabase
      .from('predictions')
      .insert({
        user_id: user.id,
        video_idea: videoIdea,
        content_type: contentType,
        campaign_goal: profile?.content_goal,
        duration: duration,
        hashtags: hashtags,
        sound: sound || 'Original',
        predicted_views: 0,
        predicted_engagement: 0,
        viral_score: prediction.veredicto === 'GRÁBALA YA' ? 80 : prediction.veredicto === 'ARRÉGLALA' ? 50 : 20,
        optimal_day: '',
        optimal_hour: 0,
        confidence_score: parseInt(prediction.probabilidad_exito),
        reasoning: prediction.razon_brutal,
        recommendations: prediction.cambios_obligatorios,
        benchmark: null,
        confidence_interval: null,
        status: 'active'
      })
      .select()
      .single()
    
    if (saveError) {
      console.error('Error saving prediction:', saveError)
    }
    
    return NextResponse.json({ 
      success: true, 
      prediction: {
        ...prediction,
        id: savedPrediction?.id,
        video_idea: videoIdea,
        content_type: contentType,
        duration: duration,
        hashtags: hashtags,
        sound: sound
      }
    })
    
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json({ error: 'Prediction failed' }, { status: 500 })
  }
}