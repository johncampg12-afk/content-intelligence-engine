'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle,
  Download,
  Calendar,
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  LineChart,
  Sparkles,
  Zap,
  Target,
  Clock,
  Hash,
  Music
} from 'lucide-react'
import {
  LineChart as ReLineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { format, subDays, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'

interface VideoMetric {
  id: string
  video_id: string
  title: string
  thumbnail_url: string
  published_at: string
  duration: number
  hashtags: string[]
  sound: string
  views: number
  likes: number
  comments: number
  shares: number
  engagement_rate: number
  recorded_at: string
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<VideoMetric[]>([])
  const [filteredVideos, setFilteredVideos] = useState<VideoMetric[]>([])
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'custom'>('week')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'shares' | 'engagement'>('engagement')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  
  const supabase = createClient()

  // Colores para gráficos
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899']

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterAndSortData()
  }, [videos, period, customStartDate, customEndDate, sortBy, sortOrder, searchTerm])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      // Obtener videos con métricas y campos adicionales
      const { data: videosData } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          thumbnail_url,
          published_at,
          duration,
          hashtags,
          sound,
          metadata,
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
      
      if (!videosData || videosData.length === 0) {
        setLoading(false)
        return
      }
      
      // Procesar métricas más recientes por video
      const processedVideos = videosData.flatMap(v => {
        const latestMetrics = v.video_metrics?.sort((a: any, b: any) => 
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        )[0]
        
        if (!latestMetrics) return []
        
        // Extraer hashtags del metadata o de la descripción
        let hashtags = v.hashtags || []
        if (hashtags.length === 0 && v.metadata?.hashtags) {
          hashtags = v.metadata.hashtags
        }
        
        // Extraer sonido del metadata
        const sound = v.sound || v.metadata?.sound || v.metadata?.music_info?.title || 'Unknown'
        
        return [{
          id: v.id,
          video_id: v.id,
          title: v.title || 'Untitled',
          thumbnail_url: v.thumbnail_url,
          published_at: v.published_at,
          duration: v.duration || 0,
          hashtags: hashtags,
          sound: sound,
          views: latestMetrics.views || 0,
          likes: latestMetrics.likes || 0,
          comments: latestMetrics.comments || 0,
          shares: latestMetrics.shares || 0,
          engagement_rate: latestMetrics.engagement_rate || 0,
          recorded_at: latestMetrics.recorded_at
        }]
      })
      
      setVideos(processedVideos)
      
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortData = () => {
    let filtered = [...videos]
    
    // Filtrar por período
    if (period !== 'custom') {
      const now = new Date()
      let startDate: Date
      
      switch (period) {
        case 'week':
          startDate = subDays(now, 7)
          break
        case 'month':
          startDate = subDays(now, 30)
          break
        case 'quarter':
          startDate = subDays(now, 90)
          break
        default:
          startDate = subDays(now, 7)
      }
      
      filtered = filtered.filter(v => new Date(v.published_at) >= startDate)
    } else {
      if (customStartDate) {
        filtered = filtered.filter(v => new Date(v.published_at) >= new Date(customStartDate))
      }
      if (customEndDate) {
        filtered = filtered.filter(v => new Date(v.published_at) <= new Date(customEndDate))
      }
    }
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.hashtags?.some(h => h.toLowerCase().includes(searchTerm.toLowerCase())) ||
        v.sound?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      let aVal: number, bVal: number
      switch (sortBy) {
        case 'views':
          aVal = a.views
          bVal = b.views
          break
        case 'likes':
          aVal = a.likes
          bVal = b.likes
          break
        case 'shares':
          aVal = a.shares
          bVal = b.shares
          break
        default:
          aVal = a.engagement_rate
          bVal = b.engagement_rate
      }
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })
    
    setFilteredVideos(filtered)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateTotals = () => {
    return {
      views: filteredVideos.reduce((sum, v) => sum + v.views, 0),
      likes: filteredVideos.reduce((sum, v) => sum + v.likes, 0),
      comments: filteredVideos.reduce((sum, v) => sum + v.comments, 0),
      shares: filteredVideos.reduce((sum, v) => sum + v.shares, 0),
      avgEngagement: filteredVideos.length > 0
        ? filteredVideos.reduce((sum, v) => sum + v.engagement_rate, 0) / filteredVideos.length
        : 0,
      totalVideos: filteredVideos.length
    }
  }

  const prepareTrendData = () => {
    const grouped = filteredVideos.reduce((acc: any, v) => {
      const date = format(new Date(v.published_at), 'dd/MM')
      if (!acc[date]) {
        acc[date] = { date, views: 0, engagement: 0, count: 0 }
      }
      acc[date].views += v.views
      acc[date].engagement += v.engagement_rate
      acc[date].count += 1
      return acc
    }, {})
    
    return Object.values(grouped).map((item: any) => ({
      date: item.date,
      views: item.views,
      engagement: parseFloat((item.engagement / item.count).toFixed(2))
    })).slice(-14)
  }

  const prepareEngagementDistribution = () => {
    const ranges = [
      { name: '0-2%', value: 0, color: '#EF4444' },
      { name: '2-5%', value: 0, color: '#F59E0B' },
      { name: '5-10%', value: 0, color: '#10B981' },
      { name: '10%+', value: 0, color: '#3B82F6' }
    ]
    
    filteredVideos.forEach(v => {
      const rate = v.engagement_rate * 100
      if (rate < 2) ranges[0].value++
      else if (rate < 5) ranges[1].value++
      else if (rate < 10) ranges[2].value++
      else ranges[3].value++
    })
    
    return ranges.filter(r => r.value > 0)
  }

  const handleExportCSV = () => {
    const headers = ['Title', 'Published Date', 'Duration', 'Hashtags', 'Sound', 'Views', 'Likes', 'Comments', 'Shares', 'Engagement Rate']
    const rows = filteredVideos.map(v => [
      v.title,
      format(new Date(v.published_at), 'dd/MM/yyyy'),
      formatDuration(v.duration),
      v.hashtags?.join(', ') || '',
      v.sound || '',
      v.views,
      v.likes,
      v.comments,
      v.shares,
      `${(v.engagement_rate * 100).toFixed(2)}%`
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', `analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const totals = calculateTotals()
  const trendData = prepareTrendData()
  const engagementDistribution = prepareEngagementDistribution()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No data available</h2>
          <p className="text-gray-500 mb-6">
            Connect your TikTok account and sync your videos to see analytics
          </p>
          <a
            href="/settings"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect TikTok
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-500 mt-1">Deep dive into your content performance metrics</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="quarter">Last 90 days</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
              
              {period === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Video</label>
                <input
                  type="text"
                  placeholder="Search by title, hashtag, or sound..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Total Views</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totals.views)}</p>
            <p className="text-xs text-gray-400 mt-1">{totals.totalVideos} videos</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">Total Likes</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totals.likes)}</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-500">Total Shares</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totals.shares)}</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Comments</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(totals.comments)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 shadow-sm text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs text-blue-100">Avg Engagement</span>
            </div>
            <p className="text-2xl font-bold">{totals.avgEngagement.toFixed(2)}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Views Trend</h3>
              <LineChart className="w-4 h-4 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="analyticsViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip formatter={(value: any) => formatNumber(value)} />
                <Area type="monotone" dataKey="views" stroke="#3B82F6" fill="url(#analyticsViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Engagement Distribution</h3>
              <PieChart className="w-4 h-4 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <RePieChart>
                <Pie
                  data={engagementDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => {
                    if (percent === undefined) return name
                    return `${name}: ${(percent * 100).toFixed(0)}%`
                  }}
                >
                  {engagementDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Videos Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Video Performance</h3>
              <p className="text-sm text-gray-500 mt-0.5">{filteredVideos.length} videos in this period</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1"
              >
                <option value="engagement">Sort by Engagement</option>
                <option value="views">Sort by Views</option>
                <option value="likes">Sort by Likes</option>
                <option value="shares">Sort by Shares</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {sortOrder === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hashtags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sound</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Views</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Likes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Comments</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Shares</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Engagement</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVideos.slice(0, 20).map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {video.thumbnail_url ? (
                            <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <BarChart3 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-900 line-clamp-2 max-w-[250px]">
                          {video.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        {formatDuration(video.duration)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {video.hashtags?.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                        {video.hashtags && video.hashtags.length > 3 && (
                          <span className="text-xs text-gray-400">+{video.hashtags.length - 3}</span>
                        )}
                        {(!video.hashtags || video.hashtags.length === 0) && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 max-w-[180px]">
                        <Music className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate">{video.sound || 'Original'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{formatNumber(video.views)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{formatNumber(video.likes)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{formatNumber(video.comments)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{formatNumber(video.shares)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-medium ${video.engagement_rate > 0.05 ? 'text-green-600' : 'text-gray-600'}`}>
                        {(video.engagement_rate * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {format(new Date(video.published_at), 'dd/MM/yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredVideos.length > 20 && (
            <div className="px-6 py-4 border-t border-gray-200 text-center text-sm text-gray-500">
              Showing 20 of {filteredVideos.length} videos
            </div>
          )}
        </div>
      </div>
    </div>
  )
}