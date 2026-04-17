import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Video, 
  BarChart3, 
  Sparkles, 
  Settings, 
  Zap, 
  Calendar as CalendarIcon,
  Lightbulb,
  LogOut
} from 'lucide-react'
import { LogoutButton } from '@/components/layout/logout-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/content', label: 'Content', icon: Video },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/recommendations', label: 'Recommendations', icon: Sparkles },
    { href: '/viral-predictor', label: 'Viral Predictor', icon: Zap },
    { href: '/ideas', label: 'Ideas', icon: Lightbulb },
    { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="ml-3 text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              CIE
            </span>
          </div>
          
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                >
                  <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          <div className="px-2 mt-auto pt-4 border-t border-gray-100">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Header móvil */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 lg:bg-transparent lg:backdrop-blur-none">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                CIE
              </span>
            </div>
            <div className="flex items-center gap-3 lg:hidden">
              <LogoutButton />
            </div>
          </div>
        </div>

        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}