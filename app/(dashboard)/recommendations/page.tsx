'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, TrendingUp, Clock, Calendar, BarChart3, Share2, AlertCircle, Target, Eye, Heart, MessageCircle, BookOpen } from 'lucide-react'

interface AnalysisData {
  analysis: string
  analyzed_at: string
}

export default function RecommendationsPage() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    loadAnalysis()
  }, [])

  const loadAnalysis = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUserId(user.id)
      
      const { data: patterns } = await supabase
        .from('content_patterns')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'tiktok')
        .eq('pattern_type', 'weekly_analysis')
        .order('analyzed_at', { ascending: false })
        .limit(1)
      
      if (patterns && patterns.length > 0) {
        setAnalysis({
          analysis: patterns[0].pattern_value.analysis,
          analyzed_at: patterns[0].analyzed_at
        })
      }
      
    } catch (error) {
      console.error('Error loading analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const runAnalysis = async () => {
    if (!userId) return
    
    try {
      setAnalyzing(true)
      
      const response = await fetch('/api/cron/analyze-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadAnalysis()
      }
      
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  // Función para procesar el texto con markdown
  const formatAnalysisText = (text: string) => {
    let formatted = text
      // Convertir títulos principales (1. TÍTULO)
      .replace(/^(\d+\.\s+)([A-ZÁÉÍÓÚÑ\s]+)(?=\n)/gm, '<h2 class="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">$1$2</h2>')
      // Convertir subtítulos con asteriscos (* Título)
      .replace(/^\*\s+([A-ZÁÉÍÓÚÑ][^:\n]+):/gm, '<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">$1</h3>')
      // Convertir negritas (**texto**)
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-700 dark:text-blue-400">$1</strong>')
      // Convertir listas con asteriscos
      .replace(/^\*\s+(.*?)$/gm, '<li class="ml-4 text-gray-700 dark:text-gray-300 mb-1 flex items-start gap-2"><span class="text-blue-500 dark:text-blue-400 mt-1">•</span><span>$1</span></li>')
      // Convertir listas numeradas
      .replace(/^\d+\.\s+(.*?)$/gm, '<li class="ml-4 text-gray-700 dark:text-gray-300 mb-1 flex items-start gap-2"><span class="font-medium text-blue-600 dark:text-blue-400 min-w-[24px]">$&</span></li>')
      // Convertir párrafos normales
      .replace(/^(?!<[hl]|<\/?[hl]|•).+$/gm, (match) => {
        if (match.trim() && !match.startsWith('<')) {
          return `<p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">${match}</p>`
        }
        return match
      })
      // Agrupar listas
      .replace(/<li.*?<\/li>\n<li/g, '<li')
    
    return formatted
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando análisis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Intelligence Report</h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                Análisis estratégico basado en inteligencia artificial
              </p>
            </div>
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generar nuevo análisis
                </>
              )}
            </button>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Content */}
        {analysis ? (
          <div className="space-y-6">
            {/* Metadata */}
            <div className="text-right">
              <span className="text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                Última actualización: {new Date(analysis.analyzed_at).toLocaleString('es-ES')}
              </span>
            </div>
            
            {/* Analysis Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6">
                <div 
                  className={`prose prose-sm max-w-none ${expanded ? '' : 'max-h-96 overflow-hidden relative'}`}
                  dangerouslySetInnerHTML={{ __html: formatAnalysisText(analysis.analysis) }}
                />
                
                {!expanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-800 to-transparent" />
                )}
              </div>
              
              <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Análisis generado por Meta AI
                </span>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  {expanded ? 'Ver menos' : 'Ver análisis completo'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay análisis disponible</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Genera un nuevo análisis para obtener insights estratégicos basados en tus videos de TikTok
            </p>
            <button
              onClick={runAnalysis}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Iniciar análisis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}