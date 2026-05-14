'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, ArrowRight, TrendingUp, Brain, CheckCircle,
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

// Componente Carrusel
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
      {/* Controles */}
      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={prev}
          className="p-2 rounded-full bg-white/80 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={toggleAutoPlay}
          className={`p-2 rounded-full border shadow-sm transition-all flex items-center gap-1 px-3 ${
            isPaused ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-700'
          }`}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          <span className="text-sm font-medium">{isPaused ? 'Play' : 'Pause'}</span>
        </button>
        <button
          onClick={next}
          className="p-2 rounded-full bg-white/80 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Carrusel */}
      <div className="relative flex justify-center items-center min-h-[400px]">
        {tools.map((tool, idx) => {
          const style = getCardStyle(idx)
          if (style.display === 'none') return null
          const isActive = idx === currentIndex
          return (
            <motion.div
              key={tool.id}
              className="absolute cursor-pointer w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6 transition-all duration-500 ease-in-out"
              style={{
                x: style.x,
                scale: style.scale,
                opacity: style.opacity,
                zIndex: style.zIndex,
                filter: `blur(${style.blur}px)`,
              }}
              animate={{
                x: style.x,
                scale: style.scale,
                opacity: style.opacity,
                filter: `blur(${style.blur}px)`,
              }}
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tool.title}</h3>
                <p className="text-gray-600 leading-relaxed">{tool.description}</p>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-3 border-t border-gray-100"
                  >
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                      Learn more →
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Indicadores */}
      <div className="flex justify-center gap-2 mt-8">
        {tools.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// Componente FeatureCard (para otras secciones si se usa, pero aquí ya no es necesario)
// Se mantiene por si acaso, pero no se usa en la página actual

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Partículas flotantes (más dinámicas)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; radius: number; speedX: number; speedY: number; alpha: number; pulse: number }[] = []
    const particleCount = 100

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    let animationId: number
    let time = 0
    const animate = () => {
      time += 0.02
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        
        const pulseAlpha = p.alpha + Math.sin(time + p.pulse) * 0.15
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius + Math.sin(time + p.pulse) * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${Math.max(0.1, Math.min(0.7, pulseAlpha))})`
        ctx.fill()
      })
      
      animationId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Animación de entrada con Intersection Observer
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-x-hidden">
      
      {/* Canvas de partículas flotantes */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative z-10 overflow-hidden pt-20 pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-blue-200 shadow-sm animate-pulse-slow">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">AI-Powered Social Intelligence</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Predict, Analyze & Structure viral content
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                before you post
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              AnentLab analyzes your TikTok performance and generates AI-powered recommendations to boost engagement and grow your audience — completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2">
                Start Creating Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#learning-loop" className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300 shadow-sm">
                How it works
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">✨ No credit card required</p>
          </div>
        </div>
      </section>

      {/* Learning Loop Section - Diferenciación */}
      <section id="learning-loop" className="py-20 bg-gradient-to-r from-indigo-50 via-white to-blue-50 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-100 rounded-full px-4 py-1.5 mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">The Intelligence Loop</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              A learning engine that gets <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">smarter with you</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlike generic tools, AnentLab learns from your results — and from successful accounts like yours — to deliver hyper-personalized recommendations.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Pasos */}
            <div className="space-y-6">
              {[
                { num: '1', title: 'You connect your TikTok', desc: 'We analyze your videos, metrics, and posting patterns.', delay: '0ms' },
                { num: '2', title: 'We compare with your niche benchmark', desc: 'Our database contains anonymized patterns from top-performing accounts in your exact niche.', delay: '150ms' },
                { num: '3', title: 'AI generates recommendations', desc: 'Personalized content ideas, optimal posting times, and viral hooks based on what actually works.', delay: '300ms' },
                { num: '4', title: 'You publish, we learn', desc: 'The AI tracks which recommendations you follow and how they perform — improving future suggestions.', delay: '450ms' },
              ].map((step) => (
                <div key={step.num} className="flex gap-4 items-start animate-on-scroll opacity-0" style={{ transitionDelay: step.delay }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm transition-transform duration-300 hover:scale-110">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Value proposition */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-4 animate-on-scroll opacity-0 transition-all duration-700 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-xl transition-transform duration-300 hover:rotate-6">
                  <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Why it's different</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Closed‑loop, niche‑aware intelligence</h3>
              <p className="text-gray-600">
                Most tools give generic advice. AnentLab compares your performance against a <strong>real‑time database of successful accounts in your niche</strong> (tutorials, humor, tech, etc.). Then, it learns from your own results to refine its predictions.
              </p>
              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Your data stays private — only patterns are aggregated</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Recommendations adapt as your audience grows</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Benchmarked against top 10% of creators in your niche</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badge */}
          <div className="mt-16 text-center animate-on-scroll opacity-0">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Trusted by creators in niches like</p>
            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
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

      {/* Tools Section - Carrusel interactivo */}
      <section className="py-20 bg-white/60 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Everything you need to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">go viral</span></h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI analyzes your data and provides actionable insights to optimize your content strategy — all free.
            </p>
          </div>
          <ToolsCarousel />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-on-scroll opacity-0">
              <div className="text-4xl font-bold text-gray-900 mb-2">100% Free</div>
              <div className="text-gray-600">No credit card</div>
            </div>
            <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '100ms' }}>
              <div className="text-4xl font-bold text-gray-900 mb-2">Real-time AI</div>
              <div className="text-gray-600">Powered by Multiple</div>
            </div>
            <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '200ms' }}>
              <div className="text-4xl font-bold text-gray-900 mb-2">TikTok</div>
              <div className="text-gray-600">Official API Partner</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-12 transition-all duration-500 hover:shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ready to level up your content?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              Join thousands of creators using AnentLab to predict viral content and grow their audience.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-gray-400 mt-4">No credit card • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 bg-white/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link href="/terms" className="hover:text-gray-800 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-800 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-gray-800 transition-colors">Contact</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} AnentLab. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .animate-on-scroll {
          opacity: 0;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
      `}</style>
    </div>
  )
}