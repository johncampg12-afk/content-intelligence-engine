'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { 
  Zap, 
  BarChart3, 
  Lightbulb, 
  Calendar, 
  Sparkles, 
  Shield, 
  ArrowRight,
  TrendingUp,
  Brain,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Efecto de partículas flotantes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; radius: number; speedX: number; speedY: number; alpha: number }[] = []
    const particleCount = 80

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5 + 0.2,
      })
    }

    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha * 0.6})`
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
      <section className="relative z-10 overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-blue-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">AI-Powered Social Intelligence</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Predict viral content
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                before you post
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              AnentLab analyzes your TikTok performance and generates AI-powered recommendations to boost engagement and grow your audience — completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translateY-0.5 flex items-center gap-2">
                Start Creating Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300 shadow-sm">
                Explore Features
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">✨ No credit card required • Forever free</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/60 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Everything you need to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">go viral</span></h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI analyzes your data and provides actionable insights to optimize your content strategy — all free.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Viral Predictor"
              description="Validate your content ideas before recording. AI predicts viral potential based on your audience and niche."
              gradient="from-yellow-500 to-orange-500"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Advanced Analytics"
              description="Deep dive into your performance metrics with interactive charts and cohort analysis."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Lightbulb className="w-6 h-6" />}
              title="AI Recommendations"
              description="Get personalized strategies to increase engagement and grow your following."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Content Calendar"
              description="Plan and schedule your posts with optimal timing recommendations from AI."
              gradient="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Idea Generator"
              description="Never run out of content ideas. AI generates viral hooks based on your niche."
              gradient="from-pink-500 to-rose-500"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Privacy First"
              description="Your data is encrypted. We never share your TikTok data with third parties."
              gradient="from-indigo-500 to-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Learning Loop Section - Diferenciación */}
      <section className="py-20 bg-gradient-to-r from-indigo-50 via-white to-blue-50 relative z-10 overflow-hidden">
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
            {/* Left side: Steps */}
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">1</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">You connect your TikTok</h3>
                  <p className="text-gray-500">We analyze your videos, metrics, and posting patterns.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">2</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">We compare with your niche benchmark</h3>
                  <p className="text-gray-500">Our database contains anonymized patterns from top-performing accounts in your exact niche.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">3</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI generates recommendations</h3>
                  <p className="text-gray-500">Personalized content ideas, optimal posting times, and viral hooks based on what actually works.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">4</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">You publish, we learn</h3>
                  <p className="text-gray-500">The AI tracks which recommendations you follow and how they perform — improving future suggestions.</p>
                </div>
              </div>
            </div>

            {/* Right side: Value proposition */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-xl">
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
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Trusted by creators in niches like</p>
            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span> Tutorials</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-indigo-400 rounded-full"></span> Humor</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-purple-400 rounded-full"></span> Tech</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-pink-400 rounded-full"></span> Fitness</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full"></span> Food</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-yellow-400 rounded-full"></span> Travel</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-on-scroll opacity-0">
              <div className="text-4xl font-bold text-gray-900 mb-2">100% Free</div>
              <div className="text-gray-600">Forever — no credit card</div>
            </div>
            <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '100ms' }}>
              <div className="text-4xl font-bold text-gray-900 mb-2">Real-time AI</div>
              <div className="text-gray-600">Powered by DeepSeek</div>
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 lg:p-12">
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
            <p className="text-sm text-gray-400 mt-4">No credit card • Forever free • Cancel anytime</p>
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
      `}</style>
    </div>
  )
}

// Componente FeatureCard
function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <div className="animate-on-scroll opacity-0 group relative bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} text-white mb-4 shadow-md`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}