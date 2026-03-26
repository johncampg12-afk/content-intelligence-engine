import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.TIKTOK_CLIENT_ID
  const redirectUri = process.env.TIKTOK_REDIRECT_URI
  
  console.log('TikTok OAuth endpoint called')
  console.log('Client ID:', clientId)
  console.log('Redirect URI:', redirectUri)
  
  if (!clientId) {
    console.error('Missing TIKTOK_CLIENT_ID')
    return NextResponse.json({ error: 'Missing client ID' }, { status: 500 })
  }
  
  // Usar la URL correcta de TikTok OAuth
  const params = new URLSearchParams({
    client_key: clientId,
    redirect_uri: redirectUri!,
    scope: 'user.info.basic',
    response_type: 'code',
  })

  const authUrl = `https://www.tiktok.com/auth/authorize/?${params.toString()}`
  console.log('Redirecting to:', authUrl)
  
  return NextResponse.redirect(authUrl)
}