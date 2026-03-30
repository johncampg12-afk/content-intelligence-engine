export class TikTokAPI {
  private accessToken: string
  
  constructor(accessToken: string) {
    this.accessToken = accessToken
  }
  
  async getUserInfo() {
    const response = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=id,username,display_name,avatar_url,bio_description,follower_count,following_count,video_count',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )
    
    const data = await response.json()
    return data
  }
  
  async getUserVideos(maxCount: number = 50) {
  const allVideos: any[] = []
  let cursor = 0
  let hasMore = true
  
  const fields = [
    'id',
    'title',
    'create_time',
    'cover_image_url',
    'share_url',
    'duration',
    'view_count',
    'like_count',
    'comment_count',
    'share_count'
  ].join(',')
  
  // Solo obtener los primeros 'maxCount' videos (por defecto 20)
  while (hasMore && allVideos.length < maxCount) {
    const remaining = maxCount - allVideos.length
    const fetchCount = Math.min(20, remaining)
    
    const url = `https://open.tiktokapis.com/v2/video/list/?fields=${fields}&max_count=${fetchCount}&cursor=${cursor}`
    
    console.log(`Fetching videos with cursor: ${cursor}, max_count: ${fetchCount}`)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    const responseText = await response.text()
    
    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status} - ${responseText}`)
    }
    
    const data = JSON.parse(responseText)
    
    if (data.data?.videos && Array.isArray(data.data.videos)) {
      allVideos.push(...data.data.videos)
      cursor = data.data.cursor || 0
      hasMore = data.data.has_more || false
      console.log(`Fetched ${data.data.videos.length} videos, total: ${allVideos.length}`)
    } else {
      hasMore = false
    }
  }
  
  console.log(`Total videos fetched: ${allVideos.length}`)
  return allVideos
}
  
  async refreshToken(refreshToken: string) {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_ID!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      })
    })
    
    const data = await response.json()
    return data
  }
}