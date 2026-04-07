'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Zap, 
  Calendar, 
  Clock, 
  Hash, 
  Music, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface PredictionResult {
  id: string
  predicted_views: number
  predicted_engagement: number
  viral_score: number
  optimal_day: string
  optimal_hour: number
  confidence_score: number
  reasoning: string
  recommendations: string[]
}

export default function ViralPredictorPage() {
  const [videoIdea, setVideoIdea] = useState('')
  const [duration, setDuration] = useState(15)
  const [hashtags, setHashtags] = useState('')
  const [sound, setSound] = useState('')
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getViralScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getViralScoreLabel = (score: number) => {
    if (score >= 80) return '🔥 Alto potencial viral'
    if (score >= 60) return '📈 Buen potencial'
    if (score >= 40) return '📊 Potencial moderado'
    return '📉 Bajo potencial'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPrediction(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please login first')
        return
      }
      
      const response = await fetch('/api/predict/viral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoIdea,
          duration,
          hashtags: hashtags.split(',').map(h => h.trim().replace('#', '')),
          sound: sound || 'Original'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPrediction(data.prediction)
      } else {
        setError(data.error || 'Prediction failed')
      }
      
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Viral Predictor</h1>
          </div>
          <p className="text-gray-500 ml-11">
            Describe tu idea de contenido y la IA predecirá su potencial viral
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Formulario */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Describe tu contenido</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idea del video *
                </label>
                <textarea
                  value={videoIdea}
                  onChange={(e) => setVideoIdea(e.target.value)}
                  required
                  rows={3}
                  placeholder="Ej: Tutorial sobre cómo crecer en Instagram sin usar apps peligrosas..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Sé específico: incluye el tema, el gancho y el llamado a la acción
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (segundos)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    min={5}
                    max={60}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 w-16">
                    {duration}s
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Corto (5s)</span>
                  <span>Óptimo (11-15s)</span>
                  <span>Largo (60s)</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hashtags (separados por comas)
                </label>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="tutorial, instagram, tips, viral"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sonido / Música
                </label>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={sound}
                    onChange={(e) => setSound(e.target.value)}
                    placeholder="Original Sound o nombre de la canción"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !videoIdea}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Predecir viralidad
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Resultados */}
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}
            
            {prediction && (
              <div className="space-y-4">
                {/* Viral Score Card */}
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm opacity-90">Viral Score</span>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <span className="text-6xl font-bold">{prediction.viral_score}</span>
                    <span className="text-2xl opacity-80">/100</span>
                    <p className="text-sm mt-2 opacity-90">{getViralScoreLabel(prediction.viral_score)}</p>
                  </div>
                </div>
                
                {/* Predicciones */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Predicciones</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Vistas estimadas</p>
                      <p className="text-xl font-bold text-gray-900">{formatNumber(prediction.predicted_views)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Engagement estimado</p>
                      <p className="text-xl font-bold text-gray-900">{prediction.predicted_engagement}%</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{prediction.optimal_day}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{prediction.optimal_hour}:00 hs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{prediction.confidence_score}% confianza</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reasoning */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Análisis IA</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{prediction.reasoning}</p>
                </div>
                
                {/* Recommendations */}
                {prediction.recommendations && prediction.recommendations.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-800 mb-3">Recomendaciones</h3>
                    <ul className="space-y-2">
                      {prediction.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-blue-700">
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Agendar publicación
                  </button>
                  <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Guardar idea
                  </button>
                </div>
              </div>
            )}
            
            {!prediction && !error && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-500 font-medium">Sin predicciones aún</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Completa el formulario para obtener un análisis predictivo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}