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
    
    // Usar solo el campo 'id' para probar
    const fields = 'id'
    
    const body = {
      max_count: maxCount,
      fields: fields
    }
    
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
    console.log('Response:', responseText.substring(0, 500))
    
    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status} - ${responseText}`)
    }
    
    const data = JSON.parse(responseText)
    
    if (data.error) {
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