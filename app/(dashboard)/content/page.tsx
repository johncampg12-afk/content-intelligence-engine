import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

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
  
  // Verificar si hay cuenta de TikTok conectada
  const { data: tiktokAccount } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('user_id', user?.id)
    .eq('platform', 'tiktok')
    .single()
  
  // Obtener videos
  const { data: videos, error: videosError } = await supabase
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
  
  console.log('Videos found:', videos?.length)
  console.log('Videos error:', videosError)
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Content</h1>
        <p className="text-gray-600 mt-1">
          Your synced videos from connected platforms
        </p>
      </div>
      
      {!tiktokAccount ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No TikTok account connected</p>
          <Link href="/settings" className="text-blue-600 hover:underline">
            Connect your TikTok account
          </Link>
        </div>
      ) : !videos || videos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No videos synced yet</p>
          <p className="text-sm text-gray-400">
            We're syncing your videos. This may take a few minutes.
          </p>
          <button 
            onClick={async () => {
              const res = await fetch('/api/cron/sync-tiktok', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id })
              })
              const data = await res.json()
              console.log('Sync result:', data)
              window.location.reload()
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sync Now
          </button>
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