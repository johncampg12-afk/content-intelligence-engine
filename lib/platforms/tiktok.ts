export class TikTokAPI {
  private accessToken: string
  
  constructor(accessToken: string) {
    this.accessToken = accessToken
  }
  
  updateToken(newToken: string) {
    this.accessToken = newToken
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
  
  async getUserVideos(maxCount: number = 20) {
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

    while (hasMore && allVideos.length < maxCount) {
      const remaining = maxCount - allVideos.length
      const fetchCount = Math.min(20, remaining)

      const url = `https://open.tiktokapis.com/v2/video/list/?fields=${fields}&max_count=${fetchCount}&cursor=${cursor}`

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
        // Loggear el primer video para ver su estructura
        if (allVideos.length === 0 && data.data.videos.length > 0) {
          console.log('Sample video from TikTok:', JSON.stringify(data.data.videos[0], null, 2))
        }
        allVideos.push(...data.data.videos)
        cursor = data.data.cursor || 0
        hasMore = data.data.has_more || false
      } else {
        hasMore = false
      }
    }

    return allVideos
  }
  
  async getVideoInsights(videoId: string) {
    const fields = [
      'view_count',
      'like_count',
      'comment_count',
      'share_count',
      'reach_count',
      'avg_watch_time_seconds',
      'total_time_watched_seconds'
    ].join(',')
    
    const url = `https://open.tiktokapis.com/v2/video/insights/?video_id=${videoId}&fields=${fields}`
    
    console.log(`Fetching insights for video ${videoId}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    })
    
    const responseText = await response.text()
    
    if (!response.ok) {
      console.error(`Insights error for ${videoId}:`, response.status, responseText)
      return null
    }
    
    const data = JSON.parse(responseText)
    return data.data
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
    
    if (!data.access_token) {
      console.error('Refresh token error:', data)
      throw new Error('Failed to refresh token')
    }
    
    return data
  }
}