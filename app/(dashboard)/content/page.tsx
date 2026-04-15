'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { TikTokIcon, InstagramIcon, FacebookIcon, XIcon } from '@/components/ui/social-icons'
import { Video, ImageOff } from 'lucide-react'

interface Video {
  id: string
  title: string
  platform: string
  platform_video_id: string
  thumbnail_url: string
  duration: number
  published_at: string
  metadata?: {
    cover_url?: string
    video_url?: string
    share_url?: string
    cover_image_url?: string
  }
  video_metrics?: {
    views: number
    likes: number
    comments: number
    shares: number
    saves: number
    engagement_rate: number
  }[]
}

export default function ContentPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  
  const supabase = createClient()

  // Plataformas disponibles
  const platforms = [
    { id: 'all', name: 'All', icon: null },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon },
    { id: 'instagram', name: 'Instagram', icon: InstagramIcon },
    { id: 'facebook', name: 'Facebook', icon: FacebookIcon },
    { id: 'x', name: 'X', icon: XIcon },
  ]

  useEffect(() => {
    loadUserAndVideos()
  }, [selectedPlatform])

  const loadUserAndVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please login')
        setLoading(false)
        return
      }
      
      setUserId(user.id)
      
      // Construir query
      let query = supabase
        .from('videos')
        .select(`
          *,
          video_metrics (
            views,
            likes,
            comments,
            shares,
            saves,
            engagement_rate,
            recorded_at
          )
        `)
        .eq('user_id', user.id)
        .order('published_at', { ascending: false })
      
      // Filtrar por plataforma si no es 'all'
      if (selectedPlatform !== 'all') {
        query = query.eq('platform', selectedPlatform)
      }
      
      const { data: videosData, error: videosError } = await query
      
      if (videosError) {
        console.error('Error fetching videos:', videosError)
        setError(videosError.message)
      } else {
        // Procesar videos para obtener la métrica más reciente
        const processedVideos = videosData?.map(video => ({
          ...video,
          video_metrics: video.video_metrics?.sort((a: any, b: any) => 
            new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
          )
        })) || []
        
        setVideos(processedVideos)
        setFailedImages(new Set())
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const syncVideos = async () => {
    if (!userId) return
    
    try {
      setSyncing(true)
      setError(null)
      
      const response = await fetch('/api/cron/sync-tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      const data = await response.json()
      console.log('Sync result:', data)
      
      // Recargar videos después de sincronizar
      await loadUserAndVideos()
      
    } catch (err) {
      console.error('Sync error:', err)
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
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

  // Obtener la mejor URL de thumbnail disponible
  const getThumbnailUrl = (video: Video): string | null => {
    // Priorizar thumbnail_url
    if (video.thumbnail_url && video.thumbnail_url.trim() !== '') {
      return video.thumbnail_url
    }
    // Intentar con cover_url del metadata
    if (video.metadata?.cover_url && video.metadata.cover_url.trim() !== '') {
      return video.metadata.cover_url
    }
    // Intentar con cover_image_url del metadata
    if (video.metadata?.cover_image_url && video.metadata.cover_image_url.trim() !== '') {
      return video.metadata.cover_image_url
    }
    return null
  }

  // Construir URL con proxy para evitar problemas de CORS y expiración
  const getProxiedImageUrl = (originalUrl: string): string => {
    if (!originalUrl) return ''
    // Si ya es una URL de nuestro proxy, devolverla directamente
    if (originalUrl.includes('/api/proxy/image')) {
      return originalUrl
    }
    return `/api/proxy/image?url=${encodeURIComponent(originalUrl)}`
  }

  // Manejar error de carga de imagen
  const handleImageError = (videoId: string) => {
    setFailedImages(prev => new Set(prev).add(videoId))
  }

  // Verificar si la imagen falló para este video
  const hasImageFailed = (videoId: string): boolean => {
    return failedImages.has(videoId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
          <p className="text-gray-600 mt-1">
            Your videos from connected social media platforms
          </p>
        </div>
        <button
          onClick={syncVideos}
          disabled={syncing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {syncing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Syncing...
            </>
          ) : (
            <>Sync Now</>
          )}
        </button>
      </div>

      {/* Platform Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {platforms.map((platform) => {
          const Icon = platform.icon
          const isActive = selectedPlatform === platform.id
          
          return (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors
                ${isActive 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {platform.name}
              {isActive && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                  {videos.filter(v => platform.id === 'all' || v.platform === platform.id).length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
          <p>Error: {error}</p>
          <button
            onClick={loadUserAndVideos}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No videos found</p>
          <p className="text-sm text-gray-400 mb-4">
            {selectedPlatform === 'all' 
              ? 'Connect your social media accounts and click "Sync Now" to fetch your videos'
              : `No videos from ${selectedPlatform}. Connect your account and sync.`
            }
          </p>
          {selectedPlatform !== 'all' && (
            <Link href="/settings" className="text-blue-600 hover:underline">
              Connect {selectedPlatform} account
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => {
            const latestMetrics = video.video_metrics?.[0]
            const engagementRate = latestMetrics?.engagement_rate 
              ? (latestMetrics.engagement_rate * 100).toFixed(1)
              : latestMetrics?.views 
                ? ((latestMetrics.likes + latestMetrics.comments + latestMetrics.shares) / latestMetrics.views * 100).toFixed(1)
                : '0'
            
            const thumbnailUrl = getThumbnailUrl(video)
            const imageFailed = hasImageFailed(video.id)
            
            return (
              <Link
                key={video.id}
                href={`/content/${video.id}`}
                className="group bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 overflow-hidden block"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[9/16] bg-gray-100">
                  {thumbnailUrl && !imageFailed ? (
                    <img
                      src={getProxiedImageUrl(thumbnailUrl)}
                      alt={video.title || 'Video thumbnail'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                      onError={() => handleImageError(video.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100 gap-2">
                      <ImageOff className="w-8 h-8" />
                      <span className="text-xs">No thumbnail</span>
                    </div>
                  )}
                  
                  {/* Duration badge */}
                  {video.duration > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                  
                  {/* Platform badge */}
                  <div className="absolute top-2 left-2 bg-black/70 rounded-full p-1.5">
                    {video.platform === 'tiktok' && <TikTokIcon className="w-4 h-4 text-white" />}
                    {video.platform === 'instagram' && <InstagramIcon className="w-4 h-4 text-white" />}
                    {video.platform === 'facebook' && <FacebookIcon className="w-4 h-4 text-white" />}
                    {video.platform === 'x' && <XIcon className="w-4 h-4 text-white" />}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 text-sm">
                    {video.title || 'Untitled'}
                  </h3>
                  
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(video.published_at).toLocaleDateString()}
                  </p>
                  
                  {/* Metrics */}
                  {latestMetrics && (
                    <div className="grid grid-cols-3 gap-2 text-center text-sm pt-2 border-t">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatNumber(latestMetrics.views)}
                        </p>
                        <p className="text-xs text-gray-500">Views</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatNumber(latestMetrics.likes)}
                        </p>
                        <p className="text-xs text-gray-500">Likes</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {engagementRate}%
                        </p>
                        <p className="text-xs text-gray-500">Engagement</p>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}