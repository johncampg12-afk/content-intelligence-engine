'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Zap, 
  Clock, 
  Hash, 
  Music, 
  TrendingUp, 
  Sparkles,
  AlertCircle,
  Loader2,
  Target,
  Download,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Info
} from 'lucide-react'

interface Prediction {
  id: string
  video_idea: string
  content_type: string
  campaign_goal: string
  duration: number
  hashtags: string[]
  sound: string
  viral_score: number
  confidence_score: number
  reasoning: string
  recommendations: string[]
  created_at: string
  status: string
  veredicto?: string
  razon_brutal?: string
  probabilidad_exito?: string
  dinero_potencial?: string
  rango_views_esperado?: string
  kpi_a_optimizar?: string
  cambios_obligatorios?: string[]
}

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
  const [duration, setDuration] = useState(15)
  const [hashtags, setHashtags] = useState('')
  const [sound, setSound] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [prediction, setPrediction] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Prediction[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showHistory, setShowHistory] = useState(true)
  const [userProfile, setUserProfile] = useState<{
    content_goal: string
    target_audience: string
    account_type: string
  } | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadUserProfile()
    loadHistory()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoadingProfile(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Obtener perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('content_goal, target_audience, account_type_id')
        .eq('id', user.id)
        .single()
      
      // Obtener nombre del tipo de cuenta
      let accountTypeName = 'No especificado'
      if (profile?.account_type_id) {
        const { data: accountType } = await supabase
          .from('account_types')
          .select('name')
          .eq('id', profile.account_type_id)
          .single()
        if (accountType) {
          accountTypeName = accountType.name
        }
      }
      
      setUserProfile({
        content_goal: profile?.content_goal || 'viral_growth',
        target_audience: profile?.target_audience || 'general',
        account_type: accountTypeName
      })
      
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

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
    if (!confirm('¿Eliminar esta validación del historial?')) return
    
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

  const getVeredictoConfig = (veredicto: string) => {
    switch (veredicto) {
      case 'GRÁBALA YA':
        return { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-600', textColor: 'text-green-800' }
      case 'ARRÉGLALA':
        return { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600', textColor: 'text-amber-800' }
      default:
        return { bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, iconColor: 'text-red-600', textColor: 'text-red-800' }
    }
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
        setError(data.error || 'No se pudo validar la idea')
      }
      
    } catch (err) {
      setError('Error de red. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = (pred: any) => {
    const contentTypeLabel = contentTypes.find(c => c.value === pred.content_type)?.label || pred.content_type || 'No especificado'
    
    const report = `
CONTENT VALIDATION REPORT
Generated: ${new Date().toLocaleString()}

USER PROFILE
-------------------
Objective: ${userProfile?.content_goal || 'No especificado'}
Target Audience: ${userProfile?.target_audience || 'No especificada'}
Content Niche: ${userProfile?.account_type || 'No especificado'}

IDEA ANALYSIS
-------------------
Content Idea: ${pred.video_idea || 'No especificada'}
Content Type: ${contentTypeLabel}
Duration: ${pred.duration || 'No especificada'}s
Hashtags: ${pred.hashtags?.join(', ') || 'Ninguno'}
Sound: ${pred.sound || 'Original'}

VALIDATION RESULT
-------------------
Veredicto: ${pred.veredicto || 'N/A'}
Razón: ${pred.razon_brutal || 'No disponible'}
Probabilidad de éxito: ${pred.probabilidad_exito || 'N/A'}
Rango de vistas esperado: ${pred.rango_views_esperado || 'N/A'}
${pred.dinero_potencial && pred.dinero_potencial !== 'N/A' ? `Potencial económico: ${pred.dinero_potencial}` : ''}

KPI A OPTIMIZAR
-------------------
${pred.kpi_a_optimizar || 'No especificado'}

CAMBIOS OBLIGATORIOS
-------------------
${pred.cambios_obligatorios?.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n') || 'No hay cambios obligatorios'}

---
Content Intelligence Engine - Professional Analytics Suite
    `
    
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `validation_report_${new Date().toISOString().slice(0, 19)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando tu perfil...</p>
        </div>
      </div>
    )
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
                <h1 className="text-2xl font-bold text-gray-900">Idea Validator</h1>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">PRO</span>
              </div>
              <p className="text-gray-500 ml-11">
                Valida tus ideas de contenido antes de grabarlas. Basado en tu objetivo y datos reales.
              </p>
            </div>
          </div>
        </div>

        {/* Perfil del usuario (info contextual) */}
        {userProfile && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tu configuración actual</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Objetivo:</span>
                <span className="font-medium text-gray-900">{userProfile.content_goal}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Audiencia:</span>
                <span className="font-medium text-gray-900">{userProfile.target_audience}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Nicho:</span>
                <span className="font-medium text-gray-900">{userProfile.account_type}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Puedes cambiar estos valores en Configuración
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Formulario simplificado */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">Describe tu idea</h2>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">La IA validará si funciona para tu objetivo</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Qué vas a grabar? *
                </label>
                <textarea
                  value={videoIdea}
                  onChange={(e) => setVideoIdea(e.target.value)}
                  required
                  rows={3}
                  placeholder="Ej: Tutorial sobre cómo identificar unfollowers en Instagram sin usar apps de terceros..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Sé específico: incluye el ángulo principal y el gancho</p>
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
                  <div className="flex justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">Duración</label>
                    <span className="text-sm text-gray-500">{duration}s</span>
                  </div>
                  <input
                    type="range"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    min={5}
                    max={90}
                    className="w-full"
                  />
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
                    Validando idea...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Validar idea
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
                {/* Veredicto Card */}
                <div className={`rounded-xl border p-5 ${getVeredictoConfig(prediction.veredicto).bg} ${getVeredictoConfig(prediction.veredicto).border}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {(() => {
                      const Icon = getVeredictoConfig(prediction.veredicto).icon
                      return <Icon className={`w-6 h-6 ${getVeredictoConfig(prediction.veredicto).iconColor}`} />
                    })()}
                    <span className={`text-sm font-semibold ${getVeredictoConfig(prediction.veredicto).textColor}`}>
                      {prediction.veredicto}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {prediction.probabilidad_exito} de éxito
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {prediction.razon_brutal}
                  </p>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Rango de vistas</p>
                      <p className="text-lg font-bold text-gray-900">{prediction.rango_views_esperado}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">KPI a optimizar</p>
                      <p className="text-sm font-semibold text-gray-900">{prediction.kpi_a_optimizar}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Viral Score</p>
                      <p className="text-lg font-bold text-gray-900">{prediction.viral_score}</p>
                    </div>
                  </div>
                  
                  {prediction.dinero_potencial && prediction.dinero_potencial !== 'N/A' && (
                    <div className="bg-green-50 rounded-lg p-3 mb-4 text-center border border-green-200">
                      <p className="text-sm text-green-800 font-medium">
                        💰 Potencial de ingresos: {prediction.dinero_potencial}
                      </p>
                    </div>
                  )}
                  
                  {prediction.cambios_obligatorios && prediction.cambios_obligatorios.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-700 mb-3">✏️ Cambios necesarios:</p>
                      <ul className="space-y-2">
                        {prediction.cambios_obligatorios.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-amber-500 font-bold min-w-[20px]">{idx + 1}.</span>
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
                <h3 className="text-gray-500 font-medium">Sin validación generada</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Completa el formulario para validar tu idea con IA
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Historial de validaciones */}
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
                <h3 className="text-base font-semibold text-gray-900">Historial de validaciones</h3>
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
                  No hay validaciones guardadas aún. Valida tu primera idea arriba.
                </div>
              ) : (
                history.map((item) => {
                  const veredictoConfig = getVeredictoConfig(item.veredicto || 'NO LA GRABES')
                  const VeredictoIcon = veredictoConfig.icon
                  
                  return (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleExpand(item.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${veredictoConfig.bg} ${veredictoConfig.textColor}`}>
                              <VeredictoIcon className="w-3 h-3" />
                              {item.veredicto || 'Validado'}
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
                            <span>Score: {item.viral_score}</span>
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
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                              <p className="text-xs text-gray-400">Probabilidad de éxito</p>
                              <p className="text-base font-bold text-gray-900">{item.probabilidad_exito || 'N/A'}</p>
                            </div>
                            <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                              <p className="text-xs text-gray-400">Rango de vistas</p>
                              <p className="text-base font-bold text-gray-900">{item.rango_views_esperado || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 leading-relaxed mb-4">
                            {item.razon_brutal || item.reasoning}
                          </p>
                          
                          {item.cambios_obligatorios && item.cambios_obligatorios.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Cambios necesarios:</p>
                              <ul className="space-y-2">
                                {item.cambios_obligatorios.map((rec: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="text-amber-500 font-bold min-w-[20px]">{idx + 1}.</span>
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
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}