import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    
    // Obtener videos sin thumbnail
    const { data: videos } = await supabase
      .from('videos')
      .select('id, platform_video_id, metadata')
      .eq('user_id', userId)
      .eq('platform', 'tiktok')
      .is('thumbnail_url', null)
    
    let updated = 0
    
    for (const video of videos) {
      let newThumbnail = null
      
      if (video.metadata?.cover_image_url) {
        newThumbnail = video.metadata.cover_image_url
      } else if (video.platform_video_id) {
        newThumbnail = `https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/${video.platform_video_id}~tplv-tiktokx.jpeg`
      }
      
      if (newThumbnail) {
        await supabase
          .from('videos')
          .update({ thumbnail_url: newThumbnail })
          .eq('id', video.id)
        updated++
      }
    }
    
    return NextResponse.json({ success: true, updated })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}