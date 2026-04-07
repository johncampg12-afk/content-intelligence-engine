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
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  LineChart,
  Clock,
  Hash,
  Music,
  Calendar as CalendarIcon,
  AlertTriangle,
  TrendingDown,
  Zap,
  Target,
  FileText,
  Upload,
  ChevronLeft,
  ChevronRight
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
  Area,
  ComposedChart,
  Scatter
} from 'recharts'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, subWeeks, subMonths } from 'date-fns'
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

interface PeriodData {
  start: Date
  end: Date
  label: string
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<VideoMetric[]>([])
  const [filteredVideos, setFilteredVideos] = useState<VideoMetric[]>([])
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'custom'>('week')
  const [comparePeriod, setComparePeriod] = useState<'previous' | 'last_week' | 'last_month'>('previous')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'shares' | 'engagement'>('engagement')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showAlerts, setShowAlerts] = useState(true)
  const [showCohorts, setShowCohorts] = useState(true)
  
  // Datos para gráficos
  const [chartData, setChartData] = useState({
    viewsTrend: [] as any[],
    engagementTrend: [] as any[],
    hashtagsTop: [] as any[],
    weekdayPerformance: [] as any[],
    durationDistribution: [] as any[],
    engagementByType: { likes: 0, comments: 0, shares: 0 },
    hourlyHeatmap: [] as any[],
    predictions: { views7d: 0, views14d: 0, views30d: 0, confidence: 0 },
    alerts: [] as string[],
    cohorts: [] as any[]
  })
  
  // Datos para comparativa
  const [comparisonData, setComparisonData] = useState({
    views: { current: 0, previous: 0, change: 0 },
    likes: { current: 0, previous: 0, change: 0 },
    shares: { current: 0, previous: 0, change: 0 },
    engagement: { current: 0, previous: 0, change: 0 }
  })
  
  const supabase = createClient()

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#14B8A6', '#F97316']
  const ENGAGEMENT_COLORS = { likes: '#3B82F6', comments: '#10B981', shares: '#8B5CF6' }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (videos.length > 0) {
      updateCharts()
      updateComparison()
    }
  }, [videos, period, customStartDate, customEndDate, comparePeriod])

  useEffect(() => {
    filterAndSortData()
  }, [videos, period, customStartDate, customEndDate, sortBy, sortOrder, searchTerm])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
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
      
      const processedVideos = videosData.flatMap(v => {
        const latestMetrics = v.video_metrics?.sort((a: any, b: any) => 
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        )[0]
        
        if (!latestMetrics) return []
        
        return [{
          id: v.id,
          video_id: v.id,
          title: v.title || 'Untitled',
          thumbnail_url: v.thumbnail_url,
          published_at: v.published_at,
          duration: v.duration || 0,
          hashtags: v.hashtags || [],
          sound: v.sound || 'Original Sound',
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

  const getDateRange = (): PeriodData => {
    const now = new Date()
    let start: Date
    
    switch (period) {
      case 'week':
        start = subDays(now, 7)
        break
      case 'month':
        start = subDays(now, 30)
        break
      case 'quarter':
        start = subDays(now, 90)
        break
      case 'custom':
        start = customStartDate ? new Date(customStartDate) : subDays(now, 7)
        break
      default:
        start = subDays(now, 7)
    }
    
    const end = (period === 'custom' && customEndDate) ? new Date(customEndDate) : now
    
    return { start, end, label: `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}` }
  }

  const getPreviousPeriodRange = (current: PeriodData): PeriodData => {
    const duration = current.end.getTime() - current.start.getTime()
    const previousEnd = new Date(current.start.getTime() - 1)
    const previousStart = new Date(previousEnd.getTime() - duration)
    
    if (comparePeriod === 'last_week') {
      const prevStart = subDays(current.start, 7)
      const prevEnd = subDays(current.end, 7)
      return { start: prevStart, end: prevEnd, label: `${format(prevStart, 'dd/MM')} - ${format(prevEnd, 'dd/MM')}` }
    }
    if (comparePeriod === 'last_month') {
      const prevStart = subMonths(current.start, 1)
      const prevEnd = subMonths(current.end, 1)
      return { start: prevStart, end: prevEnd, label: `${format(prevStart, 'dd/MM')} - ${format(prevEnd, 'dd/MM')}` }
    }
    
    return { start: previousStart, end: previousEnd, label: `${format(previousStart, 'dd/MM')} - ${format(previousEnd, 'dd/MM')}` }
  }

  const updateComparison = () => {
    const currentRange = getDateRange()
    const previousRange = getPreviousPeriodRange(currentRange)
    
    const currentVideos = videos.filter(v => {
      const pubDate = new Date(v.published_at)
      return pubDate >= currentRange.start && pubDate <= currentRange.end
    })
    
    const previousVideos = videos.filter(v => {
      const pubDate = new Date(v.published_at)
      return pubDate >= previousRange.start && pubDate <= previousRange.end
    })
    
    const currentTotals = {
      views: currentVideos.reduce((sum, v) => sum + v.views, 0),
      likes: currentVideos.reduce((sum, v) => sum + v.likes, 0),
      shares: currentVideos.reduce((sum, v) => sum + v.shares, 0),
      engagement: currentVideos.length > 0
        ? currentVideos.reduce((sum, v) => sum + v.engagement_rate, 0) / currentVideos.length * 100
        : 0
    }
    
    const previousTotals = {
      views: previousVideos.reduce((sum, v) => sum + v.views, 0),
      likes: previousVideos.reduce((sum, v) => sum + v.likes, 0),
      shares: previousVideos.reduce((sum, v) => sum + v.shares, 0),
      engagement: previousVideos.length > 0
        ? previousVideos.reduce((sum, v) => sum + v.engagement_rate, 0) / previousVideos.length * 100
        : 0
    }
    
    setComparisonData({
      views: { 
        current: currentTotals.views, 
        previous: previousTotals.views, 
        change: previousTotals.views > 0 ? ((currentTotals.views - previousTotals.views) / previousTotals.views) * 100 : 0 
      },
      likes: { 
        current: currentTotals.likes, 
        previous: previousTotals.likes, 
        change: previousTotals.likes > 0 ? ((currentTotals.likes - previousTotals.likes) / previousTotals.likes) * 100 : 0 
      },
      shares: { 
        current: currentTotals.shares, 
        previous: previousTotals.shares, 
        change: previousTotals.shares > 0 ? ((currentTotals.shares - previousTotals.shares) / previousTotals.shares) * 100 : 0 
      },
      engagement: { 
        current: currentTotals.engagement, 
        previous: previousTotals.engagement, 
        change: previousTotals.engagement > 0 ? ((currentTotals.engagement - previousTotals.engagement) / previousTotals.engagement) * 100 : 0 
      }
    })
  }

  const updateCharts = () => {
    const { start, end } = getDateRange()
    
    const periodVideos = videos.filter(v => {
      const pubDate = new Date(v.published_at)
      return pubDate >= start && pubDate <= end
    })
    
    if (periodVideos.length === 0) {
      setChartData({
        viewsTrend: [],
        engagementTrend: [],
        hashtagsTop: [],
        weekdayPerformance: [],
        durationDistribution: [],
        engagementByType: { likes: 0, comments: 0, shares: 0 },
        hourlyHeatmap: [],
        predictions: { views7d: 0, views14d: 0, views30d: 0, confidence: 0 },
        alerts: [],
        cohorts: []
      })
      return
    }
    
    // 1. Views Trend
    const daysInRange = eachDayOfInterval({ start, end })
    const viewsByDay = daysInRange.map(day => {
      const dayStr = format(day, 'dd/MM')
      const dayVideos = periodVideos.filter(v => 
        format(new Date(v.published_at), 'dd/MM') === dayStr
      )
      return { date: dayStr, views: dayVideos.reduce((sum, v) => sum + v.views, 0) }
    })
    
    // 2. Engagement Trend
    const engagementByDay = daysInRange.map(day => {
      const dayStr = format(day, 'dd/MM')
      const dayVideos = periodVideos.filter(v => 
        format(new Date(v.published_at), 'dd/MM') === dayStr
      )
      const avgEngagement = dayVideos.length > 0
        ? dayVideos.reduce((sum, v) => sum + v.engagement_rate, 0) / dayVideos.length * 100
        : 0
      return { date: dayStr, engagement: parseFloat(avgEngagement.toFixed(2)) }
    })
    
    // 3. Top Hashtags
    const hashtagCount: Record<string, number> = {}
    periodVideos.forEach(v => {
      v.hashtags?.forEach(tag => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1
      })
    })
    const topHashtags = Object.entries(hashtagCount)
      .map(([name, value]) => ({ name: `#${name}`, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
    
    // 4. Weekday Performance
    const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const weekdayData = weekdays.map((day, idx) => {
      const dayVideos = periodVideos.filter(v => new Date(v.published_at).getDay() === idx + 1)
      const avgViews = dayVideos.length > 0
        ? dayVideos.reduce((sum, v) => sum + v.views, 0) / dayVideos.length
        : 0
      const avgEngagement = dayVideos.length > 0
        ? dayVideos.reduce((sum, v) => sum + v.engagement_rate, 0) / dayVideos.length * 100
        : 0
      return { day, avgViews, avgEngagement: parseFloat(avgEngagement.toFixed(2)) }
    })
    
    // 5. Duration Distribution
    const durationRanges = [
      { name: '0-15s', min: 0, max: 15, color: '#3B82F6' },
      { name: '16-30s', min: 16, max: 30, color: '#10B981' },
      { name: '31-60s', min: 31, max: 60, color: '#F59E0B' },
      { name: '60s+', min: 61, max: Infinity, color: '#EF4444' }
    ]
    const durationData = durationRanges.map(range => ({
      name: range.name,
      value: periodVideos.filter(v => v.duration >= range.min && v.duration <= range.max).length,
      color: range.color
    })).filter(d => d.value > 0)
    
    // 6. Engagement by type
    const engagementByType = {
      likes: periodVideos.reduce((sum, v) => sum + v.likes, 0),
      comments: periodVideos.reduce((sum, v) => sum + v.comments, 0),
      shares: periodVideos.reduce((sum, v) => sum + v.shares, 0)
    }
    
    // 7. Hourly Heatmap (simulado con datos reales)
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const weekdaysShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const hourlyData = weekdaysShort.map((day, dayIdx) => {
      return hours.map(hour => {
        const dayVideos = periodVideos.filter(v => new Date(v.published_at).getDay() === dayIdx + 1)
        const hourVideos = dayVideos.filter(v => {
          const pubHour = new Date(v.published_at).getHours()
          return pubHour === hour
        })
        const engagement = hourVideos.length > 0
          ? hourVideos.reduce((sum, v) => sum + v.engagement_rate, 0) / hourVideos.length * 100
          : 0
        return { day: day, hour: `${hour}:00`, engagement: parseFloat(engagement.toFixed(1)) }
      })
    }).flat()
    
    // 8. Predictions (simple linear regression)
    const viewsByDate = periodVideos
      .sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime())
      .map((v, idx) => ({ x: idx, y: v.views }))
    
    let predictions = { views7d: 0, views14d: 0, views30d: 0, confidence: 0 }
    if (viewsByDate.length > 2) {
      const n = viewsByDate.length
      const sumX = viewsByDate.reduce((s, p) => s + p.x, 0)
      const sumY = viewsByDate.reduce((s, p) => s + p.y, 0)
      const sumXY = viewsByDate.reduce((s, p) => s + p.x * p.y, 0)
      const sumX2 = viewsByDate.reduce((s, p) => s + p.x * p.x, 0)
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n
      
      predictions = {
        views7d: Math.max(0, Math.round(intercept + slope * (n + 7))),
        views14d: Math.max(0, Math.round(intercept + slope * (n + 14))),
        views30d: Math.max(0, Math.round(intercept + slope * (n + 30))),
        confidence: Math.min(95, Math.max(50, Math.round((viewsByDate.length / 30) * 80)))
      }
    }
    
    // 9. Alerts
    const alerts: string[] = []
    const weekComparison = comparisonData
    
    if (weekComparison.views.change < -10) {
      alerts.push(`📉 Las vistas han caído un ${Math.abs(weekComparison.views.change).toFixed(1)}% vs período anterior`)
    } else if (weekComparison.views.change > 20) {
      alerts.push(`📈 Excelente crecimiento de vistas: +${weekComparison.views.change.toFixed(1)}%`)
    }
    
    if (weekComparison.engagement.change < -15) {
      alerts.push(`⚠️ El engagement ha caído un ${Math.abs(weekComparison.engagement.change).toFixed(1)}% - revisa tu estrategia de contenido`)
    }
    
    const bestHashtag = topHashtags[0]
    if (bestHashtag && bestHashtag.value > 3) {
      alerts.push(`🔥 El hashtag ${bestHashtag.name} está generando buen rendimiento`)
    }
    
    const bestDay = weekdayData.reduce((best, current) => 
      current.avgEngagement > best.avgEngagement ? current : best, weekdayData[0])
    if (bestDay && bestDay.avgEngagement > 5) {
      alerts.push(`⭐ Los mejores resultados se obtienen los ${bestDay.day}`)
    }
    
    // 10. Cohorts (por duración)
    const cohorts = durationRanges.map(range => {
      const rangeVideos = periodVideos.filter(v => v.duration >= range.min && v.duration <= range.max)
      const avgViews = rangeVideos.length > 0
        ? rangeVideos.reduce((sum, v) => sum + v.views, 0) / rangeVideos.length
        : 0
      const avgEngagement = rangeVideos.length > 0
        ? rangeVideos.reduce((sum, v) => sum + v.engagement_rate, 0) / rangeVideos.length * 100
        : 0
      return {
        name: range.name,
        videos: rangeVideos.length,
        avgViews: Math.round(avgViews),
        avgEngagement: parseFloat(avgEngagement.toFixed(2)),
        trend: avgEngagement > 5 ? 'up' : avgEngagement > 2 ? 'stable' : 'down'
      }
    }).filter(c => c.videos > 0)
    
    setChartData({
      viewsTrend: viewsByDay,
      engagementTrend: engagementByDay,
      hashtagsTop: topHashtags,
      weekdayPerformance: weekdayData,
      durationDistribution: durationData,
      engagementByType,
      hourlyHeatmap: hourlyData,
      predictions,
      alerts,
      cohorts
    })
  }

  const filterAndSortData = () => {
    let filtered = [...videos]
    const { start, end } = getDateRange()
    
    filtered = filtered.filter(v => {
      const pubDate = new Date(v.published_at)
      return pubDate >= start && pubDate <= end
    })
    
    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.hashtags?.some(h => h.toLowerCase().includes(searchTerm.toLowerCase())) ||
        v.sound?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
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

  const handleExportPDF = () => {
    // Simular exportación - en producción se usaría una librería como jsPDF
    alert('Funcionalidad de exportación a PDF - Próximamente disponible en plan Pro')
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-500" />
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-500" />
    return null
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const totals = {
    views: filteredVideos.reduce((sum, v) => sum + v.views, 0),
    likes: filteredVideos.reduce((sum, v) => sum + v.likes, 0),
    comments: filteredVideos.reduce((sum, v) => sum + v.comments, 0),
    shares: filteredVideos.reduce((sum, v) => sum + v.shares, 0),
    avgEngagement: filteredVideos.length > 0
      ? filteredVideos.reduce((sum, v) => sum + v.engagement_rate, 0) / filteredVideos.length * 100
      : 0,
    totalVideos: filteredVideos.length
  }

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
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Export PDF
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compare with</label>
                <select
                  value={comparePeriod}
                  onChange={(e) => setComparePeriod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="previous">Previous period</option>
                  <option value="last_week">Same week last month</option>
                  <option value="last_month">Last month</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by title, hashtag..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards with Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">Total Views</span>
              </div>
              {getTrendIcon(comparisonData.views.change)}
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(comparisonData.views.current)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs ${getTrendColor(comparisonData.views.change)}`}>
                {comparisonData.views.change > 0 ? '+' : ''}{comparisonData.views.change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400">vs período anterior</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500">Total Likes</span>
              </div>
              {getTrendIcon(comparisonData.likes.change)}
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(comparisonData.likes.current)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs ${getTrendColor(comparisonData.likes.change)}`}>
                {comparisonData.likes.change > 0 ? '+' : ''}{comparisonData.likes.change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400">vs período anterior</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500">Total Shares</span>
              </div>
              {getTrendIcon(comparisonData.shares.change)}
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(comparisonData.shares.current)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs ${getTrendColor(comparisonData.shares.change)}`}>
                {comparisonData.shares.change > 0 ? '+' : ''}{comparisonData.shares.change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400">vs período anterior</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 shadow-sm text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs text-blue-100">Engagement Rate</span>
              </div>
              {comparisonData.engagement.change > 0 ? <ArrowUp className="w-4 h-4 text-green-300" /> : <ArrowDown className="w-4 h-4 text-red-300" />}
            </div>
            <p className="text-2xl font-bold">{comparisonData.engagement.current.toFixed(1)}%</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs ${comparisonData.engagement.change > 0 ? 'text-green-300' : 'text-red-300'}`}>
                {comparisonData.engagement.change > 0 ? '+' : ''}{comparisonData.engagement.change.toFixed(1)}%
              </span>
              <span className="text-xs text-blue-100">vs período anterior</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Views Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Views Trend</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Proyección 30d:</span>
                <span className="text-sm font-semibold text-blue-600">{formatNumber(chartData.predictions.views30d)}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData.viewsTrend}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip formatter={(value: any) => formatNumber(value)} />
                <Area type="monotone" dataKey="views" stroke="#3B82F6" fill="url(#viewsGradient)" />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
              <span>📊 Confianza predictiva: {chartData.predictions.confidence}%</span>
              <span>📈 Proyección 7d: {formatNumber(chartData.predictions.views7d)}</span>
            </div>
          </div>

          {/* Engagement Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Engagement Trend</h3>
              <Target className="w-4 h-4 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ReLineChart data={chartData.engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} unit="%" />
                <Tooltip formatter={(value: any) => `${value}%`} />
                <Line type="monotone" dataKey="engagement" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 4 }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement by Type (Doughnut) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Engagement by Type</h3>
              <PieChart className="w-4 h-4 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={[
                    { name: 'Likes', value: chartData.engagementByType.likes, color: '#3B82F6' },
                    { name: 'Comments', value: chartData.engagementByType.comments, color: '#10B981' },
                    { name: 'Shares', value: chartData.engagementByType.shares, color: '#8B5CF6' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => {
                    if (percent === undefined) return name
                    return `${name}: ${(percent * 100).toFixed(0)}%`
                  }}
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                  <Cell fill="#8B5CF6" />
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
            <div className="mt-3 text-center text-xs text-gray-500">
              Los shares tienen {chartData.engagementByType.shares > chartData.engagementByType.comments * 2 ? 'alto potencial viral' : 'potencial de mejora'}
            </div>
          </div>

          {/* Top Hashtags */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Top Hashtags</h3>
              <Hash className="w-4 h-4 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <ReBarChart data={chartData.hashtagsTop} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={11} width={70} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second row of charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekday Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Performance by Day</h3>
              <CalendarIcon className="w-4 h-4 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <ReBarChart data={chartData.weekdayPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} unit="%" />
                <Tooltip formatter={(value: any) => `${value}%`} />
                <Bar dataKey="avgEngagement" name="Engagement (%)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
            <div className="mt-3 text-center text-xs text-gray-500">
              {chartData.weekdayPerformance.reduce((best, current) => 
                current.avgEngagement > best.avgEngagement ? current : best, 
                { day: '', avgEngagement: 0 }).day && (
                <>📌 Mejor día: <strong>{chartData.weekdayPerformance.reduce((best, current) => 
                  current.avgEngagement > best.avgEngagement ? current : best).day}</strong></>
              )}
            </div>
          </div>

          {/* Duration Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Duration Distribution</h3>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={chartData.durationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => {
                    if (percent === undefined) return name
                    return `${name}: ${(percent * 100).toFixed(0)}%`
                  }}
                >
                  {chartData.durationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap Section (toggle) */}
        <div className="mb-8">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="flex items-center justify-between w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-gray-900">Optimal Posting Times</h3>
                <p className="text-sm text-gray-500">Heatmap of best hours and days to publish</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showHeatmap ? 'rotate-180' : ''}`} />
          </button>
          
          {showHeatmap && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mt-2 shadow-sm">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    <div className="text-xs text-gray-400 font-medium">Hora\Día</div>
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                      <div key={day} className="text-xs text-gray-400 font-medium text-center">{day}</div>
                    ))}
                  </div>
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
                      <div className="text-xs text-gray-500 font-medium">{hour}:00</div>
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, dayIdx) => {
                        const cell = chartData.hourlyHeatmap.find(h => h.day === day && h.hour === `${hour}:00`)
                        const intensity = cell ? Math.min(100, cell.engagement * 10) : 0
                        return (
                          <div 
                            key={`${day}-${hour}`}
                            className="text-center text-xs py-2 rounded transition-all"
                            style={{ 
                              backgroundColor: intensity > 70 ? '#1E40AF' : 
                                              intensity > 40 ? '#3B82F6' : 
                                              intensity > 20 ? '#93C5FD' : 
                                              intensity > 5 ? '#DBEAFE' : '#F3F4F6',
                              color: intensity > 40 ? 'white' : '#374151'
                            }}
                            title={`${day} ${hour}:00 - Engagement: ${cell?.engagement || 0}%`}
                          >
                            {cell?.engagement > 0 ? `${cell.engagement}%` : '-'}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-center text-xs text-gray-500">
                🟦 Mayor intensidad = mejor engagement | Basado en {filteredVideos.length} videos
              </div>
            </div>
          )}
        </div>

        {/* Alerts Section */}
        {chartData.alerts.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="flex items-center justify-between w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-semibold text-gray-900">Intelligent Alerts</h3>
                  <p className="text-sm text-gray-500">{chartData.alerts.length} insights detected</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showAlerts ? 'rotate-180' : ''}`} />
            </button>
            
            {showAlerts && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 mt-2 shadow-sm">
                <div className="space-y-3">
                  {chartData.alerts.map((alert, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{alert}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cohorts Section */}
        {chartData.cohorts.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowCohorts(!showCohorts)}
              className="flex items-center justify-between w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-semibold text-gray-900">Cohort Analysis</h3>
                  <p className="text-sm text-gray-500">Compare performance by video duration</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCohorts ? 'rotate-180' : ''}`} />
            </button>
            
            {showCohorts && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 mt-2 shadow-sm overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Videos</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Views</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Engagement</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.cohorts.map((cohort, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{cohort.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 text-center">{cohort.videos}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 text-right">{formatNumber(cohort.avgViews)}</td>
                        <td className="py-3 px-4 text-sm text-right">
                          <span className={`font-medium ${cohort.avgEngagement > 5 ? 'text-green-600' : cohort.avgEngagement > 2 ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {cohort.avgEngagement}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {cohort.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 inline" />}
                          {cohort.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 inline" />}
                          {cohort.trend === 'stable' && <div className="w-4 h-0.5 bg-gray-400 inline-block"></div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 text-xs text-gray-400 text-center">
                  Los videos de duración óptima generan hasta {Math.max(...chartData.cohorts.map(c => c.avgEngagement)).toFixed(1)}% engagement
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Performance Table */}
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