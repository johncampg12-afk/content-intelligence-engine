import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ============================================
// TIPOS
// ============================================
export type FullContext = {
  accountType: string
  contentGoal: string
  targetAudience: string
  nichePatterns: string
  userContext?: {
    accountBio: string
    currentPhase: 'starting' | 'growing' | 'monetizing' | 'scaling'
    mainStruggle: string
    lastRecommendation?: string
    evolution?: {
      viewsChange: number
      engagementChange: number
      savesChange: number
    }
  }
}

// Goal Matrix profesional
const goalMatrix: Record<string, any> = {
  monetization: { kpi: 'watch_time', revenue: true, duration: '65-90s', cpm: 3 },
  brand_awareness: { kpi: 'reach y shares', revenue: false, duration: '15-30s' },
  community_building: { kpi: 'comments y saves', revenue: false, duration: '30-60s' },
  viral_growth: { kpi: 'views_3h y completion', revenue: false, duration: '12-21s' },
  lead_generation: { kpi: 'CTR y saves', revenue: false, duration: '30-45s' },
  education: { kpi: 'saves y watch_time', revenue: false, duration: '45-75s' },
  entertainment: { kpi: 'shares y replays', revenue: false, duration: '15-30s' },
  influence: { kpi: 'comments_quality', revenue: false, duration: '60-90s' },
  conversion: { kpi: 'clicks y purchases', revenue: true, duration: '30-45s', cpm: 5 }
}

const getToneByAudience = (audience: string): string => {
  if (audience.includes('teen') || audience.includes('young')) {
    return 'directo, sin rodeos, lenguaje cercano, duro pero real'
  }
  if (audience.includes('professional') || audience.includes('business') || audience.includes('entrepreneur')) {
    return 'ejecutivo, datos duros, ROI, pérdidas en €, sin filtro'
  }
  if (audience.includes('marketer') || audience.includes('agency')) {
    return 'técnico, métricas, benchmarks, oportunidades de escala'
  }
  return 'directo, con datos, sin rodeos'
}

export class DeepSeekAI {
  private client: OpenAI
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    })
  }

  async getCurrentTikTokTrends(): Promise<string> {
    try {
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

      const { data } = await supabase
        .from('platform_trends')
        .select('content')
        .eq('platform', 'tiktok')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return data?.content || 'No hay información actualizada sobre el algoritmo de TikTok.'
    } catch (error) {
      console.error('Error fetching trends:', error)
      return 'No hay información actualizada sobre el algoritmo de TikTok.'
    }
  }

  private calculateRealStats(metricsData: any[]) {
    const totalVideos = metricsData.length
    
    if (totalVideos === 0) {
      return {
        totalVideos: 0, totalViews: 0, totalLikes: 0, totalComments: 0,
        totalShares: 0, totalSaves: 0, totalEngagement: 0, avgViews: 0,
        avgEngagementRate: 0, avgSavesRate: 0, avgWatchTime: 0, avgDuration: 0,
        videosOver60s: 0, bestVideo: null
      }
    }
    
    const totalViews = metricsData.reduce((sum, v) => sum + (v.metrics?.views || 0), 0)
    const totalLikes = metricsData.reduce((sum, v) => sum + (v.metrics?.likes || 0), 0)
    const totalComments = metricsData.reduce((sum, v) => sum + (v.metrics?.comments || 0), 0)
    const totalShares = metricsData.reduce((sum, v) => sum + (v.metrics?.shares || 0), 0)
    const totalSaves = metricsData.reduce((sum, v) => sum + (v.metrics?.saves || 0), 0)
    const totalWatchTime = metricsData.reduce((sum, v) => sum + (v.metrics?.watch_time || 0), 0)
    
    const avgDuration = totalVideos > 0 
      ? metricsData.reduce((sum, v) => sum + (v.duration || 0), 0) / totalVideos : 0
    
    const totalEngagement = totalLikes + totalComments + totalShares
    const avgViews = totalVideos > 0 ? totalViews / totalVideos : 0
    const avgEngagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0
    const avgSavesRate = totalViews > 0 ? (totalSaves / totalViews) * 100 : 0
    const avgWatchTime = totalVideos > 0 ? totalWatchTime / totalVideos : 0
    const videosOver60s = metricsData.filter(v => (v.duration || 0) >= 60).length
    
    let bestVideo = null
    let maxEngagement = 0
    for (const v of metricsData) {
      const engagement = (v.metrics?.likes || 0) + (v.metrics?.comments || 0) + (v.metrics?.shares || 0)
      if (engagement > maxEngagement) {
        maxEngagement = engagement
        bestVideo = v
      }
    }
    
    return {
      totalVideos, totalViews, totalLikes, totalComments, totalShares, totalSaves,
      totalEngagement, avgViews, avgEngagementRate, avgSavesRate, avgWatchTime,
      avgDuration, videosOver60s,
      bestVideo: bestVideo ? {
        title: bestVideo.title, published_at: bestVideo.published_at,
        views: bestVideo.metrics?.views || 0, likes: bestVideo.metrics?.likes || 0,
        comments: bestVideo.metrics?.comments || 0, shares: bestVideo.metrics?.shares || 0,
        saves: bestVideo.metrics?.saves || 0, engagement: maxEngagement,
        duration: bestVideo.duration,
        engagement_rate: ((maxEngagement / (bestVideo.metrics?.views || 1)) * 100).toFixed(2)
      } : null
    }
  }
  
  // ============================================
  // 1. analyzePatternsWithNiche - CON MEMORIA
  // ============================================
  async analyzePatternsWithNiche(metricsData: any, fullContext: FullContext): Promise<string> {
    try {
      const currentTrends = await this.getCurrentTikTokTrends()
      const realStats = this.calculateRealStats(metricsData)
      
      const goal = goalMatrix[fullContext.contentGoal] || goalMatrix.viral_growth
      const tone = getToneByAudience(fullContext.targetAudience)

      const userBlock = fullContext.userContext ? `
MEMORIA DEL CREADOR:
- Bio: ${fullContext.userContext.accountBio}
- Fase: ${fullContext.userContext.currentPhase}
- Dolor principal: ${fullContext.userContext.mainStruggle}
- Última recomendación dada: ${fullContext.userContext.lastRecommendation || 'ninguna'}
- Evolución últimos 7 días: Views ${fullContext.userContext.evolution?.viewsChange || 0}%, Engagement ${fullContext.userContext.evolution?.engagementChange || 0}%, Saves ${fullContext.userContext.evolution?.savesChange || 0}%

INSTRUCCIÓN CRÍTICA: Si evolution existe, menciona en tu diagnóstico si mejoró, empeoró o se mantuvo. Si lastRecommendation existe y evolution es negativa, dile que ignoró el consejo. Personaliza el tono según currentPhase (starting = más didáctico, scaling = más directo a ROI).
` : ''

      if (realStats.totalVideos === 0) {
        return `**DIAGNÓSTICO BRUTAL**\n\nNo hay suficientes datos para analizar. Sincroniza al menos 5 videos para obtener recomendaciones precisas.\n\n**RECOMENDACIÓN 1**\nHaz esto 7 días: Conecta tu TikTok y sincroniza al menos 5 videos.\n\nElige 1 y hazla. Si haces las 3 a la vez, no harás ninguna.`
      }

      let goalRules = ''
      switch (fullContext.contentGoal) {
        case 'monetization':
          goalRules = `→ Si haces <60s, ganas 0€ de Creator Rewards.`
          break
        case 'viral_growth':
          goalRules = `→ Si duras >30s, matas el completion rate. El viral vive en 12-21s.`
          break
        case 'brand_awareness':
          goalRules = `→ Si shares/views <2%, no expandes marca.`
          break
        case 'community_building':
          goalRules = `→ Si comments <1% de views, tienes espectadores, no comunidad.`
          break
        case 'education':
          goalRules = `→ Si saves <3%, tu contenido no se guarda = no vale.`
          break
        case 'lead_generation':
          goalRules = `→ Si no hay CTA en 3s, pierdes el click.`
          break
        case 'entertainment':
          goalRules = `→ Si shares/views <1%, no hay viralidad.`
          break
        case 'influence':
          goalRules = `→ Si comments son vacíos ("🔥", "👏"), no influyes.`
          break
        default:
          goalRules = `→ Alinea todo con el objetivo: ${fullContext.contentGoal}`
      }

      const systemMessage = `Eres Head of Growth de Content Intelligence Engine. Tu trabajo es decirle al creador por qué no está ganando dinero o creciendo, usando SUS datos contra el BENCHMARK de su nicho.

CONTEXTO:
- Objetivo: ${fullContext.contentGoal} (KPI: ${goal.kpi})
- Duración ideal: ${goal.duration}
- ¿Calculamos €? ${goal.revenue ? 'Sí, usa CPM ' + goal.cpm + '€' : 'No, habla de oportunidad perdida'}
- Audiencia: ${fullContext.targetAudience} → tono: ${tone}

${userBlock}

BENCHMARK (lo que hacen los que ganan):
${fullContext.nichePatterns || 'Sin benchmark específico para este nicho.'}

TUS DATOS REALES:
- Videos analizados: ${realStats.totalVideos}
- Vistas totales: ${realStats.totalViews}
- Engagement promedio: ${realStats.avgEngagementRate.toFixed(2)}%
- Duración promedio: ${realStats.avgDuration.toFixed(0)}s

REGLAS POR OBJETIVO:
${goalRules}

PROHIBIDO: inventar métricas, usar su histórico como ideal, dar más de 3 recomendaciones.

ESCRIBE ASÍ (natural, no plantilla rígida):

**DIAGNÓSTICO BRUTAL**
[2-3 frases máximo. Compara su KPI vs benchmark. Duele. Si hay evolución, menciónala.]

**1. [Título que prometa dinero o crecimiento]**
Estás fallando en [X] porque [dato]. Eso te cuesta ${goal.revenue ? '~[€]/mes' : '[X]% de alcance'}.
Haz esto 7 días: [acción ultra específica con hora/formato].
Si funciona: verás [métrica] subir en 48h.

**2. [Segundo leak]**
...mismo formato...

**3. [Tercer leak]**
...mismo formato...

Elige 1. Hazla 7 días seguidos.`

      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: `DATOS:\n${JSON.stringify(realStats, null, 2)}` }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 800,
      })
      
      return completion.choices[0]?.message?.content || 'Error generando análisis'
    } catch (error) {
      console.error('DeepSeek API error:', error)
      throw error
    }
  }

  // ============================================
  // 2. predictViral - CON MEMORIA
  // ============================================
  async predictViral(
    ideaData: { videoIdea: string, contentType: string, duration: number, hashtags: string[], sound: string, hasCTA?: boolean },
    fullContext: FullContext,
    realStats: { avgViews: number, avgEngagementRate: number, avgDuration: number, videosOver60s: number, totalVideos: number }
  ): Promise<any> {
    try {
      const goal = goalMatrix[fullContext.contentGoal] || goalMatrix.viral_growth
      const tone = getToneByAudience(fullContext.targetAudience)
      
      const userBlock = fullContext.userContext ? `
MEMORIA DEL CREADOR:
- Bio: ${fullContext.userContext.accountBio}
- Fase: ${fullContext.userContext.currentPhase}
- Dolor principal: ${fullContext.userContext.mainStruggle}
- Última recomendación: ${fullContext.userContext.lastRecommendation || 'ninguna'}
- Evolución: Views ${fullContext.userContext.evolution?.viewsChange || 0}%, Engagement ${fullContext.userContext.evolution?.engagementChange || 0}%

INSTRUCCIÓN: Si evolution es negativa, sé más duro. Si es positiva, felicita pero exige más.
` : ''

      const hasCTA = ideaData.hasCTA || 
        ideaData.videoIdea.toLowerCase().includes('link') || 
        ideaData.videoIdea.toLowerCase().includes('bio') ||
        ideaData.videoIdea.toLowerCase().includes('comentarios') ||
        ideaData.videoIdea.toLowerCase().includes('sígueme')
      
      let viewsRange = "<1k"
      if (realStats.avgViews >= 20000) viewsRange = ">20k"
      else if (realStats.avgViews >= 5000) viewsRange = "5-20k"
      else if (realStats.avgViews >= 1000) viewsRange = "1-5k"
      
      let dineroPotencial = "N/A"
      if (goal.revenue && ideaData.duration >= 65) {
        dineroPotencial = `~${Math.round((realStats.avgViews / 1000) * goal.cpm)}€`
      } else if (goal.revenue && ideaData.duration < 60) {
        dineroPotencial = "0€"
      }
      
      let dynamicRules = ""
      switch (fullContext.contentGoal) {
        case 'monetization':
          dynamicRules = `- Si duración <60s → veredicto="NO LA GRABES", razón="Creator Rewards exige +60s."`
          break
        case 'viral_growth':
          dynamicRules = `- Si duración >30s → veredicto="ARRÉGLALA", razón="Matas el loop viral (ideal 12-21s)."`
          break
        case 'brand_awareness':
          dynamicRules = `- Si no genera shares → veredicto="ARRÉGLALA".`
          break
        case 'lead_generation':
          dynamicRules = `- ${hasCTA ? '✅ Tiene CTA.' : '❌ NO tiene CTA.'} Si no tiene CTA → veredicto="ARRÉGLALA".`
          break
        case 'education':
          dynamicRules = `- Si duración <30s → veredicto="ARRÉGLALA", razón="No da tiempo a enseñar."`
          break
        case 'community_building':
          dynamicRules = `- Si no incluye pregunta → veredicto="ARRÉGLALA".`
          break
        default:
          dynamicRules = `- Alinea con KPI ${goal.kpi}.`
      }

      const systemMessage = `Eres un validador de ideas para TikTok. Di la verdad sin filtro.

CONTEXTO:
- Objetivo: ${fullContext.contentGoal} (KPI: ${goal.kpi})
- Duración ideal: ${goal.duration}
- Audiencia: ${fullContext.targetAudience} → tono: ${tone}

${userBlock}

TU HISTORIAL:
- Vistas promedio: ${Math.round(realStats.avgViews).toLocaleString()}
- Engagement promedio: ${realStats.avgEngagementRate.toFixed(1)}%

IDEA: "${ideaData.videoIdea}" | Duración: ${ideaData.duration}s | Tipo: ${ideaData.contentType}

REGLAS:
${dynamicRules}

OUTPUT - SOLO JSON:
{
  "veredicto": "GRÁBALA YA" | "ARRÉGLALA" | "NO LA GRABES",
  "razon_brutal": "string 1 frase",
  "probabilidad_exito": "XX%",
  "dinero_potencial": "${dineroPotencial}",
  "rango_views_esperado": "${viewsRange}",
  "cambios_obligatorios": ["cambio1", "cambio2", "cambio3"],
  "kpi_a_optimizar": "${goal.kpi}"
}`

      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: `Valida esta idea para ${fullContext.contentGoal}.` }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 600,
        response_format: { type: 'json_object' }
      })
      
      const content = completion.choices[0]?.message?.content
      if (!content) throw new Error('No content returned')
      return JSON.parse(content)
    } catch (error) {
      console.error('DeepSeek prediction error:', error)
      throw error
    }
  }

  // ============================================
  // 3. generateIdeas - CON OBJETOS COMPLETOS
  // ============================================
  async generateIdeas(fullContext: FullContext, realStats: any): Promise<any[]> {
    try {
      const goal = goalMatrix[fullContext.contentGoal] || goalMatrix.viral_growth
      const tone = getToneByAudience(fullContext.targetAudience)
      
      const userBlock = fullContext.userContext ? `
MEMORIA DEL CREADOR:
- Bio: ${fullContext.userContext.accountBio}
- Fase: ${fullContext.userContext.currentPhase}
- Dolor principal: ${fullContext.userContext.mainStruggle}
- Evolución: Views ${fullContext.userContext.evolution?.viewsChange || 0}%

INSTRUCCIÓN: Prioriza ideas que resuelvan el DOLOR PRINCIPAL.
` : ''

      const systemMessage = `Genera 5 ideas de contenido para TikTok que resuelvan el dolor del creador.

CONTEXTO:
- Objetivo: ${fullContext.contentGoal}
- KPI: ${goal.kpi}
- Duración ideal: ${goal.duration}
- Audiencia: ${fullContext.targetAudience} → tono: ${tone}

${userBlock}

BENCHMARK: ${fullContext.nichePatterns || 'Sin benchmark'}

OUTPUT - SOLO JSON:
{
  "ideas": [
    {
      "title": "título corto",
      "hook": "gancho 3s",
      "description": "explicación",
      "duration_suggestion": "12-21s",
      "cta": "llamada a la acción"
    }
  ]
}`

      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: 'Genera 5 ideas.' }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      })
      
      const result = JSON.parse(completion.choices[0]?.message?.content || '{"ideas": []}')
      return result.ideas || []
    } catch (error) {
      console.error('DeepSeek generate ideas error:', error)
      return []
    }
  }
}