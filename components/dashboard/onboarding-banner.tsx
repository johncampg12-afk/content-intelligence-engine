'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Target, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface OnboardingBannerProps {
  onComplete?: () => void
}

export function OnboardingBanner({ onComplete }: OnboardingBannerProps) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkProfile()
  }, [])

  const checkProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('account_type_id, content_goal, target_audience, account_bio, current_phase, main_struggle')
        .eq('id', user.id)
        .single()

      setProfile(profileData)
    } catch (error) {
      console.error('Error checking profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Verificar si el perfil está completo
  const isProfileComplete = () => {
    if (!profile) return false
    return !!(
      profile.account_type_id &&
      profile.content_goal &&
      profile.target_audience &&
      profile.account_bio &&
      profile.current_phase &&
      profile.main_struggle
    )
  }

  const missingFields = []
  if (!profile?.account_type_id) missingFields.push('Content Niche')
  if (!profile?.content_goal) missingFields.push('Main Goal')
  if (!profile?.target_audience) missingFields.push('Target Audience')
  if (!profile?.account_bio) missingFields.push('Creator Bio')
  if (!profile?.current_phase) missingFields.push('Current Phase')
  if (!profile?.main_struggle) missingFields.push('Main Struggle')

  if (loading || dismissed || isProfileComplete()) {
    return null
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg overflow-hidden">
      <div className="relative p-6">
        {/* Botón cerrar */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              ¡Completa tu perfil para recomendaciones personalizadas!
            </h3>
            <p className="text-blue-100 text-sm mb-4">
              La IA necesita conocer tu nicho, objetivo y audiencia para generar análisis precisos.
              Te llevará menos de 2 minutos.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {missingFields.map((field) => (
                <span key={field} className="px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                  {field}
                </span>
              ))}
            </div>

            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              Completar perfil ahora
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}