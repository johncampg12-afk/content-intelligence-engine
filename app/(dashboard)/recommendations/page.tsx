'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, TrendingUp, Clock, Calendar, BarChart3, Share2, MessageCircle, Heart, Eye } from 'lucide-react'

interface AnalysisData {
  analysis: string
  analyzed_at: string
}

export default function RecommendationsPage() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
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

  // Función para parsear el análisis y convertirlo en secciones
  const parseAnalysis = (text: string) => {
    const sections: { title: string; content: string; icon?: any }[] = []
    
    // Detectar secciones por markdown
    const lines = text.split('\n')
    let currentSection: { title: string; content: string } | null = null
    
    for (const line of lines) {
      if (line.startsWith('### ')) {
        if (currentSection) {
          sections.push({
            title: currentSection.title,
            content: currentSection.content.trim()
          })
        }
        currentSection = {
          title: line.replace('### ', '').trim(),
          content: ''
        }
      } else if (currentSection && line.trim()) {
        currentSection.content += line + '\n'
      }
    }
    
    if (currentSection) {
      sections.push({
        title: currentSection.title,
        content: currentSection.content.trim()
      })
    }
    
    // Asignar íconos según el título
    return sections.map(section => {
      let icon = null
      if (section.title.includes('Mejor Hora')) icon = Clock
      if (section.title.includes('Mejor Día')) icon = Calendar
      if (section.title.includes('Duración')) icon = BarChart3
      if (section.title.includes('Patrones')) icon = TrendingUp
      if (section.title.includes('Recomendaciones')) icon = Sparkles
      if (section.title.includes('Resumen')) icon = Share2
      return { ...section, icon }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando análisis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">AI Intelligence</h1>
            </div>
            <p className="text-gray-500 ml-12">
              Análisis inteligente de tu contenido basado en IA
            </p>
          </div>
          
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analizar ahora</span>
              </>
            )}
          </button>
        </div>

        {/* Análisis */}
        {analysis ? (
          <div className="space-y-6">
            {/* Fecha del análisis */}
            <div className="flex justify-end">
              <div className="text-sm text-gray-400 bg-white px-4 py-2 rounded-full shadow-sm">
                Último análisis: {new Date(analysis.analyzed_at).toLocaleString('es-ES')}
              </div>
            </div>
            
            {/* Secciones */}
            {parseAnalysis(analysis.analysis).map((section, idx) => {
              const Icon = section.icon
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="border-l-4 border-purple-500 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {Icon && (
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Icon className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      <h2 className="text-xl font-semibold text-gray-800">
                        {section.title}
                      </h2>
                    </div>
                    <div className="prose prose-gray max-w-none">
                      {section.content.split('\n').map((paragraph, pIdx) => {
                        // Detectar bullet points
                        if (paragraph.trim().startsWith('*') || paragraph.trim().startsWith('-')) {
                          return (
                            <div key={pIdx} className="flex items-start gap-2 my-2 text-gray-600">
                              <span className="text-purple-500 mt-1">•</span>
                              <span>{paragraph.trim().substring(1)}</span>
                            </div>
                          )
                        }
                        // Detectar números
                        const numMatch = paragraph.match(/^\d+\./)
                        if (numMatch) {
                          return (
                            <div key={pIdx} className="flex items-start gap-3 my-3">
                              <span className="font-bold text-purple-600 min-w-[24px]">{numMatch[0]}</span>
                              <span className="text-gray-700">{paragraph.replace(/^\d+\./, '').trim()}</span>
                            </div>
                          )
                        }
                        if (paragraph.trim()) {
                          return (
                            <p key={pIdx} className="text-gray-600 leading-relaxed mb-3">
                              {paragraph}
                            </p>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay análisis disponible</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Haz clic en "Analizar ahora" para que la IA analice tus videos y genere recomendaciones personalizadas
            </p>
            <button
              onClick={runAnalysis}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Comenzar análisis
            </button>
          </div>
        )}
      </div>
    </div>
  )
}