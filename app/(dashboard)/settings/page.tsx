import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SettingsPage() {
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
  
  // Obtener cuentas conectadas
  const { data: connectedAccounts } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('user_id', user?.id)
  
  const hasTikTok = connectedAccounts?.some(a => a.platform === 'tiktok')
  const hasInstagram = connectedAccounts?.some(a => a.platform === 'instagram')
  const hasYouTube = connectedAccounts?.some(a => a.platform === 'youtube')
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Connect your social media accounts
        </p>
      </div>
      
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
              <Link href="/api/oauth/tiktok">
                <Button className="w-full">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  Connect TikTok
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
        
        {/* Instagram Card (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.332.014 7.052.072 5.775.13 4.788.302 3.926.79c-.885.507-1.637 1.259-2.144 2.144-.488.862-.66 1.849-.718 3.126C.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.058 1.277.23 2.264.718 3.126.507.885 1.259 1.637 2.144 2.144.862.488 1.849.66 3.126.718 1.28.058 1.689.072 4.948.072s3.668-.014 4.948-.072c1.277-.058 2.264-.23 3.126-.718.885-.507 1.637-1.259 2.144-2.144.488-.862.66-1.849.718-3.126.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.058-1.277-.23-2.264-.718-3.126-.507-.885-1.259-1.637-2.144-2.144-.862-.488-1.849-.66-3.126-.718C15.668.014 15.259 0 12 0z"/>
                <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
              Instagram
            </CardTitle>
            <CardDescription>
              Coming soon - Connect Instagram to analyze Reels and posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full opacity-50">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
        
        {/* YouTube Card (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </CardTitle>
            <CardDescription>
              Coming soon - Connect YouTube to analyze video performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full opacity-50">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}