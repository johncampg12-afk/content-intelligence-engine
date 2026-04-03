'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProfileUpdatedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    const checkSession = async () => {
      console.log('Checking session, attempt:', attempts + 1)
      
      // Verificar sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('Session exists:', !!session)
      
      if (session) {
        console.log('Session found, redirecting to settings')
        router.push('/dashboard/settings?success=profile_updated')
        return
      }
      
      // Si no hay sesión, intentar refrescar
      if (attempts < 3) {
        console.log('No session, attempting refresh...')
        const { data: { session: refreshed }, error: refreshError } = await supabase.auth.refreshSession()
        
        console.log('Refresh result:', !!refreshed)
        
        if (refreshed) {
          console.log('Session refreshed, redirecting')
          router.push('/dashboard/settings?success=profile_updated')
          return
        }
      }
      
      // Después de 3 intentos, ir a login
      if (attempts >= 2) {
        console.log('Max attempts reached, redirecting to login')
        setError('Session lost. Please login again.')
        setTimeout(() => {
          router.push('/login?error=session_lost')
        }, 2000)
        return
      }
      
      // Esperar y reintentar
      setAttempts(prev => prev + 1)
      setTimeout(checkSession, 2000)
    }
    
    checkSession()
  }, [router, supabase, attempts])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Profile updated! Redirecting...</p>
        <p className="text-sm text-gray-400 mt-2">Attempt {attempts + 1}/3</p>
      </div>
    </div>
  )
}