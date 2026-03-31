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
            Debes proporcionar un análisis completo, detallado y profesional.
            NO uses hashtags, ni emojis, ni formato markdown excesivo.
            Usa un lenguaje corporativo y estructurado.
            La respuesta debe ser completa y no cortarse.`
          },
          {
            role: 'user',
            content: `Analiza en profundidad estos datos de videos de TikTok y genera un informe ejecutivo con:

            1. KPIs principales (vistas totales, engagement promedio, etc.)
            2. Análisis de tendencias temporales (mejores días y horas)
            3. Análisis de formato (duración óptima)
            4. Patrones de contenido exitoso
            5. Recomendaciones estratégicas para aumentar engagement
            6. Proyecciones y oportunidades de mejora

            Datos: ${JSON.stringify(metricsData, null, 2)}
            
            IMPORTANTE: El análisis debe ser COMPLETO y EXTENSO. No cortes la respuesta.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000, // Aumentado a 4000 tokens
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