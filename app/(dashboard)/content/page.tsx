import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function ContentPage() {
  try {
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
    
    if (!user) {
      return <div>Please login</div>
    }
    
    // Obtener videos
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .limit(10)
    
    if (error) {
      console.error('Error fetching videos:', error)
      return <div>Error loading videos: {error.message}</div>
    }
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Content</h1>
        <p className="mb-4">User ID: {user.id}</p>
        <p className="mb-4">Total videos: {videos?.length || 0}</p>
        
        {videos && videos.length > 0 ? (
          <div className="grid gap-4">
            {videos.map((video) => (
              <div key={video.id} className="border p-4 rounded">
                <p><strong>Title:</strong> {video.title || 'Untitled'}</p>
                <p><strong>Platform:</strong> {video.platform}</p>
                <p><strong>Published:</strong> {new Date(video.published_at).toLocaleDateString()}</p>
                {video.thumbnail_url && (
                  <img src={video.thumbnail_url} alt="thumbnail" className="w-32 h-32 object-cover mt-2" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 p-8 bg-gray-100 rounded text-center">
            <p className="mb-4">No videos found</p>
            <button 
              onClick={async () => {
                const res = await fetch('/api/cron/sync-tiktok', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user.id })
                })
                const data = await res.json()
                console.log('Sync result:', data)
                window.location.reload()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sync TikTok Videos
            </button>
          </div>
        )}
      </div>
    )
  } catch (err) {
    console.error('Page error:', err)
    return <div>Error: {err instanceof Error ? err.message : 'Unknown error'}</div>
  }
}