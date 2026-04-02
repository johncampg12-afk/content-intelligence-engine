import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const accountTypeId = formData.get('account_type_id')
  const contentGoal = formData.get('content_goal')
  const targetAudience = formData.get('target_audience')

  const cookieStore = await cookies()
  
  // Crear un response que vamos a modificar
  let response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('User error:', userError)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const updateData: any = {}
  if (accountTypeId && accountTypeId !== '') {
    updateData.account_type_id = parseInt(accountTypeId as string)
  }
  if (contentGoal && contentGoal !== '') {
    updateData.content_goal = contentGoal as string
  }
  if (targetAudience && targetAudience !== '') {
    updateData.target_audience = targetAudience as string
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    response = NextResponse.redirect(new URL('/dashboard/settings?error=profile_update_failed', request.url))
    return response
  }

  // Redirigir con éxito
  response = NextResponse.redirect(new URL('/dashboard/settings?success=profile_updated', request.url))
  return response
}