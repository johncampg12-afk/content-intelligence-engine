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

  // Obtener tendencias actuales de TikTok desde la base de datos
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

  // Calcular estadísticas reales a partir de los datos
  private calculateRealStats(metricsData: any[]) {
    const totalVideos = metricsData.length
    const totalViews = metricsData.reduce((sum, v) => sum + (v.metrics?.views || 0), 0)
    const totalLikes = metricsData.reduce((sum, v) => sum + (v.metrics?.likes || 0), 0)
    const totalComments = metricsData.reduce((sum, v) => sum + (v.metrics?.comments || 0), 0)
    const totalShares = metricsData.reduce((sum, v) => sum + (v.metrics?.shares || 0), 0)
    const totalEngagement = totalLikes + totalComments + totalShares
    const avgViews = totalVideos > 0 ? totalViews / totalVideos : 0
    const avgEngagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0
    
    // Encontrar mejor video por engagement total
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
      totalEngagement,
      avgViews,
      avgEngagementRate,
      bestVideo: bestVideo ? {
        title: bestVideo.title,
        published_at: bestVideo.published_at,
        views: bestVideo.metrics?.views || 0,
        likes: bestVideo.metrics?.likes || 0,
        comments: bestVideo.metrics?.comments || 0,
        shares: bestVideo.metrics?.shares || 0,
        engagement: maxEngagement,
        engagement_rate: ((maxEngagement / (bestVideo.metrics?.views || 1)) * 100).toFixed(2)
      } : null
    }
  }
  
  async analyzePatterns(metricsData: any): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Eres un analista de datos senior especializado en social media para empresas.
            
            Debes generar un análisis COMPLETO en formato texto plano con markdown simple.
            La estructura DEBE ser EXACTAMENTE la siguiente:

            1. KPIs PRINCIPALES (Agregados del Período)
            * Total de Publicaciones Analizadas: [número] videos.
            * Vistas Totales Acumuladas: [número] vistas.
            * Promedio de Vistas por Video: [número] vistas.
            * Engagement Total (Likes + Comentarios + Shares): [número] interacciones.
            * Tasa de Engagement Promedio: [número]%
            Nota: La tasa de engagement se calcula como (Total de Interacciones / Total de Vistas) * 100.
            * Desglose Promedio de Interacciones por Video:
              * Likes: [número]
              * Comentarios: [número]
              * Shares: [número]
            * Video de Mayor Rendimiento (ID: [fecha]):
              * Vistas: [número]
              * Engagement: [número] interacciones ([likes] Likes, [comments] Comentarios, [shares] Shares)
              * Tasa de Engagement: [número]%
              * [explicación del por qué destacó]

            2. ANÁLISIS DE TENDENCIAS TEMPORALES
            * Mejor Día de Publicación: [día], [fecha], concentró [número] publicaciones con un desempeño consistentemente superior...
            * Peor Día de Publicación: [día], [fecha], las publicaciones mostraron...
            * Análisis de Horario:
              * Franja de Alto Potencial: [horario]...
              * Franja de Vistas Altas pero Engagement Variable: [horario]...
            * Recomendación Temporal: [recomendación específica]

            3. ANÁLISIS DE FORMATO (DURACIÓN ÓPTIMA)
            * Duración Promedio de los Videos: [número] segundos.
            * Rango de Duración: [mín] y [máx] segundos.
            * Correlación Duración-Rendimiento:
              * [rango de duración]: [análisis]...
            * Conclusión sobre Duración: [conclusión]

            4. PATRONES DE CONTENIDO EXITOSO
            * Título y Enfoque Ganador (Alto Engagement/Shareability):
              * Patrón: [descripción]...
              * Ejemplo: "[título]"
              * Resultado: [resultado]...
            * Título y Enfoque Moderado (Vistas Altas, Engagement Medio):
              * Patrón: [descripción]...
              * Ejemplo: "[título]"
              * Resultado: [resultado]...
            * Título y Enfoque Débil (Bajo Rendimiento):
              * Patrón: [descripción]...
              * Ejemplo: "[título]"
              * Resultado: [resultado]...
            * Consistencia Temática: [análisis de hashtags y nicho]

            5. RECOMENDACIONES ESTRATÉGICAS PARA AUMENTAR ENGAGEMENT
            [Lista numerada de 5-7 recomendaciones con formato: N. [Recomendación]]

            6. PROYECCIONES Y OPORTUNIDADES DE MEJORA
            * Proyección de Crecimiento: [análisis]...
            * Oportunidad de Ampliación Temática: [análisis]...
            * Oportunidad de Comunidad: [análisis]...
            * Riesgo Identificado: [análisis]...
            * Siguiente Fase de Análisis: [análisis]...

            CONCLUSIÓN GENERAL
            [Párrafo conclusivo de 3-4 líneas]

            IMPORTANTE: 
            - Los números y datos deben ser REALES basados en los videos proporcionados.
            - Resalta en NEGRITA (con **) SOLO los números, porcentajes y datos clave.
            - NO uses hashtags, emojis ni formatos extraños.
            - La respuesta debe ser COMPLETA y EXTENSA, con todos los puntos detallados.`
          },
          {
            role: 'user',
            content: `Analiza estos datos de videos de TikTok y genera el análisis con la estructura exacta especificada:
            
            ${JSON.stringify(metricsData, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
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

  // Método con integración de nicho y patrones de éxito
  async analyzePatternsWithNiche(metricsData: any, nicheContext: {
    accountType: string,
    contentGoal: string,
    targetAudience: string,
    nichePatterns: string
  }): Promise<string> {
    try {
      const currentTrends = await this.getCurrentTikTokTrends()
      const realStats = this.calculateRealStats(metricsData)

      const systemMessage = `Eres un analista de datos senior especializado en social media para empresas.

## DATOS DEL USUARIO:
- Tipo de cuenta: ${nicheContext.accountType}
- Objetivo principal: ${nicheContext.contentGoal}
- Audiencia objetivo: ${nicheContext.targetAudience}

## PATRONES DE ÉXITO PARA ESTE NICHO:
${nicheContext.nichePatterns}

## ESTADO ACTUAL DEL ALGORITMO DE TIKTOK:
${currentTrends}

## DATOS REALES DEL USUARIO (ANÁLISIS):
${JSON.stringify(realStats, null, 2)}

IMPORTANTE: 
- Los números y datos que debes usar son EXACTAMENTE los que se te proporcionan en "DATOS REALES". NO inventes ni redondees.
- Compara los datos del usuario con los patrones de éxito de su nicho.
- Genera recomendaciones específicas para que pueda emular esos patrones adaptándolos a su contenido.
- Las recomendaciones deben ser prácticas, accionables y alineadas con su objetivo (${nicheContext.contentGoal}).
- La audiencia objetivo (${nicheContext.targetAudience}) debe influir en el tono y formato de las recomendaciones.

Debes generar un análisis con la siguiente estructura EXACTA (sin modificar títulos ni orden):

1. KPIs PRINCIPALES (Agregados del Período)
* Total de Publicaciones Analizadas: [número] videos.
* Vistas Totales Acumuladas: [número] vistas.
* Promedio de Vistas por Video: [número] vistas.
* Engagement Total (Likes + Comentarios + Shares): [número] interacciones.
* Tasa de Engagement Promedio: [número]%
Nota: La tasa de engagement se calcula como (Total de Interacciones / Total de Vistas) * 100.
* Desglose Promedio de Interacciones por Video:
  * Likes: [número]
  * Comentarios: [número]
  * Shares: [número]
* Video de Mayor Rendimiento (ID: [fecha]):
  * Vistas: [número]
  * Engagement: [número] interacciones ([likes] Likes, [comments] Comentarios, [shares] Shares)
  * Tasa de Engagement: [número]%
  * [explicación breve de por qué destacó]

2. ANÁLISIS DE TENDENCIAS TEMPORALES
* Mejor Día de Publicación: [día], [fecha], [explicación basada en datos]
* Peor Día de Publicación: [día], [fecha], [explicación basada en datos]
* Análisis de Horario:
  * Franja de Alto Potencial: [horario]...
  * Franja de Vistas Altas pero Engagement Variable: [horario]...
* Recomendación Temporal: [recomendación específica]

3. ANÁLISIS DE FORMATO (DURACIÓN ÓPTIMA)
* Duración Promedio de los Videos: [número] segundos.
* Rango de Duración: [mín] a [máx] segundos.
* Correlación Duración-Rendimiento: [análisis comparado con patrón del nicho]
* Conclusión sobre Duración: [conclusión]

4. PATRONES DE CONTENIDO EXITOSO
* Comparativa con Nicho: [cómo se compara tu contenido con los patrones de éxito de tu nicho]
* Título y Enfoque Ganador (Alto Engagement/Shareability):
  * Patrón: [descripción]
  * Ejemplo: "[título]"
  * Resultado: [resultado]
* Título y Enfoque Moderado (Vistas Altas, Engagement Medio):
  * Patrón: [descripción]
  * Ejemplo: "[título]"
  * Resultado: [resultado]
* Título y Enfoque Débil (Bajo Rendimiento):
  * Patrón: [descripción]
  * Ejemplo: "[título]"
  * Resultado: [resultado]
* Consistencia Temática: [análisis]

5. RECOMENDACIONES ESTRATÉGICAS PARA AUMENTAR ENGAGEMENT
(Debe ser una lista numerada continua del 1 al 6 o 7, sin saltos. Basadas en los patrones de éxito de tu nicho)
1. [Recomendación específica alineada con el nicho]
2. [Recomendación específica alineada con el nicho]
3. [Recomendación específica alineada con el nicho]
...

6. PROYECCIONES Y OPORTUNIDADES DE MEJORA
* Proyección de Crecimiento: [análisis basado en comparativa con nicho]
* Oportunidad de Ampliación Temática: [análisis]
* Oportunidad de Comunidad: [análisis]
* Riesgo Identificado: [análisis]
* Siguiente Fase de Análisis: [análisis]

CONCLUSIÓN GENERAL
[Párrafo de 3-4 líneas resumiendo el análisis y las acciones clave]`

      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: `Analiza los siguientes videos y genera el informe con la estructura exacta especificada. Usa los DATOS REALES proporcionados para todos los números.
            
Videos:
${JSON.stringify(metricsData, null, 2)}`
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
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
  // NUEVO MÉTODO: Predicción de viralidad
  // ============================================
  async predictViral(prompt: string): Promise<any> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Eres un analista de datos experto en predicción de viralidad en TikTok.
            Debes responder SOLO con JSON válido, sin texto adicional fuera del JSON.
            Basa tus predicciones en los datos históricos proporcionados.
            Sé conservador en las predicciones, no sobreestimes.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
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