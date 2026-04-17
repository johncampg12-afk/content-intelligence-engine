'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Lightbulb, 
  Sparkles, 
  Loader2, 
  Clock, 
  Target,
  Calendar,
  Copy,
  Check,
  AlertCircle,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Hash
} from 'lucide-react'

interface Idea {
  title: string
  hook: string
  description: string
  duration_suggestion: string
  cta: string
  hook_template_id?: number
}

interface SavedIdea {
  id: string
  idea_data: Idea
  created_at: string
  status: string
  hook_template_id?: number
}

export default function IdeasPage() {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showHistory, setShowHistory] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadUserProfile()
    loadHistory()
  }, [])

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('content_goal, target_audience, current_phase, main_struggle')
        .eq('id', user.id)
        .single()
      
      setUserProfile(profile)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadHistory = async () => {
    try {
      setLoadingHistory(true)
      const response = await fetch('/api/ideas/history')
      const data = await response.json()
      if (data.ideas) {
        setSavedIdeas(data.ideas)
      }
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const deleteIdea = async (id: string) => {
    if (!confirm('¿Eliminar esta idea del historial?')) return
    
    try {
      const response = await fetch(`/api/ideas/delete?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        setSavedIdeas(savedIdeas.filter(idea => idea.id !== id))
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

  const generateIdeas = async () => {
    setGenerating(true)
    setError(null)
    setIdeas([])
    
    try {
      const response = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIdeas(data.ideas)
        await loadHistory()
      } else {
        setError(data.error || 'Failed to generate ideas')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getDurationColor = (duration: string) => {
    const seconds = parseInt(duration.split('-')[0])
    if (seconds >= 65) return 'text-green-600 bg-green-100'
    if (seconds >= 30) return 'text-amber-600 bg-amber-100'
    return 'text-blue-600 bg-blue-100'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-600 rounded-xl">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Idea Generator</h1>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">AI Powered</span>
              </div>
              <p className="text-gray-500 ml-11">
                Genera ideas de contenido personalizadas basadas en tu contexto y objetivo
              </p>
            </div>
            <button
              onClick={generateIdeas}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generar ideas
                </>
              )}
            </button>
          </div>
        </div>

        {/* Perfil del usuario (contexto) */}
        {userProfile && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contexto para la generación</span>
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
                <span className="text-gray-500">Fase:</span>
                <span className="font-medium text-gray-900">{userProfile.current_phase}</span>
              </div>
              {userProfile.main_struggle && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Dolor principal:</span>
                  <span className="font-medium text-amber-600">{userProfile.main_struggle}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Ideas Grid - Solo mostrar las generadas en esta sesión */}
        {ideas.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Ideas generadas
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ideas.map((idea, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-600">{idx + 1}</span>
                        </div>
                        <span className="text-xs text-purple-600 font-medium">Idea</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(idea.title, idx)}
                        className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Copiar idea"
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{idea.title}</h3>
                    
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase">Hook</span>
                      <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-2 rounded-lg">
                        "{idea.hook}"
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase">Descripción</span>
                      <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {idea.hook_template_id && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                          <Hash className="w-3 h-3" />
                          Plantilla #{idea.hook_template_id}
                        </div>
                      )}
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getDurationColor(idea.duration_suggestion)}`}>
                        <Clock className="w-3 h-3" />
                        {idea.duration_suggestion}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        <Target className="w-3 h-3" />
                        CTA: {idea.cta}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => copyToClipboard(idea.hook, idx + 100)}
                        className="flex-1 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Copiar hook
                      </button>
                      <button
                        className="flex-1 py-1.5 text-xs text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        Agendar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historial de ideas */}
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <History className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-gray-900">Historial de ideas</h3>
                <p className="text-sm text-gray-500">{savedIdeas.length} ideas generadas</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>
          
          {showHistory && (
            <div className="mt-3 space-y-3">
              {loadingHistory ? (
                <div className="text-center py-8 text-gray-400">Cargando historial...</div>
              ) : savedIdeas.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-200">
                  No hay ideas guardadas aún. Genera tu primera idea arriba.
                </div>
              ) : (
                savedIdeas.map((saved) => {
                  const idea = saved.idea_data
                  const isExpanded = expandedItems.has(saved.id)
                  
                  return (
                    <div key={saved.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleExpand(saved.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDurationColor(idea.duration_suggestion)}`}>
                              {idea.duration_suggestion}
                            </div>
                            {saved.hook_template_id && (
                              <div className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                                Plantilla #{saved.hook_template_id}
                              </div>
                            )}
                            <span className="text-xs text-gray-400">{formatDate(saved.created_at)}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">
                            {idea.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            Hook: {idea.hook}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(idea.hook, -1); }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                            title="Copiar hook"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteIdea(saved.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-gray-50">
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Descripción</p>
                            <p className="text-sm text-gray-700">{idea.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-3 mb-3">
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                              <Target className="w-3 h-3" />
                              CTA: {idea.cta}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => copyToClipboard(idea.hook, -2)}
                              className="flex-1 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Copiar hook
                            </button>
                            <button
                              className="flex-1 py-1.5 text-xs text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-1"
                            >
                              <Calendar className="w-3 h-3" />
                              Agendar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Loading state while generating */}
        {generating && !ideas.length && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Analizando tu contexto y generando ideas...</p>
            <p className="text-sm text-gray-400 mt-2">Esto puede tomar unos segundos</p>
          </div>
        )}

        {/* Empty state */}
        {!generating && ideas.length === 0 && savedIdeas.length === 0 && !error && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin ideas generadas</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Haz clic en "Generar ideas" para que la IA cree contenido personalizado basado en tu contexto y objetivo.
            </p>
            <button
              onClick={generateIdeas}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generar ideas ahora
            </button>
          </div>
        )}
      </div>
    </div>
  )
}