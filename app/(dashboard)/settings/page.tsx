'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Info, Target, TrendingUp, Users, Eye, Heart, Share2, CheckCircle } from 'lucide-react'

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

  const currentPhases = [
    { value: 'starting', label: '🚀 Starting - Less than 1,000 followers', icon: '🚀' },
    { value: 'growing', label: '📈 Growing - 1K to 10K followers', icon: '📈' },
    { value: 'monetizing', label: '💰 Monetizing - 10K to 50K followers', icon: '💰' },
    { value: 'scaling', label: '🏆 Scaling - More than 50K followers', icon: '🏆' }
  ]

  const mainStruggles = [
    { value: 'views', label: '📉 Low views - I get few views', icon: '📉' },
    { value: 'engagement', label: '💬 Low engagement - Views but no interaction', icon: '💬' },
    { value: 'monetization', label: '💰 No monetization - I can\'t make money', icon: '💰' },
    { value: 'consistency', label: '📅 Consistency - I struggle to post regularly', icon: '📅' },
    { value: 'ideas', label: '💡 Ideas - I run out of content ideas', icon: '💡' },
    { value: 'growth', label: '📊 Stagnation - My growth has stalled', icon: '📊' }
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
        .select('*')
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
    setMessage(null)
    
    try {
      const response = await fetch('/api/profile/update-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contextData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Creator context saved! AI will personalize recommendations.' })
        await loadData()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save context' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setSavingContext(false)
    }
  }

  // Calcular progreso de configuración
  const completionSteps = [
    { name: 'Content Niche', completed: !!profile?.account_type_id },
    { name: 'Main Goal', completed: !!profile?.content_goal },
    { name: 'Target Audience', completed: !!profile?.target_audience },
    { name: 'Creator Bio', completed: !!profile?.account_bio },
    { name: 'Current Phase', completed: !!profile?.current_phase },
    { name: 'Main Struggle', completed: !!profile?.main_struggle }
  ]

  const completedCount = completionSteps.filter(s => s.completed).length
  const completionPercentage = (completedCount / completionSteps.length) * 100

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
      
      {/* Barra de progreso de configuración */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Configuración del perfil</span>
          </div>
          <span className="text-sm font-medium text-blue-600">{completedCount}/{completionSteps.length} completados</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completionPercentage === 100 
            ? '✅ ¡Perfil completo! La IA usará todos estos datos para personalizar tus recomendaciones.' 
            : '📝 Completa todos los campos para recibir recomendaciones hiper-personalizadas de IA.'}
        </p>
      </div>
      
      {/* Mensaje de éxito/error */}
      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}
      
      {/* ============================================ */}
      {/* SECCIÓN 1: CREATOR CONTEXT (ARRIBA) */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Creator Context
          </CardTitle>
          <CardDescription>
            Tell us about your account for hyper-personalized AI recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContextSubmit} className="space-y-4">
            <div>
              <label htmlFor="account_bio" className="block text-sm font-medium text-gray-700 mb-1">
                What is your account about?
              </label>
              <textarea
                id="account_bio"
                value={contextData.account_bio}
                onChange={(e) => setContextData({...contextData, account_bio: e.target.value})}
                rows={3}
                placeholder="Ej: I create comedy skits about adult life. My audience is millennials working in offices..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                This helps AI understand your style and specific niche
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="current_phase" className="block text-sm font-medium text-gray-700 mb-1">
                  What phase are you in?
                </label>
                <select
                  id="current_phase"
                  value={contextData.current_phase}
                  onChange={(e) => setContextData({...contextData, current_phase: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {currentPhases.map(phase => (
                    <option key={phase.value} value={phase.value}>{phase.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="main_struggle" className="block text-sm font-medium text-gray-700 mb-1">
                  What is your biggest struggle right now?
                </label>
                <select
                  id="main_struggle"
                  value={contextData.main_struggle}
                  onChange={(e) => setContextData({...contextData, main_struggle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your main struggle</option>
                  {mainStruggles.map(struggle => (
                    <option key={struggle.value} value={struggle.value}>{struggle.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>This information helps AI personalize recommendations based on your specific situation. The more you share, the better the insights.</p>
            </div>
            
            <Button type="submit" disabled={savingContext} className="w-full md:w-auto">
              {savingContext ? 'Saving...' : 'Save Creator Context'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* ============================================ */}
      {/* SECCIÓN 2: CONTENT STRATEGY CONFIGURATION */}
      {/* ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Content Strategy Configuration
          </CardTitle>
          <CardDescription>
            Define your content niche, goals, and target audience for AI recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 mb-1">
                Content Niche *
              </label>
              <select
                id="account_type"
                value={formData.account_type_id}
                onChange={(e) => setFormData({ ...formData, account_type_id: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select your content niche</option>
                {accountTypes?.map((type: any) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name} - {type.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="content_goal" className="block text-sm font-medium text-gray-700 mb-1">
                Main Goal *
              </label>
              <select
                id="content_goal"
                value={formData.content_goal}
                onChange={(e) => setFormData({ ...formData, content_goal: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select your main goal</option>
                {contentGoals.map((goal) => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience *
              </label>
              <select
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {saving ? 'Saving...' : 'Save Strategy'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* ============================================ */}
      {/* SECCIÓN 3: CONNECTED ACCOUNTS (ABAJO) */}
      {/* ============================================ */}
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
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07z"/>
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
    </div>
  )
}