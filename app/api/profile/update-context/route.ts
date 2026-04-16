import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const accountBio = formData.get('account_bio')
  const currentPhase = formData.get('current_phase')
  const mainStruggle = formData.get('main_struggle')

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const updateData: any = {}
  if (accountBio) updateData.account_bio = accountBio as string
  if (currentPhase) updateData.current_phase = currentPhase as string
  if (mainStruggle) updateData.main_struggle = mainStruggle as string

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    console.error('Error updating context:', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=context_update_failed', request.url))
  }

  return NextResponse.redirect(new URL('/dashboard/settings?success=context_updated', request.url))
}