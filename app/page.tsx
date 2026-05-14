'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Zap, 
  BarChart3, 
  Lightbulb, 
  Calendar, 
  Sparkles, 
  Shield, 
  Users, 
  Clock,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Video,
  Brain,
  Globe
} from 'lucide-react'

export default function HomePage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Hero Section con efecto neon */}
      <section className="relative overflow-hidden">
        {/* Fondo con efecto de gradiente móvil */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/10 animate-pulse-slow">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">AI-Powered Social Intelligence</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Predict viral content
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                before you post
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              AnentLab analyzes your TikTok performance and generates AI-powered recommendations to boost engagement and grow your audience — all for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="group px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2">
                Start Creating Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-gray-200 hover:bg-white/10 transition-all duration-300">
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Everything you need to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">go viral</span></h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Our AI analyzes your data and provides actionable insights to optimize your content strategy — completely free.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature cards con efecto neon al hover */}
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Viral Predictor"
              description="Validate your content ideas before recording. AI predicts viral potential based on your audience and niche."
              gradient="from-yellow-500 to-orange-500"
              delay="0"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Advanced Analytics"
              description="Deep dive into your performance metrics with interactive charts and cohort analysis."
              gradient="from-blue-500 to-cyan-500"
              delay="100"
            />
            <FeatureCard
              icon={<Lightbulb className="w-6 h-6" />}
              title="AI Recommendations"
              description="Get personalized strategies to increase engagement and grow your following."
              gradient="from-purple-500 to-pink-500"
              delay="200"
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Content Calendar"
              description="Plan and schedule your posts with optimal timing recommendations from AI."
              gradient="from-green-500 to-emerald-500"
              delay="0"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Idea Generator"
              description="Never run out of content ideas. AI generates viral hooks based on your niche."
              gradient="from-pink-500 to-rose-500"
              delay="100"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Privacy First"
              description="Your data is encrypted. We never share your TikTok data with third parties."
              gradient="from-indigo-500 to-purple-500"
              delay="200"
            />
          </div>
        </div>
      </section>

      {/* Stats / Social Proof Section */}
      <section className="py-16 border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-on-scroll opacity-0">
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-gray-400">Free forever</div>
              <div className="text-sm text-gray-500 mt-1">No credit card required</div>
            </div>
            <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '100ms' }}>
              <div className="text-4xl font-bold text-white mb-2">Real-time</div>
              <div className="text-gray-400">AI analysis</div>
              <div className="text-sm text-gray-500 mt-1">Powered by DeepSeek</div>
            </div>
            <div className="animate-on-scroll opacity-0" style={{ transitionDelay: '200ms' }}>
              <div className="text-4xl font-bold text-white mb-2">TikTok</div>
              <div className="text-gray-400">Official Partner</div>
              <div className="text-sm text-gray-500 mt-1">Compliant API usage</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 lg:p-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to level up your content?
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
                Join thousands of creators using AnentLab to predict viral content and grow their audience.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-sm text-gray-400 mt-4">No credit card. No commitment. Forever free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-400">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} AnentLab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

// Componente FeatureCard con animaciones
function FeatureCard({ icon, title, description, gradient, delay }: { icon: React.ReactNode; title: string; description: string; gradient: string; delay: string }) {
  return (
    <div 
      className="animate-on-scroll opacity-0 group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${gradient} text-white mb-4 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}