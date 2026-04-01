import OpenAI from 'openai'

export class DeepSeekAI {
  private client: OpenAI
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    })
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
}