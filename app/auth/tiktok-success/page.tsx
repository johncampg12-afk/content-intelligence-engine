'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function TikTokSuccessPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      // Esperar un momento para que las cookies se establezcan
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verificar si hay sesión
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Si hay sesión, redirigir a settings
        router.push('/dashboard/settings?success=tiktok_connected')
      } else {
        // Si no hay sesión, intentar refrescar
        const { data: { session: refreshed } } = await supabase.auth.refreshSession()
        if (refreshed) {
          router.push('/dashboard/settings?success=tiktok_connected')
        } else {
          // Si todo falla, ir a login
          router.push('/login?error=session_lost')
        }
      }
    }
    
    checkSession()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing connection...</p>
      </div>
    </div>
  )
}