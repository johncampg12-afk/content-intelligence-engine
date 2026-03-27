'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Video {
  id: string
  title: string
  platform: string
  platform_video_id: string
  thumbnail_url: string
  published_at: string
}

export default function ContentPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadUserAndVideos()
  }, [])

  const loadUserAndVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener usuario
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please login')
        setLoading(false)
        return
      }
      
      setUserId(user.id)
      
      // Obtener videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('published_at', { ascending: false })
        .limit(20)
      
      if (videosError) {
        console.error('Error fetching videos:', videosError)
        setError(videosError.message)
      } else {
        setVideos(videosData || [])
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error: {error}</p>
          <button
            onClick={loadUserAndVideos}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content</h1>
          <p className="text-gray-600 mt-1">
            Your synced videos from TikTok
          </p>
        </div>
        <button
          onClick={syncVideos}
          disabled={syncing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No videos synced yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Click the "Sync Now" button to fetch your TikTok videos
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden">
              {video.thumbnail_url && (
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title || 'Video thumbnail'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                  {video.title || 'Untitled'}
                </h3>
                <p className="text-xs text-gray-500">
                  {new Date(video.published_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Platform: {video.platform}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}