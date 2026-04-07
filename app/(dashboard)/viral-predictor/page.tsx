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
  Loader2,
  Target,
  BarChart3,
  Download,
  Save,
  Eye,
  Heart,
  Share2,
  Users,
  Activity,
  Shield,
  Award
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
  benchmark?: {
    avg_views: number
    avg_engagement: number
    percentile: number
  }
  confidence_interval?: {
    lower: number
    upper: number
  }
}

const campaignGoals = [
  { value: 'awareness', label: 'Brand Awareness', icon: Eye, description: 'Maximizar alcance y vistas' },
  { value: 'engagement', label: 'Engagement', icon: Heart, description: 'Fomentar interacciones (likes, comments, shares)' },
  { value: 'conversion', label: 'Conversion', icon: Target, description: 'Tráfico a sitio web o ventas' },
  { value: 'community', label: 'Community Building', icon: Users, description: 'Crecimiento de seguidores y comunidad' }
]

const contentTypes = [
  { value: 'tutorial', label: 'Tutorial / How-to', icon: '📚' },
  { value: 'entertainment', label: 'Entretenimiento / Humor', icon: '🎬' },
  { value: 'educational', label: 'Educativo / Dato curioso', icon: '💡' },
  { value: 'inspirational', label: 'Inspiracional / Motivacional', icon: '✨' },
  { value: 'challenge', label: 'Challenge / Trend', icon: '🔥' },
  { value: 'review', label: 'Review / Unboxing', icon: '⭐' }
]

export default function ViralPredictorPage() {
  const [videoIdea, setVideoIdea] = useState('')
  const [contentType, setContentType] = useState('tutorial')
  const [campaignGoal, setCampaignGoal] = useState('engagement')
  const [duration, setDuration] = useState(15)
  const [hashtags, setHashtags] = useState('')
  const [sound, setSound] = useState('')
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedIdeas, setSavedIdeas] = useState<any[]>([])
  
  const supabase = createClient()

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getViralScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getViralScoreLabel = (score: number) => {
    if (score >= 80) return 'Alto Potencial Viral'
    if (score >= 60) return 'Buen Potencial'
    if (score >= 40) return 'Potencial Moderado'
    return 'Bajo Potencial'
  }

  const getViralScoreDescription = (score: number) => {
    if (score >= 80) return 'Este contenido tiene características similares a videos virales en tu nicho. Recomendamos priorizar su producción.'
    if (score >= 60) return 'Contenido sólido con buen potencial. Pequeñas optimizaciones pueden aumentar su rendimiento.'
    if (score >= 40) return 'Potencial medio. Considera ajustar el enfoque o el formato para mejorar las proyecciones.'
    return 'El potencial es limitado. Te sugerimos revisar el concepto o probar un enfoque diferente.'
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
          contentType,
          campaignGoal,
          duration,
          hashtags: hashtags.split(',').map(h => h.trim().replace('#', '')).filter(h => h),
          sound: sound || 'Original'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPrediction(data.prediction)
      } else {
        setError(data.error || 'No se pudo generar la predicción')
      }
      
    } catch (err) {
      setError('Error de red. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    if (!prediction) return
    
    const report = `
CONTENT VIRALITY REPORT
Generated: ${new Date().toLocaleString()}

IDEA ANALYSIS
-------------------
Content Idea: ${videoIdea}
Content Type: ${contentTypes.find(c => c.value === contentType)?.label}
Campaign Goal: ${campaignGoals.find(g => g.value === campaignGoal)?.label}
Duration: ${duration}s

PREDICTIONS
-------------------
Viral Score: ${prediction.viral_score}/100
Predicted Views: ${formatNumber(prediction.predicted_views)}
Predicted Engagement: ${prediction.predicted_engagement}%
Optimal Posting: ${prediction.optimal_day} at ${prediction.optimal_hour}:00
Confidence: ${prediction.confidence_score}%

AI ANALYSIS
-------------------
${prediction.reasoning}

RECOMMENDATIONS
-------------------
${prediction.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---
Content Intelligence Engine - Professional Analytics Suite
    `
    
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `virality_report_${new Date().toISOString().slice(0, 19)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSaveIdea = async () => {
    if (!prediction) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { error: saveError } = await supabase
      .from('predictions')
      .update({ status: 'saved' })
      .eq('id', prediction.id)
    
    if (!saveError) {
      alert('Idea guardada en tu biblioteca')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Viral Predictor</h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">BETA</span>
              </div>
              <p className="text-gray-500 ml-11">
                Predicción de rendimiento basada en IA para optimizar tu estrategia de contenido
              </p>
            </div>
            {prediction && (
              <div className="flex gap-3">
                <button
                  onClick={handleExportReport}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar informe
                </button>
                <button
                  onClick={handleSaveIdea}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar idea
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Formulario */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-900">Configuración del contenido</h2>
              <p className="text-sm text-gray-500 mt-0.5">Completa los detalles para obtener una predicción precisa</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Idea del video */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concepto del contenido *
                </label>
                <textarea
                  value={videoIdea}
                  onChange={(e) => setVideoIdea(e.target.value)}
                  required
                  rows={3}
                  placeholder="Ej: Tutorial sobre cómo identificar unfollowers en Instagram sin usar apps de terceros, destacando los riesgos de privacidad..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Incluye el ángulo principal, el gancho y el valor para la audiencia
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Tipo de contenido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de contenido
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {contentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Objetivo de campaña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivo principal
                  </label>
                  <select
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {campaignGoals.map(goal => (
                      <option key={goal.value} value={goal.value}>
                        {goal.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Duración */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Duración</label>
                  <span className="text-sm text-gray-500">{duration} segundos</span>
                </div>
                <input
                  type="range"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min={5}
                  max={60}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Óptimo: 11-15s</span>
                  <span>Máx recomendado: 30s</span>
                </div>
              </div>
              
              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hashtags estratégicos
                </label>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="tutorial, instagramtips, privacidad, seguridaddigital"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Recomendado: 3-5 hashtags específicos de tu nicho
                </p>
              </div>
              
              {/* Sonido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audio / Música
                </label>
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={sound}
                    onChange={(e) => setSound(e.target.value)}
                    placeholder="Original Sound o nombre de tendencia"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Los sonidos en tendencia pueden aumentar el alcance hasta un 40%
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading || !videoIdea}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Predecir rendimiento
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Resultados */}
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Error en el análisis</span>
                </div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {prediction && (
              <div className="space-y-5">
                {/* Viral Score Card */}
                <div className={`rounded-xl border p-6 ${getViralScoreColor(prediction.viral_score)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      <span className="text-sm font-medium">Viral Score</span>
                    </div>
                    <span className="text-xs opacity-70">Basado en análisis de {prediction.confidence_score}% confianza</span>
                  </div>
                  <div className="text-center">
                    <span className="text-7xl font-bold">{prediction.viral_score}</span>
                    <span className="text-2xl opacity-70">/100</span>
                    <p className="text-base font-medium mt-2">{getViralScoreLabel(prediction.viral_score)}</p>
                    <p className="text-sm opacity-80 mt-3 max-w-md mx-auto">
                      {getViralScoreDescription(prediction.viral_score)}
                    </p>
                  </div>
                </div>
                
                {/* Predicciones clave */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">Proyecciones de rendimiento</h3>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-4 mb-5">
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Vistas estimadas</p>
                        <p className="text-xl font-bold text-gray-900">{formatNumber(prediction.predicted_views)}</p>
                        {prediction.confidence_interval && (
                          <p className="text-xs text-gray-400 mt-1">
                            ±{formatNumber(Math.round((prediction.confidence_interval.upper - prediction.confidence_interval.lower) / 2))}
                          </p>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Engagement rate</p>
                        <p className="text-xl font-bold text-gray-900">{prediction.predicted_engagement}%</p>
                        {prediction.benchmark && (
                          <p className="text-xs text-gray-400 mt-1">
                            vs benchmark {prediction.benchmark.avg_engagement}%
                          </p>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">Momento óptimo</p>
                        <p className="text-sm font-semibold text-gray-900">{prediction.optimal_day}</p>
                        <p className="text-sm text-gray-600">{prediction.optimal_hour}:00 hs</p>
                      </div>
                    </div>
                    
                    {prediction.benchmark && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Benchmark del nicho</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">Promedio del nicho</p>
                            <p className="text-sm font-semibold text-gray-900">{formatNumber(prediction.benchmark.avg_views)} vistas</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Tu posición</p>
                            <p className="text-sm font-semibold text-gray-900">Percentil {prediction.benchmark.percentile}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Reasoning */}
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Análisis de IA</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{prediction.reasoning}</p>
                    </div>
                  </div>
                </div>
                
                {/* Recomendaciones */}
                {prediction.recommendations && prediction.recommendations.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">Recomendaciones estratégicas</h3>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-3">
                        {prediction.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!prediction && !error && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-500 font-medium">Sin análisis generado</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                  Completa el formulario con los detalles de tu contenido para obtener una predicción basada en IA
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}