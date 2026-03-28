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
  // Probar diferentes URLs
  const urls = [
    'https://open.tiktokapis.com/v2/video/list/',
    'https://open.tiktokapis.com/video/list/',
    'https://open-api.tiktok.com/video/list/'
  ]
  
  for (const url of urls) {
    console.log('Trying URL:', url)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_count: maxCount,
          fields: ['id', 'title']
        }),
      })
      
      const text = await response.text()
      console.log(`Response from ${url}:`, response.status, text.substring(0, 200))
      
      if (response.ok && !text.includes('Unsupported')) {
        const data = JSON.parse(text)
        return data.data?.videos || []
      }
    } catch (e) {
      console.error(`Error with ${url}:`, e)
    }
  }
  
    throw new Error('Could not fetch videos from TikTok')
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