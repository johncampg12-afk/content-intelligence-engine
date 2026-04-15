import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handle error
            }
          },
        },
      }
    )
    
    // Obtener videos sin thumbnail
    const { data: videos, error: fetchError } = await supabase
      .from('videos')
      .select('id, platform_video_id, metadata')
      .eq('user_id', userId)
      .eq('platform', 'tiktok')
      .is('thumbnail_url', null)
    
    if (fetchError) {
      console.error('Error fetching videos:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    if (!videos || videos.length === 0) {
      return NextResponse.json({ success: true, updated: 0, message: 'No videos without thumbnails found' })
    }
    
    let updated = 0
    
    for (const video of videos) {
      let newThumbnail: string | null = null
      
      if (video.metadata?.cover_image_url) {
        newThumbnail = video.metadata.cover_image_url
      } else if (video.metadata?.cover_url) {
        newThumbnail = video.metadata.cover_url
      } else if (video.platform_video_id) {
        newThumbnail = `https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/${video.platform_video_id}~tplv-tiktokx.jpeg`
      }
      
      if (newThumbnail) {
        const { error: updateError } = await supabase
          .from('videos')
          .update({ thumbnail_url: newThumbnail })
          .eq('id', video.id)
        
        if (!updateError) {
          updated++
          console.log(`Updated thumbnail for video ${video.id}`)
        } else {
          console.error(`Failed to update video ${video.id}:`, updateError)
        }
      }
    }
    
    return NextResponse.json({ success: true, updated })
    
  } catch (error) {
    console.error('Fix thumbnails error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}