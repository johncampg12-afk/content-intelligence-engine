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
    
    // Obtener estadísticas reales
    const { data: videos } = await supabase
      .from('videos')
      .select('duration, video_metrics(views, likes, comments, shares)')
      .eq('user_id', user.id)
      .limit(50)
    
    let realStats = {
      avgViews: 0,
      avgEngagementRate: 0,
      avgDuration: 0,
      totalVideos: 0
    }
    
    if (videos && videos.length > 0) {
      const totalViews = videos.reduce((sum, v) => sum + (v.video_metrics?.[0]?.views || 0), 0)
      const totalEngagement = videos.reduce((sum, v) => {
        const metrics = v.video_metrics?.[0] || {}
        return sum + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)
      }, 0)
      const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0)
      
      realStats = {
        avgViews: totalViews / videos.length,
        avgEngagementRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0,
        avgDuration: totalDuration / videos.length,
        totalVideos: videos.length
      }
    }
    
    // Obtener evolución
    const { data: previousProfile } = await supabase
      .from('profiles')
      .select('last_stats')
      .eq('id', user.id)
      .single()
    
    let evolution = null
    if (previousProfile?.last_stats) {
      evolution = {
        viewsChange: previousProfile.last_stats.avgViews > 0 
          ? ((realStats.avgViews - previousProfile.last_stats.avgViews) / previousProfile.last_stats.avgViews) * 100 
          : 0,
        engagementChange: previousProfile.last_stats.avgEngagementRate > 0 
          ? ((realStats.avgEngagementRate - previousProfile.last_stats.avgEngagementRate) / previousProfile.last_stats.avgEngagementRate) * 100 
          : 0,
      }
    }
    
    // Construir FullContext
    const fullContext = {
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
    const deepseek = new DeepSeekAI()
    const ideas = await deepseek.generateIdeas(fullContext, realStats)
    
    return NextResponse.json({ success: true, ideas })
    
  } catch (error) {
    console.error('Generate ideas error:', error)
    return NextResponse.json({ error: 'Failed to generate ideas' }, { status: 500 })
  }
}