'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RecommendationsPage() {
  const [analysis, setAnalysis] = useState<string | null>(null)
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
        setAnalysis(patterns[0].pattern_value.analysis)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
          <p className="text-gray-600 mt-1">
            Smart content strategy powered by DeepSeek AI
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
        >
          {analyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            'Generate New Analysis'
          )}
        </button>
      </div>

      {analysis ? (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="prose max-w-none">
            {analysis.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No analysis available yet</p>
          <button
            onClick={runAnalysis}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Generate First Analysis
          </button>
        </div>
      )}
    </div>
  )
}