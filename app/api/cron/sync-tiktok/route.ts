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
    const url = 'https://open.tiktokapis.com/v2/video/list/'
    
    // Los fields deben ser un array en el body
    const body = {
      max_count: maxCount,
      fields: [
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
      ]
    }
    
    console.log('Fetching videos from TikTok API...')
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const responseText = await response.text()
    console.log('Response status:', response.status)
    console.log('Response text:', responseText.substring(0, 500))
    
    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status} - ${responseText}`)
    }
    
    const data = JSON.parse(responseText)
    
    if (data.error) {
      console.error('TikTok API error response:', data.error)
      throw new Error(`TikTok API error: ${data.error.code} - ${data.error.message}`)
    }
    
    return data.data?.videos || []
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