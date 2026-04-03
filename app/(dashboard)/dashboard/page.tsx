'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle, 
  Video, 
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

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
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [kpi, setKpi] = useState<KPI | null>(null)
  const [trendData, setTrendData] = useState<any[]>([])
  const [topVideos, setTopVideos] = useState<Video[]>([])
  const [latestRecommendation, setLatestRecommendation] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  
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
      
      setKpi({
        total_views: totalViews,
        total_likes: totalLikes,
        total_comments: totalComments,
        total_shares: totalShares,
        total_videos: processedVideos.length,
        avg_engagement: avgEngagement,
        engagement_change: 12.5,
        views_change: 8.3
      })
      
      // Top videos por engagement
      const sortedVideos = [...processedVideos].sort((a, b) => b.engagement_rate - a.engagement_rate)
      setTopVideos(sortedVideos.slice(0, 5))
      
      // Datos para gráfico de tendencia (agrupados por día)
      const groupedByDate = processedVideos.reduce((acc: any, v) => {
        const date = new Date(v.published_at).toLocaleDateString()
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
        engagement: item.engagement / item.count
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
        // Extraer primera recomendación - sin usar flag /s
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!kpi || kpi.total_videos === 0) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No data yet</h2>
          <p className="text-gray-500 mb-6">
            Connect your TikTok account and sync your videos to see analytics
          </p>
          <a
            href="/settings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Connect TikTok
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {userName} 👋</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            {kpi.views_change > 0 ? (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> +{kpi.views_change}%
              </span>
            ) : (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <ArrowDown className="w-3 h-3" /> {kpi.views_change}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(kpi.total_views)}</p>
          <p className="text-sm text-gray-500">Total Views</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(kpi.total_likes)}</p>
          <p className="text-sm text-gray-500">Total Likes</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Share2 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(kpi.total_shares)}</p>
          <p className="text-sm text-gray-500">Total Shares</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            {kpi.engagement_change > 0 ? (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <ArrowUp className="w-3 h-3" /> +{kpi.engagement_change}%
              </span>
            ) : (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <ArrowDown className="w-3 h-3" /> {kpi.engagement_change}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.avg_engagement.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Avg. Engagement Rate</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Views Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#3B82F6" fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="engagement" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Videos & Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Videos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Videos</h3>
          <div className="space-y-4">
            {topVideos.map((video, idx) => (
              <a 
                key={video.id} 
                href={`/content/${video.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Video className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{video.title || 'Untitled'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {formatNumber(video.views)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {formatNumber(video.likes)}
                    </span>
                    <span className="text-xs text-green-600">
                      {(video.engagement_rate * 100).toFixed(1)}% engagement
                    </span>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-400">#{idx + 1}</div>
              </a>
            ))}
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-lg font-semibold">AI Insight of the Day</h3>
          </div>
          {latestRecommendation ? (
            <p className="text-purple-100 leading-relaxed">
              {latestRecommendation}
            </p>
          ) : (
            <p className="text-purple-100">
              Generate your first AI analysis to get personalized recommendations for your content strategy.
            </p>
          )}
          <a 
            href="/recommendations" 
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-white hover:text-purple-200 transition-colors"
          >
            View full analysis →
          </a>
        </div>
      </div>
    </div>
  )
}