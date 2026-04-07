import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DeepSeekAI } from '@/lib/ai/deepseek'

export async function POST(request: NextRequest) {
  try {
    const { 
      videoIdea, 
      contentType, 
      campaignGoal, 
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
    
    // Obtener historial de videos del usuario
    const { data: videos } = await supabase
      .from('videos')
      .select(`
        title,
        duration,
        hashtags,
        sound,
        video_metrics (views, likes, comments, shares, engagement_rate)
      `)
      .eq('user_id', user.id)
      .order('published_at', { ascending: false })
      .limit(50)
    
    const historicalData = videos?.map(v => ({
      title: v.title,
      duration: v.duration,
      hashtags: v.hashtags,
      sound: v.sound,
      views: v.video_metrics?.[0]?.views || 0,
      engagement: v.video_metrics?.[0]?.engagement_rate || 0
    })) || []
    
    // Llamar a DeepSeek para predecir
    const deepseek = new DeepSeekAI()
    
    const prompt = `
Eres un analista de datos senior especializado en predicción de viralidad en TikTok.

## Perfil del usuario:
- Nicho: ${accountTypeName}
- Objetivo: ${profile?.content_goal || 'No especificado'}
- Audiencia: ${profile?.target_audience || 'No especificada'}

## Patrones de éxito identificados en este nicho:
${nichePatterns || 'No hay patrones específicos para este nicho.'}

## Datos históricos del usuario (últimos 50 videos):
${JSON.stringify(historicalData.slice(0, 20), null, 2)}

## Nueva idea de contenido:
- Idea: "${videoIdea}"
- Tipo: ${contentType}
- Objetivo: ${campaignGoal}
- Duración: ${duration} segundos
- Hashtags: ${hashtags?.join(', ') || 'ninguno'}
- Sonido: ${sound || 'original'}

## Analiza y responde EXACTAMENTE en formato JSON. Sé REALISTA y usa los datos históricos como referencia.
NO inventes números que no estén basados en los datos proporcionados.

{
  "predicted_views": número (basado en el promedio de vistas históricas del usuario, ajustado por el tipo de contenido),
  "predicted_engagement": número (basado en el engagement histórico, ajustado por el tipo de contenido),
  "viral_score": número (0-100, basado en qué tan bien se alinea esta idea con los patrones exitosos del nicho),
  "optimal_day": "Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo",
  "optimal_hour": número (0-23),
  "confidence_score": número (0-100),
  "reasoning": "explicación breve y realista",
  "recommendations": ["recomendación1", "recomendación2", "recomendación3", "recomendación4", "recomendación5"],
  "benchmark": {
    "avg_views": número (promedio del nicho, basado en patrones),
    "avg_engagement": número,
    "percentile": número
  },
  "confidence_interval": {
    "lower": número,
    "upper": número
  }
}`
    
    const prediction = await deepseek.predictViral(prompt)
    
    // Asegurar valores por defecto si faltan
    const finalPrediction = {
      predicted_views: prediction.predicted_views || 0,
      predicted_engagement: prediction.predicted_engagement || 0,
      viral_score: prediction.viral_score || 0,
      optimal_day: prediction.optimal_day || 'Miércoles',
      optimal_hour: prediction.optimal_hour || 17,
      confidence_score: prediction.confidence_score || 50,
      reasoning: prediction.reasoning || 'Análisis basado en datos históricos',
      recommendations: prediction.recommendations || ['Revisa la estrategia de contenido', 'Optimiza los hashtags'],
      benchmark: prediction.benchmark || { avg_views: 0, avg_engagement: 0, percentile: 50 },
      confidence_interval: prediction.confidence_interval || { lower: 0, upper: 0 }
    }
    
    // Guardar predicción completa en la base de datos
    const { data: savedPrediction, error: saveError } = await supabase
      .from('predictions')
      .insert({
        user_id: user.id,
        video_idea: videoIdea,
        content_type: contentType,
        campaign_goal: campaignGoal,
        duration: duration,
        hashtags: hashtags || [],
        sound: sound || 'Original',
        predicted_views: finalPrediction.predicted_views,
        predicted_engagement: finalPrediction.predicted_engagement,
        viral_score: finalPrediction.viral_score,
        optimal_day: finalPrediction.optimal_day,
        optimal_hour: finalPrediction.optimal_hour,
        confidence_score: finalPrediction.confidence_score,
        reasoning: finalPrediction.reasoning,
        recommendations: finalPrediction.recommendations,
        benchmark: finalPrediction.benchmark,
        confidence_interval: finalPrediction.confidence_interval,
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
        ...finalPrediction,
        id: savedPrediction?.id,
        video_idea: videoIdea,
        content_type: contentType,
        campaign_goal: campaignGoal,
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