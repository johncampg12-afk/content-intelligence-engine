'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

  // Formatear el texto profesionalmente
  const formatAnalysisText = (text: string) => {
    // Reemplazar markdown básico
    let formatted = text
      .replace(/### /g, '<h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">')
      .replace(/## /g, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b pb-2">')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>')
      .replace(/\n/g, '<br/>')
    
    // Mejorar bullet points
    formatted = formatted.replace(/• /g, '<span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>')
    formatted = formatted.replace(/^- /gm, '<span class="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>')
    formatted = formatted.replace(/^\d+\. /gm, (match) => `<span class="font-bold text-blue-600 mr-2">${match}</span>`)
    
    return formatted
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando análisis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Intelligence Report</h1>
              <p className="text-sm text-gray-500 mt-1">
                Análisis estratégico basado en inteligencia artificial
              </p>
            </div>
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {analyzing ? 'Procesando...' : 'Generar nuevo análisis'}
            </button>
          </div>
          <div className="h-px bg-gray-200" />
        </div>

        {/* Content */}
        {analysis ? (
          <div className="space-y-6">
            {/* Metadata */}
            <div className="text-right">
              <span className="text-xs text-gray-400">
                Última actualización: {new Date(analysis.analyzed_at).toLocaleString('es-ES')}
              </span>
            </div>
            
            {/* Analysis Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div 
                  className={`prose prose-sm max-w-none ${expanded ? '' : 'max-h-96 overflow-hidden relative'}`}
                  dangerouslySetInnerHTML={{ __html: formatAnalysisText(analysis.analysis) }}
                />
                
                {!expanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
              
              <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {expanded ? 'Ver menos' : 'Ver análisis completo'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos disponibles</h3>
            <p className="text-gray-500 text-sm mb-6">
              Genera un nuevo análisis para obtener insights estratégicos
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