import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Goal Matrix profesional
const goalMatrix: Record<string, any> = {
  monetization: { 
    kpi: 'watch_time', 
    revenue: true, 
    duration: '65-90s', 
    cpm: 3
  },
  brand_awareness: { 
    kpi: 'reach y shares', 
    revenue: false, 
    duration: '15-30s'
  },
  community_building: { 
    kpi: 'comments y saves', 
    revenue: false, 
    duration: '30-60s'
  },
  viral_growth: { 
    kpi: 'views_3h y completion', 
    revenue: false, 
    duration: '12-21s'
  },
  lead_generation: { 
    kpi: 'CTR y saves', 
    revenue: false, 
    duration: '30-45s'
  },
  education: { 
    kpi: 'saves y watch_time', 
    revenue: false, 
    duration: '45-75s'
  },
  entertainment: { 
    kpi: 'shares y replays', 
    revenue: false, 
    duration: '15-30s'
  },
  influence: { 
    kpi: 'comments_quality', 
    revenue: false, 
    duration: '60-90s'
  },
  conversion: { 
    kpi: 'clicks y purchases', 
    revenue: true, 
    duration: '30-45s', 
    cpm: 5
  }
}

// Mapa de tonos según audiencia
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
              } catch {}
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
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalSaves: 0,
        totalEngagement: 0,
        avgViews: 0,
        avgEngagementRate: 0,
        avgSavesRate: 0,
        avgWatchTime: 0,
        avgDuration: 0,
        videosOver60s: 0,
        bestVideo: null
      }
    }
    
    const totalViews = metricsData.reduce((sum, v) => sum + (v.metrics?.views || 0), 0)
    const totalLikes = metricsData.reduce((sum, v) => sum + (v.metrics?.likes || 0), 0)
    const totalComments = metricsData.reduce((sum, v) => sum + (v.metrics?.comments || 0), 0)
    const totalShares = metricsData.reduce((sum, v) => sum + (v.metrics?.shares || 0), 0)
    const totalSaves = metricsData.reduce((sum, v) => sum + (v.metrics?.saves || 0), 0)
    const totalWatchTime = metricsData.reduce((sum, v) => sum + (v.metrics?.watch_time || 0), 0)
    
    const avgDuration = totalVideos > 0 
      ? metricsData.reduce((sum, v) => sum + (v.duration || 0), 0) / totalVideos 
      : 0
    
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
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
      totalEngagement,
      avgViews,
      avgEngagementRate,
      avgSavesRate,
      avgWatchTime,
      avgDuration,
      videosOver60s,
      bestVideo: bestVideo ? {
        title: bestVideo.title,
        published_at: bestVideo.published_at,
        views: bestVideo.metrics?.views || 0,
        likes: bestVideo.metrics?.likes || 0,
        comments: bestVideo.metrics?.comments || 0,
        shares: bestVideo.metrics?.shares || 0,
        saves: bestVideo.metrics?.saves || 0,
        engagement: maxEngagement,
        duration: bestVideo.duration,
        engagement_rate: ((maxEngagement / (bestVideo.metrics?.views || 1)) * 100).toFixed(2)
      } : null
    }
  }
  
  async analyzePatternsWithNiche(metricsData: any, nicheContext: {
    accountType: string,
    contentGoal: string,
    targetAudience: string,
    nichePatterns: string
  }): Promise<string> {
    try {
      const currentTrends = await this.getCurrentTikTokTrends()
      const realStats = this.calculateRealStats(metricsData)
      
      const goal = goalMatrix[nicheContext.contentGoal] || goalMatrix.viral_growth
      const tone = getToneByAudience(nicheContext.targetAudience)

      if (realStats.totalVideos === 0) {
        return `**DIAGNÓSTICO BRUTAL**\n\nNo hay suficientes datos para analizar. Sincroniza al menos 5 videos para obtener recomendaciones precisas.\n\n**RECOMENDACIÓN 1 - LA QUE MÁS DINERO DA**\nDolor: No hay datos.\nPérdida: 0€\nHaz esto 7 días: Conecta tu TikTok y sincroniza al menos 5 videos.\nSi funciona verás: Análisis completo en 48h.\n\nElige 1 y hazla. Si haces las 3 a la vez, no harás ninguna.`
      }

      let goalRules = ''
      switch (nicheContext.contentGoal) {
        case 'monetization':
          goalRules = `→ Si haces <60s, ganas 0€ de Creator Rewards. Calcula: (views/1000)*3€ perdidos.`
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
          goalRules = `→ Alinea todo con el objetivo: ${nicheContext.contentGoal}`
      }

      const systemMessage = `Eres Head of Growth de Content Intelligence Engine. Tu único trabajo es decirle al creador por qué no está ganando dinero o creciendo, usando SUS datos contra el BENCHMARK de su nicho.

CONTEXTO:
- Objetivo: ${nicheContext.contentGoal} (KPI: ${goal.kpi})
- Duración ideal para este objetivo: ${goal.duration}
- ¿Calculamos €? ${goal.revenue ? 'Sí, usa CPM ' + goal.cpm + '€' : 'No, habla de oportunidad perdida'}
- Audiencia: ${nicheContext.targetAudience} → tono: ${tone}

BENCHMARK (lo que hacen los que ganan):
${nicheContext.nichePatterns || 'Sin benchmark específico para este nicho.'}

TUS DATOS REALES:
- Videos analizados: ${realStats.totalVideos}
- Vistas totales: ${realStats.totalViews}
- Engagement promedio: ${realStats.avgEngagementRate.toFixed(2)}%
- Duración promedio: ${realStats.avgDuration.toFixed(0)}s
- Mejor video: "${realStats.bestVideo?.title}" con ${realStats.bestVideo?.engagement_rate}% engagement

REGLAS POR OBJETIVO:
${goalRules}

PROHIBIDO: inventar métricas, usar su histórico como ideal, dar más de 3 recomendaciones.

ESCRIBE ASÍ (natural, no plantilla rígida):

**DIAGNÓSTICO BRUTAL**
[2-3 frases máximo. Compara su KPI vs benchmark. Duele.]

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
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: `Analiza estos videos y dame el diagnóstico brutal.
            
DATOS:
${JSON.stringify(realStats, null, 2)}`
          }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 800,
      })
      
      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content returned from DeepSeek')
      }
      
      return content
      
    } catch (error) {
      console.error('DeepSeek API error:', error)
      throw error
    }
  }

  // ============================================
  // VALIDADOR DE IDEAS - VERSIÓN FINAL
  // ============================================
  async predictViral(
    ideaData: { 
      videoIdea: string, 
      contentType: string, 
      duration: number, 
      hashtags: string[], 
      sound: string,
      hasCTA?: boolean 
    }, 
    nicheContext: { 
      accountType: string, 
      contentGoal: string, 
      targetAudience: string, 
      nichePatterns: string 
    },
    realStats: { 
      avgViews: number, 
      avgEngagementRate: number, 
      avgDuration: number, 
      videosOver60s: number, 
      totalVideos: number 
    }
  ): Promise<any> {
    try {
      const goal = goalMatrix[nicheContext.contentGoal] || goalMatrix.viral_growth
      const tone = getToneByAudience(nicheContext.targetAudience)
      
      // FIX 2: Detectar CTA en la idea
      const hasCTA = ideaData.hasCTA || 
        ideaData.videoIdea.toLowerCase().includes('link') || 
        ideaData.videoIdea.toLowerCase().includes('bio') ||
        ideaData.videoIdea.toLowerCase().includes('comentarios') ||
        ideaData.videoIdea.toLowerCase().includes('sígueme')
      
      // Determinar rango de vistas basado en avgViews real
      let viewsRange = "<1k"
      if (realStats.avgViews >= 20000) viewsRange = ">20k"
      else if (realStats.avgViews >= 5000) viewsRange = "5-20k"
      else if (realStats.avgViews >= 1000) viewsRange = "1-5k"
      
      // FIX 1: Calcular dinero potencial SOLO en TS, no en el prompt
      let dineroPotencial = "N/A"
      if (goal.revenue && ideaData.duration >= 65) {
        const estimatedViews = realStats.avgViews
        dineroPotencial = `~${Math.round((estimatedViews / 1000) * goal.cpm)}€`
      } else if (goal.revenue && ideaData.duration < 60) {
        dineroPotencial = "0€"
      }
      
      // Construir reglas dinámicas SIN incluir dineroPotencial en el texto
      let dynamicRules = ""
      switch (nicheContext.contentGoal) {
        case 'monetization':
          dynamicRules = `
- REGLA MONETIZACIÓN: Si duración <60s → veredicto="NO LA GRABES", razón="Creator Rewards exige +60s para pagar."
- Si duración >=65s y la idea es buena → veredicto="GRÁBALA YA"
- Si duración entre 60-64s → veredicto="ARRÉGLALA", razón="Estás en tierra de nadie. Sube a 65s o baja a <60s."`
          break
        case 'viral_growth':
          dynamicRules = `
- REGLA VIRAL: Si duración >30s → veredicto="ARRÉGLALA", razón="Matas el loop viral. Los videos virales en 2026 duran 12-21s."
- Si duración entre 12-21s → veredicto="GRÁBALA YA"
- Si duración <12s → veredicto="ARRÉGLALA", razón="Demasiado corto. No da tiempo a enganchar."`
          break
        case 'brand_awareness':
          dynamicRules = `
- REGLA BRANDING: Evalúa si la idea genera shares. Si no menciona un ángulo compartible → veredicto="ARRÉGLALA", razón="Esto no se va a compartir. Sin shares, no hay brand awareness."
- Si la idea tiene gancho emocional o sorpresa → veredicto="GRÁBALA YA"`
          break
        case 'lead_generation':
          dynamicRules = `
- REGLA LEADS: ${hasCTA ? '✅ Detectamos CTA en tu idea.' : '❌ NO detectamos CTA en tu idea.'}
- Si NO tiene CTA → veredicto="ARRÉGLALA", razón="Sin CTA claro (link en bio, descarga, comentarios), no generas leads."
- Si tiene CTA claro → veredicto="GRÁBALA YA"`
          break
        case 'education':
          dynamicRules = `
- REGLA EDUCATIVO: Si duración <30s → veredicto="ARRÉGLALA", razón="${ideaData.duration}s no da tiempo a enseñar nada útil. Mínimo 45s para educación."
- Si duración entre 45-75s → veredicto="GRÁBALA YA"`
          break
        case 'community_building':
          dynamicRules = `
- REGLA COMUNIDAD: Si la idea NO incluye una pregunta o debate → veredicto="ARRÉGLALA", razón="Esto no genera conversación. Añade '¿Te ha pasado? Cuéntame' o similar."
- Si incluye pregunta abierta → veredicto="GRÁBALA YA"`
          break
        default:
          dynamicRules = `
- REGLA GENERAL: Evalúa si la idea se alinea con el KPI ${goal.kpi}. Si no → veredicto="ARRÉGLALA", si sí → "GRÁBALA YA"`
      }

      const systemMessage = `Eres un validador de ideas para TikTok. Tu trabajo es decirle al creador si su idea funciona para su OBJETIVO específico. No eres un adivino, usas reglas basadas en datos reales.

CONTEXTO DEL USUARIO:
- Objetivo: ${nicheContext.contentGoal}
- KPI a optimizar: ${goal.kpi}
- Duración ideal: ${goal.duration}
- Audiencia: ${nicheContext.targetAudience} → tono: ${tone}
- ¿Genera ingresos directos? ${goal.revenue ? 'SÍ' : 'NO'}

TU HISTORIAL REAL:
- Vistas promedio: ${Math.round(realStats.avgViews).toLocaleString()}
- Engagement promedio: ${realStats.avgEngagementRate.toFixed(1)}%
- Duración promedio: ${realStats.avgDuration.toFixed(0)}s

LA IDEA A VALIDAR:
- Idea: "${ideaData.videoIdea}"
- Duración: ${ideaData.duration}s
- Tipo: ${ideaData.contentType}
- Hashtags: ${ideaData.hashtags?.join(', ') || 'ninguno'}
- Sonido: ${ideaData.sound || 'original'}
- ¿Tiene CTA?: ${hasCTA ? 'Sí' : 'No'}

REGLAS DINÁMICAS (aplica SOLO la que corresponde a su objetivo):
${dynamicRules}

REGLAS ABSOLUTAS:
1. NUNCA predigas vistas exactas. Usa rangos basados en su historial: "${viewsRange}"
2. La probabilidad de éxito se calcula así:
   - Si la idea cumple TODAS las reglas de su objetivo → 65-80%
   - Si cumple algunas pero falla en algo → 40-60%
   - Si falla en las reglas clave → 15-30%
3. Los cambios obligatorios son máximo 3, específicos y accionables.
4. Sé brutalmente honesto. Si la idea no sirve para su objetivo, díselo.

OUTPUT - SOLO JSON, nada más fuera del JSON:

{
  "veredicto": "GRÁBALA YA" | "ARRÉGLALA" | "NO LA GRABES",
  "razon_brutal": "string de 1 frase que duele y usa un dato real",
  "probabilidad_exito": "XX%",
  "dinero_potencial": "${dineroPotencial}",
  "rango_views_esperado": "${viewsRange}",
  "cambios_obligatorios": ["cambio 1", "cambio 2", "cambio 3"],
  "kpi_a_optimizar": "${goal.kpi}"
}`

      // FIX 3: Bajar temperature a 0.2 para consistencia
      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: `Valida esta idea para el objetivo ${nicheContext.contentGoal}. Devuelve SOLO el JSON.`
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 600,
        response_format: { type: 'json_object' }
      })
      
      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content returned from DeepSeek')
      }
      
      return JSON.parse(content)
      
    } catch (error) {
      console.error('DeepSeek prediction error:', error)
      throw error
    }
  }
}