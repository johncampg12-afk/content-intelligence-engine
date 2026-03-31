'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { TikTokIcon, InstagramIcon, FacebookIcon, XIcon } from '@/components/ui/social-icons'

interface VideoDetail {
  id: string
  title: string
  description: string
  platform: string
  platform_video_id: string
  thumbnail_url: string
  duration: number
  published_at: string
  metadata: any
  video_metrics: {
    id: string
    views: number
    likes: number
    comments: number
    shares: number
    saves: number
    reach: number
    avg_watch_time: number
    avg_watch_percentage: number
    engagement_rate: number
    recorded_at: string
  }[]
}

export default function VideoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const videoId = params.id as string
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadVideoDetail()
  }, [videoId])

  const loadVideoDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select(`
          *,
          video_metrics (
            id,
            views,
            likes,
            comments,
            shares,
            saves,
            reach,
            avg_watch_time,
            avg_watch_percentage,
            engagement_rate,
            recorded_at
          )
        `)
        .eq('id', videoId)
        .single()
      
      if (videoError) {
        console.error('Error fetching video:', videoError)
        setError(videoError.message)
      } else {
        // Ordenar métricas por fecha
        const sortedMetrics = videoData.video_metrics?.sort((a: any, b: any) => 
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
        ) || []
        
        setVideo({ ...videoData, video_metrics: sortedMetrics })
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatNumber = (num: number) => {
    if (!num) return '0'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tiktok': return TikTokIcon
      case 'instagram': return InstagramIcon
      case 'facebook': return FacebookIcon
      case 'x': return XIcon
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video details...</p>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error: {error || 'Video not found'}</p>
          <button
            onClick={() => router.push('/content')}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Back to Content
          </button>
        </div>
      </div>
    )
  }

  const PlatformIcon = getPlatformIcon(video.platform)
  const latestMetrics = video.video_metrics[video.video_metrics.length - 1]
  const firstMetrics = video.video_metrics[0]
  
  // Calcular cambios
  const viewsChange = latestMetrics && firstMetrics 
    ? ((latestMetrics.views - firstMetrics.views) / firstMetrics.views * 100).toFixed(1)
    : null

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-6 text-gray-500 hover:text-gray-700 flex items-center gap-2"
      >
        ← Back to Content
      </button>

      {/* Video Header */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Thumbnail */}
        <div className="relative aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title || 'Video thumbnail'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No thumbnail available
            </div>
          )}
          
          {video.duration > 0 && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Video Info */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            {PlatformIcon && <PlatformIcon className="w-6 h-6" />}
            <span className="text-sm text-gray-500 uppercase">{video.platform}</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">
              {new Date(video.published_at).toLocaleDateString()}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {video.title || 'Untitled'}
          </h1>
          
          {video.description && (
            <p className="text-gray-600 mb-6 line-clamp-3">
              {video.description}
            </p>
          )}
          
          {/* Video link */}
          {video.metadata?.share_url && (
            <a
              href={video.metadata.share_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              View on {video.platform} →
            </a>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      {latestMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(latestMetrics.views)}
            </p>
            <p className="text-sm text-gray-500">Views</p>
            {viewsChange && (
              <p className={`text-xs ${Number(viewsChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Number(viewsChange) >= 0 ? '↑' : '↓'} {Math.abs(Number(viewsChange))}%
              </p>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(latestMetrics.likes)}
            </p>
            <p className="text-sm text-gray-500">Likes</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(latestMetrics.comments)}
            </p>
            <p className="text-sm text-gray-500">Comments</p>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(latestMetrics.shares)}
            </p>
            <p className="text-sm text-gray-500">Shares</p>
          </div>
        </div>
      )}

      {/* All Metrics Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Historical Metrics</h2>
          <p className="text-sm text-gray-500">All recorded metrics over time</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Likes</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Comments</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Shares</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reach</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {video.video_metrics.map((metric) => (
                <tr key={metric.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(metric.recorded_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatNumber(metric.views)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatNumber(metric.likes)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatNumber(metric.comments)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatNumber(metric.shares)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatNumber(metric.reach)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {(metric.engagement_rate * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}