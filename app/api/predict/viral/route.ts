import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DeepSeekAI } from '@/lib/ai/deepseek'

export async function POST(request: NextRequest) {
  try {
    const { videoIdea, duration, hashtags, sound } = await request.json()
    
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
    
    // Obtener perfil del usuario (nicho, objetivo)
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type_id, content_goal, target_audience')
      .eq('id', user.id)
      .single()
    
    // Preparar datos históricos para el análisis
    const historicalData = videos?.map(v => ({
      title: v.title,
      duration: v.duration,
      hashtags: v.hashtags,
      sound: v.sound,
      views: v.video_metrics?.[0]?.views || 0,
      engagement: v.video_metrics?.[0]?.engagement_rate || 0
    })) || []
    
    // Llamar a DeepSeek para predecir viralidad
    const deepseek = new DeepSeekAI()
    
    const prompt = `
Eres un analista de datos senior especializado en predicción de viralidad en TikTok.

## Perfil del usuario:
- Nicho: ${profile?.account_type_id || 'No especificado'}
- Objetivo: ${profile?.content_goal || 'No especificado'}
- Audiencia: ${profile?.target_audience || 'No especificada'}

## Datos históricos (últimos 50 videos):
${JSON.stringify(historicalData.slice(0, 20), null, 2)}

## Nueva idea de contenido:
- Idea: "${videoIdea}"
- Duración: ${duration} segundos
- Hashtags: ${hashtags?.join(', ') || 'ninguno'}
- Sonido: ${sound || 'original'}

## Analiza y responde EXACTAMENTE en formato JSON:
{
  "predicted_views": número,
  "predicted_engagement": número (porcentaje),
  "viral_score": número (0-100),
  "optimal_day": "Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo",
  "optimal_hour": número (0-23),
  "confidence_score": número (0-100),
  "reasoning": "explicación breve",
  "recommendations": ["recomendación1", "recomendación2"]
}

Basado en los patrones históricos, predice el rendimiento de esta nueva idea.
Sé realista y usa los datos históricos como referencia.`
    
    const prediction = await deepseek.predictViral(prompt)
    
    // Guardar predicción en la base de datos
    const { data: savedPrediction, error: saveError } = await supabase
      .from('predictions')
      .insert({
        user_id: user.id,
        video_idea: videoIdea,
        predicted_views: prediction.predicted_views,
        predicted_engagement: prediction.predicted_engagement,
        viral_score: prediction.viral_score,
        optimal_day: prediction.optimal_day,
        optimal_hour: prediction.optimal_hour,
        confidence_score: prediction.confidence_score,
        reasoning: prediction.reasoning,
        status: 'pending'
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
        id: savedPrediction?.id
      }
    })
    
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json({ error: 'Prediction failed' }, { status: 500 })
  }
}