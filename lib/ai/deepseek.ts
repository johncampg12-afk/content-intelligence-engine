import OpenAI from 'openai'

export class DeepSeekAI {
  private client: OpenAI
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    })
  }
  
  async analyzePatterns(metricsData: any) {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en análisis de contenido para redes sociales. 
            Analizas métricas de videos de TikTok y generas insights accionables.
            Debes responder en español con un formato estructurado.`
          },
          {
            role: 'user',
            content: `Analiza estos datos de videos y dime:
            1. Mejor hora para publicar
            2. Mejor día de la semana
            3. Duración óptima de video
            4. Patrones de contenido exitoso
            5. Recomendaciones para mejorar engagement
            
            Datos: ${JSON.stringify(metricsData, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })
      
      return completion.choices[0].message.content
    } catch (error) {
      console.error('DeepSeek API error:', error)
      throw error
    }
  }
  
  async generateRecommendations(videos: any[], patterns: any) {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Eres un estratega de contenido para TikTok. 
            Generas recomendaciones semanales personalizadas basadas en datos reales.
            Debes incluir: tipo de contenido, horario, duración, sonido sugerido, hook, 
            y predicción de rendimiento.`
          },
          {
            role: 'user',
            content: `Basado en estos videos y patrones, genera un plan de contenido para la próxima semana:
            
            Videos recientes: ${JSON.stringify(videos.slice(0, 10), null, 2)}
            Patrones identificados: ${JSON.stringify(patterns, null, 2)}
            
            Formato de respuesta:
            ### Recomendaciones para esta semana
            - [Día] a las [hora]: [tipo de contenido] con [duración] segundos
            - Hook sugerido: "..."
            - Sonido: "..."
            - Predicción: [estimación de views y engagement]`
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      })
      
      return completion.choices[0].message.content
    } catch (error) {
      console.error('DeepSeek API error:', error)
      throw error
    }
  }
}