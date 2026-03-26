import { NextResponse } from 'next/server'

export async function GET() {
  console.log('TikTok OAuth endpoint called')
  
  const clientId = process.env.TIKTOK_CLIENT_ID
  const redirectUri = process.env.TIKTOK_REDIRECT_URI
  
  console.log('Client ID exists:', !!clientId)
  console.log('Redirect URI:', redirectUri)
  
  if (!clientId) {
    console.error('Missing TIKTOK_CLIENT_ID')
    return NextResponse.json({ error: 'Missing client ID' }, { status: 500 })
  }
  
  const params = new URLSearchParams({
    client_key: clientId,
    redirect_uri: redirectUri!,
    scope: 'user.info.basic',
    response_type: 'code',
    state: Math.random().toString(36).substring(7),
  })

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  console.log('Redirecting to:', authUrl)
  
  return NextResponse.redirect(authUrl)
}