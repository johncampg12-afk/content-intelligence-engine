import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('=== DEBUG CALLBACK RECEIVED ===')
  console.log('URL:', request.url)
  console.log('All params:', Object.fromEntries(request.nextUrl.searchParams))
  
  return NextResponse.json({
    message: 'Debug endpoint works',
    params: Object.fromEntries(request.nextUrl.searchParams),
    timestamp: new Date().toISOString()
  })
}