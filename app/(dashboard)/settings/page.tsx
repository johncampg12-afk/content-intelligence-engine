'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingContext, setSavingContext] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [accountTypes, setAccountTypes] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([])
  const [formData, setFormData] = useState({
    account_type_id: '',
    content_goal: '',
    target_audience: ''
  })
  const [contextData, setContextData] = useState({
    account_bio: '',
    current_phase: 'starting',
    main_struggle: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [contextMessage, setContextMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const supabase = createClient()

  // Opciones predefinidas
  const contentGoals = [
    { value: 'monetization', label: '💰 Monetization - Generate direct revenue from content' },
    { value: 'brand_awareness', label: '📈 Brand Awareness - Increase brand visibility and recognition' },
    { value: 'community_building', label: '👥 Community Building - Create an engaged follower community' },
    { value: 'viral_growth', label: '🚀 Viral Growth - Rapid follower and view growth' },
    { value: 'lead_generation', label: '🎯 Lead Generation - Drive traffic to external business' },
    { value: 'education', label: '📚 Education - Teach and inform your audience' },
    { value: 'entertainment', label: '🎬 Entertainment - Pure entertainment and humor' },
    { value: 'influence', label: '⭐ Influence - Become a thought leader in your niche' }
  ]

  const targetAudiences = [
    { value: 'teenagers_13_17', label: '🧑 Teenagers (13-17 years old)' },
    { value: 'young_adults_18_24', label: '👩‍🎓 Young Adults (18-24 years old)' },
    { value: 'adults_25_34', label: '👨‍💼 Adults (25-34 years old)' },
    { value: 'adults_35_44', label: '👔 Adults (35-44 years old)' },
    { value: 'adults_45_plus', label: '👴 Adults (45+ years old)' },
    { value: 'entrepreneurs', label: '💼 Entrepreneurs & Business Owners' },
    { value: 'marketers', label: '📊 Marketers & Social Media Managers' },
    { value: 'creators', label: '🎨 Content Creators & Influencers' },
    { value: 'gamers', label: '🎮 Gamers & Gaming Community' },
    { value: 'fitness', label: '💪 Fitness & Wellness Enthusiasts' },
    { value: 'fashion', label: '👗 Fashion & Beauty Lovers' },
    { value: 'tech', label: '💻 Tech & Gadget Enthusiasts' },
    { value: 'foodies', label: '🍳 Foodies & Cooking Enthusiasts' },
    { value: 'travelers', label: '✈️ Travel & Adventure Lovers' },
    { value: 'parents', label: '👪 Parents & Families' },
    { value: 'students', label: '📖 Students & Academia' },
    { value: 'artists', label: '🎨 Artists & Creative Professionals' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      setUserId(user.id)
      
      // Obtener tipos de cuenta
      const { data: types } = await supabase
        .from('account_types')
        .select('*')
        .order('name')
      
      setAccountTypes(types || [])
      
      // Obtener perfil completo
      const { data: profileData } = await supabase
        .from('profiles')
        .select('account_type_id, content_goal, target_audience, account_bio, current_phase, main_struggle')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
      setFormData({
        account_type_id: profileData?.account_type_id?.toString() || '',
        content_goal: profileData?.content_goal || '',
        target_audience: profileData?.target_audience || ''
      })
      setContextData({
        account_bio: profileData?.account_bio || '',
        current_phase: profileData?.current_phase || 'starting',
        main_struggle: profileData?.main_struggle || ''
      })
      
      // Obtener cuentas conectadas
      const { data: accounts } = await supabase
        .from('connected_accounts')
        .select('*')
        .eq('user_id', user.id)
      
      setConnectedAccounts(accounts || [])
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        await loadData()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleContextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingContext(true)
    setContextMessage(null)
    
    try {
      const response = await fetch('/api/profile/update-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contextData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setContextMessage({ type: 'success', text: 'Creator context saved successfully!' })
        await loadData()
      } else {
        setContextMessage({ type: 'error', text: data.error || 'Failed to save context' })
      }
    } catch (error) {
      setContextMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setSavingContext(false)
    }
  }

  const hasTikTok = connectedAccounts?.some(a => a.platform === 'tiktok')
  const hasInstagram = connectedAccounts?.some(a => a.platform === 'instagram')
  const hasYouTube = connectedAccounts?.some(a => a.platform === 'youtube')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Configure your account and connect social media platforms
        </p>
      </div>
      
      {/* Mensaje de éxito/error para estrategia */}
      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}
      
      {/* Sección de Nicho y Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Content Strategy Configuration
          </CardTitle>
          <CardDescription>
            Define your content niche, goals, and target audience to receive personalized AI recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de cuenta */}
            <div>
              <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 mb-1">
                Content Niche *
              </label>
              <select
                id="account_type"
                value={formData.account_type_id}
                onChange={(e) => setFormData({ ...formData, account_type_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your content niche</option>
                {accountTypes?.map((type: any) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name} - {type.description}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Objetivo principal */}
            <div>
              <label htmlFor="content_goal" className="block text-sm font-medium text-gray-700 mb-1">
                Main Goal *
              </label>
              <select
                id="content_goal"
                value={formData.content_goal}
                onChange={(e) => setFormData({ ...formData, content_goal: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your main goal</option>
                {contentGoals.map((goal) => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Audiencia objetivo */}
            <div>
              <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience *
              </label>
              <select
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your target audience</option>
                {targetAudiences.map((audience) => (
                  <option key={audience.value} value={audience.value}>
                    {audience.label}
                  </option>
                ))}
              </select>
            </div>
            
            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Sección de Cuentas Conectadas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Accounts</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* TikTok Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTok
              </CardTitle>
              <CardDescription>
                Connect your TikTok account to analyze video performance and get content recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasTikTok ? (
                <div className="flex items-center justify-between">
                  <span className="text-green-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Connected
                  </span>
                  <form action="/api/oauth/tiktok/disconnect" method="post">
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Disconnect
                    </button>
                  </form>
                </div>
              ) : (
                <a href="/api/oauth/tiktok">
                  <Button className="w-full">Connect TikTok</Button>
                </a>
              )}
            </CardContent>
          </Card>
          
          {/* Instagram Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.332.014 7.052.072 5.775.13 4.788.302 3.926.79c-.885.507-1.637 1.259-2.144 2.144-.488.862-.66 1.849-.718 3.126C.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.058 1.277.23 2.264.718 3.126.507.885 1.259 1.637 2.144 2.144.862.488 1.849.66 3.126.718 1.28.058 1.689.072 4.948.072s3.668-.014 4.948-.072c1.277-.058 2.264-.23 3.126-.718.885-.507 1.637-1.259 2.144-2.144.488-.862.66-1.849.718-3.126.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.058-1.277-.23-2.264-.718-3.126-.507-.885-1.259-1.637-2.144-2.144-.862-.488-1.849-.66-3.126-.718C15.668.014 15.259 0 12 0z"/>
                  <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
                Instagram
              </CardTitle>
              <CardDescription>Coming soon - Connect Instagram to analyze Reels and posts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full opacity-50">Coming Soon</Button>
            </CardContent>
          </Card>
          
          {/* YouTube Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </CardTitle>
              <CardDescription>Coming soon - Connect YouTube to analyze video performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full opacity-50">Coming Soon</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sección de Contexto del Creador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Creator Context
          </CardTitle>
          <CardDescription>
            Cuéntanos sobre tu cuenta para recibir recomendaciones hiper-personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contextMessage && (
            <div className={`mb-4 p-3 rounded-md ${contextMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {contextMessage.text}
            </div>
          )}
          <form onSubmit={handleContextSubmit} className="space-y-4">
            <div>
              <label htmlFor="account_bio" className="block text-sm font-medium text-gray-700 mb-1">
                ¿De qué trata tu cuenta?
              </label>
              <textarea
                id="account_bio"
                value={contextData.account_bio}
                onChange={(e) => setContextData({ ...contextData, account_bio: e.target.value })}
                rows={3}
                placeholder="Ej: Cuento chistes sobre la vida adulta. Mi audiencia son millennials que trabajan en oficina..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Esto ayuda a la IA a entender tu estilo y nicho específico</p>
            </div>
            
            <div>
              <label htmlFor="current_phase" className="block text-sm font-medium text-gray-700 mb-1">
                ¿En qué fase estás?
              </label>
              <select
                id="current_phase"
                value={contextData.current_phase}
                onChange={(e) => setContextData({ ...contextData, current_phase: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="starting">🚀 Starting - Menos de 1000 seguidores</option>
                <option value="growing">📈 Growing - 1k a 10k seguidores</option>
                <option value="monetizing">💰 Monetizing - 10k a 50k seguidores</option>
                <option value="scaling">🏆 Scaling - Más de 50k seguidores</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="main_struggle" className="block text-sm font-medium text-gray-700 mb-1">
                ¿Cuál es tu mayor dificultad ahora mismo?
              </label>
              <select
                id="main_struggle"
                value={contextData.main_struggle}
                onChange={(e) => setContextData({ ...contextData, main_struggle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona tu principal dolor</option>
                <option value="views">📉 Consigo pocas visitas</option>
                <option value="engagement">💬 Tengo visitas pero no interacción</option>
                <option value="monetization">💰 No consigo monetizar</option>
                <option value="consistency">📅 Me cuesta ser constante</option>
                <option value="ideas">💡 Me quedo sin ideas</option>
                <option value="growth">📊 Mi crecimiento se ha estancado</option>
              </select>
            </div>
            
            <Button type="submit" disabled={savingContext} className="w-full md:w-auto">
              {savingContext ? 'Saving...' : 'Save Creator Context'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}