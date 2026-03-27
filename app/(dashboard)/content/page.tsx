import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Image from 'next/image'

export default async function ContentPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle error
          }
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Obtener videos con sus últimas métricas
  const { data: videos } = await supabase
    .from('videos')
    .select(`
      *,
      video_metrics (
        views,
        likes,
        comments,
        shares,
        saves,
        recorded_at
      )
    `)
    .eq('user_id', user?.id)
    .order('published_at', { ascending: false })
    .limit(20)
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Content</h1>
        <p className="text-gray-600 mt-1">
          Your synced videos from connected platforms
        </p>
      </div>
      
      {!videos || videos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No videos synced yet</p>
          <p className="text-sm text-gray-400">
            Connect your TikTok account and we'll automatically sync your videos
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const latestMetrics = video.video_metrics?.[0]
            const engagementRate = latestMetrics?.views 
              ? ((latestMetrics.likes + latestMetrics.comments + latestMetrics.shares) / latestMetrics.views * 100).toFixed(1)
              : 0
            
            return (
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
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(video.published_at).toLocaleDateString()}
                  </p>
                  {latestMetrics && (
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {latestMetrics.views?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-gray-500">Views</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {latestMetrics.likes?.toLocaleString() || 0}
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}