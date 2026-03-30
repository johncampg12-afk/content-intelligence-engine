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
  
  async getUserVideos(maxCount: number = 20, cursor: number = 0) {
    const fields = [
      'id',
      'title',
      'description',
      'create_time',
      'cover_image_url',
      'share_url',
      'video_url',
      'duration',
      'view_count',
      'like_count',
      'comment_count',
      'share_count',
      'download_count',
      'music_info'
    ].join(',')
    
    const url = `https://open.tiktokapis.com/v2/video/list/?fields=${fields}&max_count=${maxCount}&cursor=${cursor}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    return data
  }
  
  async getAllUserVideos() {
    let allVideos: any[] = []
    let cursor = 0
    let hasMore = true
    
    while (hasMore) {
      console.log(`Fetching videos with cursor: ${cursor}`)
      const response = await this.getUserVideos(20, cursor)
      
      const videos = response.data?.videos || []
      allVideos = [...allVideos, ...videos]
      
      hasMore = response.data?.has_more || false
      cursor = response.data?.cursor || 0
      
      console.log(`Fetched ${videos.length} videos, total: ${allVideos.length}, hasMore: ${hasMore}`)
      
      // Evitar loop infinito por si acaso
      if (videos.length === 0) break
    }
    
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