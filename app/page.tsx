// app/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { 
  ArrowRight, TrendingUp, Brain, CheckCircle,
  Flame, ChartNoAxesCombined, Sparkles, CalendarClock, Lightbulb, ShieldCheck,
  ChevronLeft, ChevronRight, Pause, Play
} from 'lucide-react'

// Datos de las herramientas para el carrusel
const tools = [
  {
    id: 1,
    title: 'Viral Predictor',
    description: 'Validate your content ideas before recording. AI predicts viral potential based on your audience and niche.',
    icon: <Flame className="w-6 h-6" />,
    gradient: 'from-orange-500 to-red-500',
    bgGlow: 'from-orange-500/20 to-red-500/20'
  },
  {
    id: 2,
    title: 'Advanced Analytics',
    description: 'Deep dive into your performance metrics with interactive charts and cohort analysis.',
    icon: <ChartNoAxesCombined className="w-6 h-6" />,
    gradient: 'from-blue-500 to-cyan-500',
    bgGlow: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 3,
    title: 'AI Recommendations',
    description: 'Get personalized strategies to increase engagement and grow your following.',
    icon: <Sparkles className="w-6 h-6" />,
    gradient: 'from-purple-500 to-pink-500',
    bgGlow: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 4,
    title: 'Content Calendar',
    description: 'Plan and schedule your posts with optimal timing recommendations from AI.',
    icon: <CalendarClock className="w-6 h-6" />,
    gradient: 'from-green-500 to-emerald-500',
    bgGlow: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 5,
    title: 'Idea Generator',
    description: 'Never run out of content ideas. AI generates viral hooks based on your niche.',
    icon: <Lightbulb className="w-6 h-6" />,
    gradient: 'from-pink-500 to-rose-500',
    bgGlow: 'from-pink-500/20 to-rose-500/20'
  },
  {
    id: 6,
    title: 'Privacy First',
    description: 'Your data is encrypted. We never share your TikTok data with third parties.',
    icon: <ShieldCheck className="w-6 h-6" />,
    gradient: 'from-indigo-500 to-purple-500',
    bgGlow: 'from-indigo-500/20 to-purple-500/20'
  }
]

// Componente Carrusel (sin cambios internos, pero se adapta al tema mediante clases)
function ToolsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const total = tools.length

  useEffect(() => {
    if (isAutoPlaying && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % total)
      }, 4000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isAutoPlaying, isPaused, total])

  const goTo = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(true)
    setIsPaused(false)
  }

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % total)
    setIsAutoPlaying(true)
    setIsPaused(false)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total)
    setIsAutoPlaying(true)
    setIsPaused(false)
  }

  const toggleAutoPlay = () => {
    setIsPaused(!isPaused)
  }

  const getCardStyle = (index: number) => {
    const diff = (index - currentIndex + total) % total
    if (diff === 0) return { scale: 1, opacity: 1, zIndex: 10, x: 0, blur: 0 }
    if (diff === 1) return { scale: 0.85, opacity: 0.7, zIndex: 5, x: '30%', blur: 4 }
    if (diff === total - 1) return { scale: 0.85, opacity: 0.7, zIndex: 5, x: '-30%', blur: 4 }
    return { scale: 0.7, opacity: 0.3, zIndex: 0, x: diff === 2 ? '60%' : '-60%', blur: 8, display: 'none' }
  }

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="flex justify-center gap-3 mb-8">
        <button onClick={prev} className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button onClick={toggleAutoPlay} className={`p-2 rounded-full border shadow-sm transition-all flex items-center gap-1 px-3 ${isPaused ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          <span className="text-sm font-medium">{isPaused ? 'Play' : 'Pause'}</span>
        </button>
        <button onClick={next} className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
      <div className="relative flex justify-center items-center min-h-[400px]">
        {tools.map((tool, idx) => {
          const style = getCardStyle(idx)
          if (style.display === 'none') return null
          const isActive = idx === currentIndex
          return (
            <motion.div
              key={tool.id}
              className="absolute cursor-pointer w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6"
              style={{ x: style.x, scale: style.scale, opacity: style.opacity, zIndex: style.zIndex, filter: `blur(${style.blur}px)` }}
              animate={{ x: style.x, scale: style.scale, opacity: style.opacity, filter: `blur(${style.blur}px)` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => goTo(idx)}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.bgGlow} rounded-2xl opacity-30 pointer-events-none`} />
              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tool.gradient} text-white mb-4 shadow-md`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tool.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{tool.description}</p>
                {isActive && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                      Learn more →
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="flex justify-center gap-2 mt-8">
        {tools.map((_, idx) => (
          <button key={idx} onClick={() => goTo(idx)} className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-indigo-600 dark:bg-indigo-500' : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'}`} />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const { theme } = useTheme()

  // Partículas flotantes adaptadas al tema
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    let particles: { x: number; y: number; radius: number; speedX: number; speedY: number; opacity: number; pulse: number }[] = []
    let animationFrame: number
    let time = 0

    const initParticles = () => {
      const count = Math.min(150, Math.floor((width * height) / 10000))
      particles = []
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 5 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.2,
          pulse: Math.random() * Math.PI * 2,
        })
      }
    }

    const animate = () => {
      if (!ctx || !canvas) return
      time += 0.02
      ctx.clearRect(0, 0, width, height)

      const isDark = theme === 'dark'
      const baseColor = isDark ? '200, 200, 255' : '59, 130, 246'

      for (const p of particles) {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        const pulseAlpha = p.opacity + Math.sin(time + p.pulse) * 0.15
        const alpha = Math.min(0.5, Math.max(0.1, pulseAlpha)) * (isDark ? 0.6 : 0.8)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius + Math.sin(time + p.pulse) * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${baseColor}, ${alpha})`
        ctx.fill()
      }

      animationFrame = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      initParticles()
    }

    initParticles()
    animate()
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
    }
  }, [theme])

  // Efecto de scroll para header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Animación de entrada
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up')
            entry.target.classList.remove('opacity-0')
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-black dark:via-gray-900 dark:to-black relative overflow-x-hidden">
      {/* Canvas de partículas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Header (mejorado con dark mode) */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${
          scrolled ? 'bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-md' : 'bg-white/60 dark:bg-black/60 backdrop-blur-sm'
        } border-b border-gray-200 dark:border-gray-800`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="relative w-8 h-8"
            >
              <Image
                src="/anentLogo.jpeg"
                alt="AnentLab Logo"
                fill
                className="rounded-lg object-cover shadow-sm"
              />
            </motion.div>
            <motion.span whileHover={{ scale: 1.02 }} className="text-xl font-bold text-gray-800 dark:text-white">
              Anent<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lab</span>
            </motion.span>
          </Link>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow hover:shadow-md transition">
                Get started
              </Link>
            </motion.div>
            <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              Login
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 overflow-hidden pt-28 pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-blue-100/80 dark:bg-blue-900/30 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-blue-200 dark:border-blue-800 shadow-sm animate-pulse-slow"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Social Intelligence</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              <span className="block">AnentLab: Predict, Analyze & Structure</span>
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">viral content</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8"
            >
              AnentLab analyzes your TikTok performance and generates AI-powered recommendations to boost engagement and grow your audience — completely free.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register" className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2">
                Start Creating Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#learning-loop" className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm">
                How it works
              </Link>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              ✨ No credit card required
            </motion.p>
          </div>
        </div>
      </section>

      {/* Learning Loop Section */}
      <section id="learning-loop" className="py-20 bg-gradient-to-r from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full px-4 py-1.5 mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">The Intelligence Loop</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              A learning engine that gets <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">smarter with you</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Unlike generic tools, AnentLab learns from your results — and from successful accounts like yours — to deliver hyper-personalized recommendations.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                { num: '1', title: 'You connect your TikTok', desc: 'We analyze your videos, metrics, and posting patterns.', delay: '0ms' },
                { num: '2', title: 'We compare with your niche benchmark', desc: 'Our database contains anonymized patterns from top-performing accounts in your exact niche.', delay: '150ms' },
                { num: '3', title: 'AI generates recommendations', desc: 'Personalized content ideas, optimal posting times, and viral hooks based on what actually works.', delay: '300ms' },
                { num: '4', title: 'You publish, we learn', desc: 'The AI tracks which recommendations you follow and how they perform — improving future suggestions.', delay: '450ms' },
              ].map((step) => (
                <div key={step.num} className="flex gap-4 items-start animate-on-scroll opacity-0" style={{ transitionDelay: step.delay }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shadow-sm transition-transform duration-300 hover:scale-110">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 space-y-4 animate-on-scroll opacity-0 transition-all duration-700 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl transition-transform duration-300 hover:rotate-6">
                  <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Why it's different</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Closed‑loop, niche‑aware intelligence</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Most tools give generic advice. AnentLab compares your performance against a <strong>real‑time database of successful accounts in your niche</strong> (tutorials, humor, tech, etc.). Then, it learns from your own results to refine its predictions.
              </p>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Your data stays private — only patterns are aggregated</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Recommendations adapt as your audience grows</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Benchmarked against top 10% of creators in your niche</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 text-center animate-on-scroll opacity-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Trusted by creators in niches like</p>
            <div className="flex flex-wrap justify-center gap-6 text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span> Tutorials</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span> Humor</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span> Tech</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></span> Fitness</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></span> Food</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></span> Travel</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section - Carrusel */}
      <section id="features" className="py-20 bg-white/60 dark:bg-black/30 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">go viral</span></h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI analyzes your data and provides actionable insights to optimize your content strategy — all free.
            </p>
          </div>
          <ToolsCarousel />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-y border-gray-100 dark:border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-on-scroll opacity-0">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">100% Free</div>
              <div className="text-gray-600 dark:text-gray-400">No credit card</div>
            </div>
            <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '100ms' }}>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Real-time AI</div>
              <div className="text-gray-600 dark:text-gray-400">Powered by Multiple</div>
            </div>
            <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '200ms' }}>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">TikTok</div>
              <div className="text-gray-600 dark:text-gray-400">Official API Partner</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 lg:p-12 transition-all duration-500 hover:shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to level up your content?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
              Join thousands of creators using AnentLab to predict viral content and grow their audience.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">No credit card • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 bg-white/50 dark:bg-black/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link href="/terms" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">Contact</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} AnentLab. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .animate-on-scroll { opacity: 0; }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }
        @keyframes pulseSlow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(0.98); } }
      `}</style>
    </div>
  )
}