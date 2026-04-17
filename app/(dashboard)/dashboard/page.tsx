'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  Video, 
  ArrowUp,
  ArrowDown,
  Sparkles,
  Calendar,
  BarChart3,
  Zap,
  Target,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import Link from 'next/link'
import { OnboardingBanner } from '@/components/dashboard/onboarding-banner'

interface Video {
  id: string
  title: string
  platform: string
  thumbnail_url: string
  published_at: string
  views: number
  likes: number
  comments: number
  shares: number
  engagement_rate: number
}

interface KPI {
  total_views: number
  total_likes: number
  total_comments: number
  total_shares: number
  total_videos: number
  avg_engagement: number
  engagement_change: number
  views_change: number
  likes_change: number
  shares_change: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [kpi, setKpi] = useState<KPI | null>(null)
  const [trendData, setTrendData] = useState<any[]>([])
  const [topVideos, setTopVideos] = useState<Video[]>([])
  const [latestRecommendation, setLatestRecommendation] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [lastSync, setLastSync] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUserName(user.email?.split('@')[0] || 'User')
      
      // Obtener última sincronización
      const { data: lastSyncData } = await supabase
        .from('sync_jobs')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
      
      if (lastSyncData && lastSyncData.length > 0) {
        setLastSync(new Date(lastSyncData[0].completed_at).toLocaleString())
      }
      
      // Obtener videos con métricas
      const { data: videos } = await supabase
        .from('videos')
        .select(`
          *,
          video_metrics (
            views,
            likes,
            comments,
            shares,
            engagement_rate,
            recorded_at
          )
        `)
        .eq('user_id', user.id)
        .order('published_at', { ascending: false })
        .limit(50)
      
      if (!videos || videos.length === 0) {
        setLoading(false)
        return
      }
      
      // Procesar métricas más recientes por video
      const processedVideos = videos.map(v => {
        const latestMetrics = v.video_metrics?.sort((a: any, b: any) => 
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        )[0] || {}
        
        return {
          ...v,
          views: latestMetrics.views || 0,
          likes: latestMetrics.likes || 0,
          comments: latestMetrics.comments || 0,
          shares: latestMetrics.shares || 0,
          engagement_rate: latestMetrics.engagement_rate || 0
        }
      })
      
      // Calcular KPIs
      const totalViews = processedVideos.reduce((sum, v) => sum + v.views, 0)
      const totalLikes = processedVideos.reduce((sum, v) => sum + v.likes, 0)
      const totalComments = processedVideos.reduce((sum, v) => sum + v.comments, 0)
      const totalShares = processedVideos.reduce((sum, v) => sum + v.shares, 0)
      const avgEngagement = totalViews > 0 
        ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 
        : 0
      
      // Calcular cambios (simulados con datos de ejemplo - luego se puede hacer con datos históricos)
      setKpi({
        total_views: totalViews,
        total_likes: totalLikes,
        total_comments: totalComments,
        total_shares: totalShares,
        total_videos: processedVideos.length,
        avg_engagement: avgEngagement,
        engagement_change: 12.8,
        views_change: 8.3,
        likes_change: 15.2,
        shares_change: 22.5
      })
      
      // Top videos por engagement
      const sortedVideos = [...processedVideos].sort((a, b) => b.engagement_rate - a.engagement_rate)
      setTopVideos(sortedVideos.slice(0, 5))
      
      // Datos para gráfico de tendencia
      const groupedByDate = processedVideos.reduce((acc: any, v) => {
        const date = new Date(v.published_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        if (!acc[date]) {
          acc[date] = { date, views: 0, engagement: 0, count: 0 }
        }
        acc[date].views += v.views
        acc[date].engagement += v.engagement_rate
        acc[date].count += 1
        return acc
      }, {})
      
      const trendDataArray = Object.values(groupedByDate).map((item: any) => ({
        date: item.date,
        views: item.views,
        engagement: parseFloat((item.engagement / item.count).toFixed(2))
      })).slice(-7)
      
      setTrendData(trendDataArray)
      
      // Obtener última recomendación
      const { data: patterns } = await supabase
        .from('content_patterns')
        .select('pattern_value')
        .eq('user_id', user.id)
        .eq('pattern_type', 'weekly_analysis')
        .order('analyzed_at', { ascending: false })
        .limit(1)
      
      if (patterns && patterns.length > 0 && patterns[0].pattern_value?.analysis) {
        const analysis = patterns[0].pattern_value.analysis
        const lines = analysis.split('\n')
        let firstRecommendation = ''
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          if (line.match(/^\d+\./)) {
            firstRecommendation = line.replace(/^\d+\.\s+/, '').trim()
            break
          }
        }
        if (firstRecommendation) {
          setLatestRecommendation(firstRecommendation)
        }
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const handleSync = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    await fetch('/api/cron/sync-tiktok', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    })
    
    await loadDashboardData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!kpi || kpi.total_videos === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No data available</h2>
          <p className="text-gray-500 mb-6">
            Connect your TikTok account and sync your videos to start receiving analytics
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect TikTok
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        
        {/* Onboarding Banner - NUEVO */}
        <OnboardingBanner />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {userName}</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {lastSync && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last sync: {lastSync}
              </span>
            )}
            <button
              onClick={handleSync}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Sync now
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${kpi.views_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.views_change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(kpi.views_change)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(kpi.total_views)}</p>
            <p className="text-sm text-gray-500 mt-1">Total Views</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${kpi.likes_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.likes_change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(kpi.likes_change)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(kpi.total_likes)}</p>
            <p className="text-sm text-gray-500 mt-1">Total Likes</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${kpi.shares_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.shares_change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(kpi.shares_change)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(kpi.total_shares)}</p>
            <p className="text-sm text-gray-500 mt-1">Total Shares</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-sm text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 text-sm text-green-300">
                <ArrowUp className="w-3 h-3" />
                {kpi.engagement_change}%
              </div>
            </div>
            <p className="text-2xl font-bold">{kpi.avg_engagement.toFixed(1)}%</p>
            <p className="text-sm text-blue-100 mt-1">Engagement Rate</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900">Views Evolution</h3>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  formatter={(value: any) => [formatNumber(value), 'Views']}
                />
                <Area type="monotone" dataKey="views" stroke="#2563EB" fill="url(#viewsGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900">Engagement Evolution</h3>
              <Target className="w-4 h-4 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  formatter={(value: any) => [`${value}%`, 'Engagement Rate']}
                />
                <Bar dataKey="engagement" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Videos */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900">Top Performing Videos</h3>
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="space-y-4">
              {topVideos.map((video, idx) => (
                <Link 
                  key={video.id} 
                  href={`/content/${video.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Video className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{video.title || 'Untitled'}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {formatNumber(video.views)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {formatNumber(video.likes)}
                      </span>
                      <span className="text-xs font-medium text-green-600">
                        {(video.engagement_rate * 100).toFixed(1)}% eng.
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-300 group-hover:text-gray-400 transition-colors">#{idx + 1}</div>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link href="/content" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all videos →
              </Link>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-sm text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold">Strategic AI Insight</h3>
            </div>
            {latestRecommendation ? (
              <>
                <p className="text-slate-300 leading-relaxed text-sm">
                  {latestRecommendation}
                </p>
                <Link 
                  href="/recommendations" 
                  className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View full analysis →
                </Link>
              </>
            ) : (
              <>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Generate your first AI-powered analysis to receive personalized strategic recommendations based on your content performance and niche patterns.
                </p>
                <Link 
                  href="/recommendations" 
                  className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Generate analysis →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/recommendations"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">AI Recommendations</p>
                <p className="text-xs text-gray-500">Get content strategy insights</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </Link>

          <Link 
            href="/content"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <Video className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Content Library</p>
                <p className="text-xs text-gray-500">Manage your videos</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
          </Link>

          <Link 
            href="/settings"
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Content Strategy</p>
                <p className="text-xs text-gray-500">Configure your niche</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Componente ArrowRight auxiliar
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)