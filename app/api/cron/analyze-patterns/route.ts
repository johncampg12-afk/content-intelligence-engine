import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DeepSeekAI } from '@/lib/ai/deepseek'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('=== ANALYZE PATTERNS START ===')
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
    
    // Obtener videos con métricas
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select(`
        *,
        video_metrics (
          views,
          likes,
          comments,
          shares,
          engagement_rate,
          recorded_at
        )
      `)
      .eq('user_id', userId)
      .order('published_at', { ascending: false })
      .limit(50)
    
    if (videosError || !videos) {
      console.error('Error fetching videos:', videosError)
      return NextResponse.json({ error: 'No videos found' }, { status: 404 })
    }
    
    // Preparar datos para análisis
    const metricsData = videos.map(v => ({
      title: v.title,
      duration: v.duration,
      published_at: v.published_at,
      metrics: v.video_metrics?.[0] || null
    })).filter(v => v.metrics)
    
    // Llamar a DeepSeek para análisis
    const deepseek = new DeepSeekAI()
    const analysis = await deepseek.analyzePatterns(metricsData)
    
    // Guardar análisis en Supabase
    const { error: insertError } = await supabase
      .from('content_patterns')
      .insert({
        user_id: userId,
        platform: 'tiktok',
        pattern_type: 'weekly_analysis',
        pattern_value: { analysis },
        confidence_score: 0.85,
        analyzed_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('Error saving analysis:', insertError)
    }
    
    console.log('Analysis complete')
    console.log('=== ANALYZE PATTERNS END ===')
    
    return NextResponse.json({ 
      success: true, 
      analysis: analysis.substring(0, 500) 
    })
    
  } catch (error) {
    console.error('Analyze patterns error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}