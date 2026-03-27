export interface TikTokVideo {
  id: string
  title: string
  description: string
  create_time: number
  cover_image_url: string
  share_url: string
  video_url: string
  duration: number
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  download_count: number
  music_info: {
    id: string
    title: string
    author: string
    cover_url: string
  }
}

export interface TikTokVideoInsights {
  video_id: string
  views: number
  likes: number
  comments: number
  shares: number
  reach: number
  avg_watch_time: number
  total_time_watched: number
  followers_gained: number
}

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
  
  async getUserVideos(maxCount: number = 20) {
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
    
    const response = await fetch(
      `https://open.tiktokapis.com/v2/video/list/?fields=${fields}&max_count=${maxCount}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )
    
    const data = await response.json()
    console.log('TikTok videos response:', JSON.stringify(data, null, 2))
    return data.data?.videos || []
  }
  
  async getVideoInsights(videoId: string) {
    const fields = [
      'views',
      'likes',
      'comments',
      'shares',
      'reach',
      'avg_watch_time',
      'total_time_watched',
      'followers_gained'
    ].join(',')
    
    const response = await fetch(
      `https://open.tiktokapis.com/v2/video/insights/?video_id=${videoId}&fields=${fields}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    )
    
    const data = await response.json()
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
    return data
  }
}