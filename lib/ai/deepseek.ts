import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

  // ============================================
  // calculateRealStats mejorado con protección division by zero
  // ============================================
  private calculateRealStats(metricsData: any[]) {
    const totalVideos = metricsData.length
    
    // Si no hay videos, retornar stats vacíos
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
    
    // Métricas base
    const totalViews = metricsData.reduce((sum, v) => sum + (v.metrics?.views || 0), 0)
    const totalLikes = metricsData.reduce((sum, v) => sum + (v.metrics?.likes || 0), 0)
    const totalComments = metricsData.reduce((sum, v) => sum + (v.metrics?.comments || 0), 0)
    const totalShares = metricsData.reduce((sum, v) => sum + (v.metrics?.shares || 0), 0)
    const totalSaves = metricsData.reduce((sum, v) => sum + (v.metrics?.saves || 0), 0)
    const totalWatchTime = metricsData.reduce((sum, v) => sum + (v.metrics?.watch_time || 0), 0)
    
    // FIX 2: Protección division by zero en avgDuration
    const avgDuration = totalVideos > 0 
      ? metricsData.reduce((sum, v) => sum + (v.duration || 0), 0) / totalVideos 
      : 0
    
    const totalEngagement = totalLikes + totalComments + totalShares
    const avgViews = totalVideos > 0 ? totalViews / totalVideos : 0
    const avgEngagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0
    const avgSavesRate = totalViews > 0 ? (totalSaves / totalViews) * 100 : 0
    const avgWatchTime = totalVideos > 0 ? totalWatchTime / totalVideos : 0
    
    // Videos largos para monetización
    const videosOver60s = metricsData.filter(v => (v.duration || 0) >= 60).length
    
    // Mejor video por engagement total
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
  
  // ============================================
  // MÉTODO PRINCIPAL CON PROMPT BRUTAL
  // ============================================
  async analyzePatternsWithNiche(metricsData: any, nicheContext: {
    accountType: string,
    contentGoal: string,
    targetAudience: string,
    nichePatterns: string
  }): Promise<string> {
    try {
      const currentTrends = await this.getCurrentTikTokTrends()
      const realStats = this.calculateRealStats(metricsData)
      
      // Si no hay datos suficientes
      if (realStats.totalVideos === 0) {
        return `**DIAGNÓSTICO BRUTAL**\n\nNo hay suficientes datos para analizar. Sincroniza al menos 5 videos para obtener recomendaciones precisas.\n\n**RECOMENDACIÓN 1 - LA QUE MÁS DINERO DA**\nDolor: No hay datos.\nPérdida: 0€\nHaz esto 7 días: Conecta tu TikTok y sincroniza al menos 5 videos.\nSi funciona verás: Análisis completo en 48h.\n\nElige 1 y hazla. Si haces las 3 a la vez, no harás ninguna.`
      }
      
      const isMonetization = nicheContext.contentGoal.toLowerCase().includes('monet')
      const benchmark = typeof nicheContext.nichePatterns === 'string' 
        ? nicheContext.nichePatterns 
        : JSON.stringify(nicheContext.nichePatterns, null, 2)
      const cpm = nicheContext.accountType?.toLowerCase().includes('tech') ? '3€' : '4€'

      const systemMessage = `Eres Head of Growth de CreatorOS. Tu trabajo es decir verdades que duelen y que hacen ganar dinero.

CONTEXTO:
Nicho: ${nicheContext.accountType}
Objetivo: ${nicheContext.contentGoal}
Audiencia: ${nicheContext.targetAudience}

BENCHMARK (cuentas que facturan):
${benchmark || 'No hay benchmark disponible para este nicho.'}

ESTADO ACTUAL ALGORITMO TIKTOK 2026:
${currentTrends}

DATOS USUARIO:
${JSON.stringify({...realStats, isMonetization}, null, 2)}

REGLAS ESTRICTAS:
1. NUNCA uses su histórico como ideal. Solo benchmark.
2. ${isMonetization ? 'OBJETIVO MONETIZACIÓN ACTIVO: todo video <60s = 0€. Usa CPM ' + cpm + '/1k views calificadas (>60s). Para calcular pérdida: (views_mensuales_<60s / 1000) * CPM.' : 'Si monetización no es objetivo, enfócate en engagement y shares.'}
3. Máximo 3 recomendaciones. Cada una debe caber en 3 frases.
4. Habla en €, no en %. Usa la fórmula de pérdida proporcionada.
5. Sé brutalmente honesto. Si los datos son malos, dilo.

OUTPUT - FORMATO EXACTO:

**DIAGNÓSTICO BRUTAL (1 párrafo)**
[Qué hace mal vs quien gana dinero, con sus números]

**RECOMENDACIÓN 1 - LA QUE MÁS DINERO DA**
Dolor: [frase con su dato vs benchmark]
Pérdida: Estás dejando ~[€X]/mes en la mesa por esto.
Haz esto 7 días: [acción ultra concreta, con hora y formato]
Si funciona verás: [métrica clara en 48h]

**RECOMENDACIÓN 2 - LA QUE TE HACE CRECER**
Dolor: [segundo leak]
Pérdida: [€ o views perdidos]
Haz esto 7 días: [acción]
Si funciona verás: [señal]

**RECOMENDACIÓN 3 - LA QUE TE PROTEGE**
Dolor: [tercer leak, normalmente consistencia o hook]
Pérdida: [riesgo]
Haz esto 7 días: [acción]
Si funciona verás: [señal]

Elige 1 y hazla. Si haces las 3 a la vez, no harás ninguna.`

      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            // FIX 1: No enviar los 43 videos enteros
            content: `Genera el diagnóstico. Ya tienes todos los números en DATOS USUARIO. No necesitas los vídeos individuales.`
          }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1500,
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
  // MÉTODO: Predicción de viralidad
  // ============================================
  async predictViral(prompt: string): Promise<any> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Eres un analista de datos experto en predicción de viralidad en TikTok en 2026.
          
          IMPORTANTE: Las recomendaciones deben ser PRÁCTICAS y ACCIONABLES, basadas en patrones reales del nicho del usuario.
          
          Debes responder SOLO con JSON válido, sin texto adicional fuera del JSON.
          Sé conservador en las predicciones, no sobreestimes.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      top_p: 0.9,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })
    
    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned')
    }
    
    return JSON.parse(content)
    
  } catch (error) {
    console.error('DeepSeek prediction error:', error)
    throw error
  }
  }
}