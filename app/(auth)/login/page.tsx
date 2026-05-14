'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, EyeOff, Sparkles } from 'lucide-react'

// Componente que usa useSearchParams (debe estar envuelto en Suspense)
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const tiktokConnected = searchParams.get('tiktok_connected')
    if (tiktokConnected === 'true') {
      setSuccessMessage('TikTok account connected successfully! Please login again to continue.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      if (searchParams.get('tiktok_connected') === 'true') {
        router.push('/dashboard/settings?success=tiktok_connected')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Image
                src="/anentLogo.jpeg"
                alt="AnentLab Logo"
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              Anent<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lab</span>
            </span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm text-center">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-10 transition"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google
      </button>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  )
}

// Componente principal con Suspense y fondo animado
export default function LoginPage() {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }>>([])

  useEffect(() => {
    const initParticles = () => {
      const newParticles = []
      for (let i = 0; i < 80; i++) {
        newParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.5 + 0.2,
        })
      }
      setParticles(newParticles)
    }
    initParticles()

    let animationFrame: number
    const animate = () => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + p.speedX,
          y: p.y + p.speedY,
          opacity: p.opacity + (Math.random() - 0.5) * 0.02,
        })).map(p => ({
          ...p,
          x: p.x < 0 ? window.innerWidth : p.x > window.innerWidth ? 0 : p.x,
          y: p.y < 0 ? window.innerHeight : p.y > window.innerHeight ? 0 : p.y,
          opacity: Math.min(0.7, Math.max(0.1, p.opacity)),
        }))
      )
      animationFrame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Partículas flotantes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400 dark:bg-blue-500"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Contenido principal con Suspense */}
      <Suspense
        fallback={
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}