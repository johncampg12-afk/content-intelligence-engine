import { NextResponse } from 'next/server'

export async function GET() {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_ID!,
    redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
    scope: 'user.info.basic,video.list',
    response_type: 'code',
    state: Math.random().toString(36).substring(7),
  })

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  
  return NextResponse.redirect(authUrl)
}