import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DeepSeekAI } from '@/lib/ai/deepseek'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
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
    
    // Obtener perfil completo
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    // Obtener nombre del tipo de cuenta
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
    
    // Obtener patrones del nicho
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
          return ''
        }).filter(p => p).join('\n')
      }
    }
    
    // Obtener videos para calcular stats
    const { data: videos } = await supabase
      .from('videos')
      .select('duration, video_metrics(views, likes, comments, shares, saves, engagement_rate, recorded_at)')
      .eq('user_id', user.id)
      .limit(50)
    
    const deepseek = new DeepSeekAI()
    let realStats = {
      avgViews: 0,
      avgEngagementRate: 0,
      avgDuration: 0,
      totalVideos: 0,
      avgSavesRate: 0
    }
    
    if (videos && videos.length > 0) {
      const metricsData = videos.map(v => ({
        duration: v.duration,
        metrics: v.video_metrics?.[0] || {}
      }))
      const calculatedStats = deepseek.calculateRealStats(metricsData)
      realStats = {
        avgViews: calculatedStats.avgViews,
        avgEngagementRate: calculatedStats.avgEngagementRate,
        avgDuration: calculatedStats.avgDuration,
        totalVideos: calculatedStats.totalVideos,
        avgSavesRate: calculatedStats.avgSavesRate || 0
      }
    }
    
    // Obtener evolución
    const { data: previousProfile } = await supabase
      .from('profiles')
      .select('last_stats, last_recommendation')
      .eq('id', user.id)
      .single()
    
    let evolution = undefined
    if (previousProfile?.last_stats) {
      evolution = {
        viewsChange: previousProfile.last_stats.avgViews > 0 
          ? ((realStats.avgViews - previousProfile.last_stats.avgViews) / previousProfile.last_stats.avgViews) * 100 
          : 0,
        engagementChange: previousProfile.last_stats.avgEngagementRate > 0 
          ? ((realStats.avgEngagementRate - previousProfile.last_stats.avgEngagementRate) / previousProfile.last_stats.avgEngagementRate) * 100 
          : 0,
        savesChange: previousProfile.last_stats.avgSavesRate > 0 
          ? ((realStats.avgSavesRate - previousProfile.last_stats.avgSavesRate) / previousProfile.last_stats.avgSavesRate) * 100 
          : 0,
      }
    }
    
    // Construir FullContext
    const fullContext = {
      userId: user.id,
      accountType: accountTypeName,
      contentGoal: profile?.content_goal || 'viral_growth',
      targetAudience: profile?.target_audience || 'general',
      nichePatterns,
      userContext: {
        accountBio: profile?.account_bio || '',
        currentPhase: profile?.current_phase || 'starting',
        mainStruggle: profile?.main_struggle || '',
        lastRecommendation: previousProfile?.last_recommendation || '',
        evolution
      }
    }
    
    // Generar ideas
    const ideas = await deepseek.generateIdeas(fullContext, realStats)
    
    // ============================================
    // GUARDAR IDEAS EN ideas_history (BULK INSERT)
    // ============================================
    if (ideas && ideas.length > 0) {
      await supabase
        .from('ideas_history')
        .insert(
          ideas.map(idea => ({
            user_id: user.id,
            title: idea.title,
            hook: idea.hook,
            hook_template_id: idea.hook_template_id || null,
            description: idea.description,
            duration_suggestion: idea.duration_suggestion,
            cta: idea.cta,
            content_goal: fullContext.contentGoal,
            generated_at: new Date().toISOString()
          }))
        )
    }
    
    // Guardar last_recommendation
    await supabase
      .from('profiles')
      .update({
        last_recommendation: `Generadas ${ideas.length} ideas para ${profile?.content_goal || 'contenido'}`,
        last_analysis_at: new Date().toISOString(),
        last_stats: {
          avgViews: realStats.avgViews,
          avgEngagementRate: realStats.avgEngagementRate,
          avgSavesRate: realStats.avgSavesRate,
          totalVideos: realStats.totalVideos,
          analyzedAt: new Date().toISOString()
        }
      })
      .eq('id', user.id)
    
    return NextResponse.json({ success: true, ideas })
    
  } catch (error) {
    console.error('Generate ideas error:', error)
    return NextResponse.json({ error: 'Failed to generate ideas' }, { status: 500 })
  }
}