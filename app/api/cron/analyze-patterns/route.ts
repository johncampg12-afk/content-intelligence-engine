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
    
    // Obtener perfil del usuario (tipo de cuenta, objetivo, audiencia)
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type_id, content_goal, target_audience')
      .eq('id', userId)
      .single()
    
    // Obtener el nombre del tipo de cuenta
    let accountTypeName = 'No especificado'
    let nichePatterns = ''
    
    if (profile?.account_type_id) {
      const { data: accountType } = await supabase
        .from('account_types')
        .select('name, icon')
        .eq('id', profile.account_type_id)
        .single()
      
      if (accountType) {
        accountTypeName = `${accountType.icon} ${accountType.name}`
      }
      
      // Obtener patrones de éxito para este tipo de cuenta
      const { data: patterns } = await supabase
        .from('success_patterns')
        .select('*')
        .eq('account_type_id', profile.account_type_id)
      
      if (patterns && patterns.length > 0) {
        nichePatterns = `\n\n## PATRONES DE ÉXITO PARA TU NICHO (${accountTypeName})\n`
        nichePatterns += `Estos patrones han sido extraídos de cuentas exitosas en tu mismo nicho:\n\n`
        
        for (const p of patterns) {
          const patternTitle = p.pattern_type.replace(/_/g, ' ').toUpperCase()
          nichePatterns += `### ${patternTitle}\n`
          nichePatterns += `- Valor: ${JSON.stringify(p.pattern_value, null, 2)}\n`
          nichePatterns += `- Confianza: ${(p.confidence_score * 100).toFixed(0)}%\n`
          
          if (p.sample_videos && p.sample_videos.length > 0) {
            nichePatterns += `- Ejemplos reales:\n`
            p.sample_videos.slice(0, 2).forEach((video: any) => {
              nichePatterns += `  * "${video.title}" - ${video.views.toLocaleString()} vistas, ${video.shares} shares\n`
            })
          }
          nichePatterns += `\n`
        }
      }
    }
    
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
    
    if (videosError || !videos || videos.length === 0) {
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
    
    if (metricsData.length === 0) {
      return NextResponse.json({ error: 'No metrics data available' }, { status: 404 })
    }
    
    // Llamar a DeepSeek para análisis con contexto de nicho
    const deepseek = new DeepSeekAI()
    const analysis = await deepseek.analyzePatternsWithNiche(metricsData, {
      accountType: accountTypeName,
      contentGoal: profile?.content_goal || 'No especificado',
      targetAudience: profile?.target_audience || 'No especificada',
      nichePatterns
    })
    
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
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
    }
    
    console.log('Analysis complete')
    console.log('=== ANALYZE PATTERNS END ===')
    
    return NextResponse.json({ 
      success: true, 
      analysis 
    })
    
  } catch (error) {
    console.error('Analyze patterns error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Analysis failed', details: errorMessage }, { status: 500 })
  }
}