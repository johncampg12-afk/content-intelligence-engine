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
  
  async getUserVideos(maxCount: number = 100) {
    // Campos válidos según TikTok
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
    
    const url = `https://open.tiktokapis.com/v2/video/list/?fields=${fields}&max_count=${maxCount}`
    
    console.log('Fetching videos from TikTok...')
    console.log('URL:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    const responseText = await response.text()
    console.log('Response status:', response.status)
    console.log('Response:', responseText.substring(0, 1000))
    
    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status} - ${responseText}`)
    }
    
    const data = JSON.parse(responseText)
    
    let videos = []
    if (data.data?.videos && Array.isArray(data.data.videos)) {
      videos = data.data.videos
    } else if (data.videos && Array.isArray(data.videos)) {
      videos = data.videos
    } else {
      console.error('Unexpected response structure:', JSON.stringify(data, null, 2))
      throw new Error('Unexpected response structure from TikTok')
    }
    
    console.log(`Found ${videos.length} videos`)
    
    if (videos.length > 0) {
      console.log('Sample video:', JSON.stringify(videos[0], null, 2))
    }
    
    return videos
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