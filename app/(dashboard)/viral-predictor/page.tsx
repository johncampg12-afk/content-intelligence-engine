'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Zap, 
  Calendar, 
  Clock, 
  Hash, 
  Music, 
  TrendingUp, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Target,
  BarChart3,
  Download,
  Eye,
  Heart,
  Share2,
  Users,
  Award,
  History,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface Prediction {
  id: string
  video_idea: string
  content_type: string
  campaign_goal: string
  duration: number
  hashtags: string[]
  sound: string
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
  created_at: string
  status: string
}

const campaignGoals = [
  { value: 'awareness', label: 'Brand Awareness', icon: Eye, description: 'Maximizar alcance y vistas' },
  { value: 'engagement', label: 'Engagement', icon: Heart, description: 'Fomentar interacciones' },
  { value: 'conversion', label: 'Conversion', icon: Target, description: 'Tráfico a sitio web o ventas' },
  { value: 'community', label: 'Community Building', icon: Users, description: 'Crecimiento de seguidores' }
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
  const [prediction, setPrediction] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Prediction[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showHistory, setShowHistory] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoadingHistory(true)
      const response = await fetch('/api/predict/history')
      const data = await response.json()
      if (data.predictions) {
        setHistory(data.predictions)
      }
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const deletePrediction = async (id: string) => {
    if (!confirm('¿Eliminar esta predicción del historial?')) return
    
    try {
      const response = await fetch(`/api/predict/delete?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        setHistory(history.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getViralScoreColor = (score: number) => {
    if (score >= 80) return 'border-emerald-200 bg-emerald-50'
    if (score >= 60) return 'border-blue-200 bg-blue-50'
    if (score >= 40) return 'border-amber-200 bg-amber-50'
    return 'border-gray-200 bg-gray-50'
  }

  const getViralScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-amber-600'
    return 'text-gray-600'
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
        await loadHistory()
        setVideoIdea('')
        setHashtags('')
        setSound('')
      } else {
        setError(data.error || 'No se pudo generar la predicción')
      }
      
    } catch (err) {
      setError('Error de red. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = (pred: any) => {
    const contentTypeLabel = contentTypes.find(c => c.value === pred.content_type)?.label || pred.content_type || 'No especificado'
    const campaignGoalLabel = campaignGoals.find(g => g.value === pred.campaign_goal)?.label || pred.campaign_goal || 'No especificado'
    
    const report = `
CONTENT VIRALITY REPORT
Generated: ${new Date().toLocaleString()}

IDEA ANALYSIS
-------------------
Content Idea: ${pred.video_idea || 'No especificada'}
Content Type: ${contentTypeLabel}
Campaign Goal: ${campaignGoalLabel}
Duration: ${pred.duration || 'No especificada'}s
Hashtags: ${pred.hashtags?.join(', ') || 'Ninguno'}
Sound: ${pred.sound || 'Original'}

PREDICTIONS
-------------------
Viral Score: ${pred.viral_score || 0}/100
Predicted Views: ${formatNumber(pred.predicted_views || 0)}
Predicted Engagement: ${(pred.predicted_engagement || 0).toFixed(2)}%
Optimal Posting: ${pred.optimal_day || 'No especificado'} at ${pred.optimal_hour || 0}:00
Confidence: ${pred.confidence_score || 0}%

${pred.benchmark ? `
BENCHMARK VS NICHO
-------------------
Promedio del nicho: ${formatNumber(pred.benchmark.avg_views)} vistas
Engagement promedio nicho: ${pred.benchmark.avg_engagement}%
Tu posición: Percentil ${pred.benchmark.percentile}
` : ''}

AI ANALYSIS
-------------------
${pred.reasoning || 'No hay análisis disponible'}

RECOMMENDATIONS
-------------------
${pred.recommendations?.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n') || 'No hay recomendaciones disponibles'}

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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Formulario */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-900">Nueva predicción</h2>
              <p className="text-sm text-gray-500 mt-0.5">Completa los detalles de tu idea</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concepto del contenido *
                </label>
                <textarea
                  value={videoIdea}
                  onChange={(e) => setVideoIdea(e.target.value)}
                  required
                  rows={3}
                  placeholder="Ej: Tutorial sobre cómo identificar unfollowers en Instagram sin usar apps de terceros..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de contenido</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {contentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo principal</label>
                  <select
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {campaignGoals.map(goal => (
                      <option key={goal.value} value={goal.value}>{goal.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="tutorial, instagramtips, privacidad"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Separados por comas, sin #</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sonido / Música</label>
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
          
          {/* Resultado actual */}
          <div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {prediction && (
              <div className="space-y-4">
                <div className={`rounded-xl border p-5 ${getViralScoreColor(prediction.viral_score)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Viral Score</span>
                    <span className="text-xs opacity-70">{prediction.confidence_score}% confianza</span>
                  </div>
                  <div className="text-center">
                    <span className={`text-5xl font-bold ${getViralScoreTextColor(prediction.viral_score)}`}>
                      {prediction.viral_score}
                    </span>
                    <span className="text-xl opacity-70">/100</span>
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                      {prediction.reasoning}
                    </p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Vistas estimadas</p>
                      <p className="text-lg font-bold text-gray-900">{formatNumber(prediction.predicted_views)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Engagement</p>
                      <p className="text-lg font-bold text-gray-900">{prediction.predicted_engagement}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Momento óptimo</p>
                      <p className="text-sm font-semibold text-gray-900">{prediction.optimal_day} {prediction.optimal_hour}:00</p>
                    </div>
                  </div>
                  
                  {prediction.benchmark && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-500 text-center">
                        Benchmark nicho: {formatNumber(prediction.benchmark.avg_views)} vistas · 
                        Engagement {prediction.benchmark.avg_engagement}% · 
                        Percentil {prediction.benchmark.percentile}
                      </p>
                    </div>
                  )}
                  
                  {prediction.recommendations && prediction.recommendations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Recomendaciones estratégicas</p>
                      <ul className="space-y-2">
                        {prediction.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-blue-500 font-bold min-w-[20px]">{idx + 1}.</span>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleExportReport(prediction)}
                    className="w-full mt-5 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar informe completo
                  </button>
                </div>
              </div>
            )}
            
            {!prediction && !error && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-500 font-medium">Sin análisis generado</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Completa el formulario para obtener una predicción basada en IA
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Historial de predicciones */}
        <div className="mt-12">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <History className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-gray-900">Historial de predicciones</h3>
                <p className="text-sm text-gray-500">{history.length} ideas analizadas</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>
          
          {showHistory && (
            <div className="mt-3 space-y-3">
              {loadingHistory ? (
                <div className="text-center py-8 text-gray-400">Cargando historial...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-200">
                  No hay predicciones guardadas aún. Crea tu primera predicción arriba.
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpand(item.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getViralScoreColor(item.viral_score)} ${getViralScoreTextColor(item.viral_score)}`}>
                            Score: {item.viral_score}
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
                          {item.video_idea}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{contentTypes.find(c => c.value === item.content_type)?.label || item.content_type}</span>
                          <span>{item.duration}s</span>
                          <span>{item.hashtags?.length || 0} hashtags</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExportReport(item); }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                          title="Exportar informe"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deletePrediction(item.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedItems.has(item.id) ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {expandedItems.has(item.id) && (
                      <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-gray-50">
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                            <p className="text-xs text-gray-400">Vistas estimadas</p>
                            <p className="text-base font-bold text-gray-900">{formatNumber(item.predicted_views)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                            <p className="text-xs text-gray-400">Engagement</p>
                            <p className="text-base font-bold text-gray-900">{item.predicted_engagement}%</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                            <p className="text-xs text-gray-400">Mejor momento</p>
                            <p className="text-sm font-semibold text-gray-900">{item.optimal_day} {item.optimal_hour}:00</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                          {item.reasoning}
                        </p>
                        
                        {item.recommendations && item.recommendations.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Recomendaciones:</p>
                            <ul className="space-y-2">
                              {item.recommendations.map((rec: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                  <span className="text-blue-500 font-bold min-w-[20px]">{idx + 1}.</span>
                                  <span className="leading-relaxed">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <button
                          onClick={() => handleExportReport(item)}
                          className="w-full py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Exportar informe completo
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}