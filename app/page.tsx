import Link from 'next/link'
import Image from 'next/image'
import { 
  Zap, 
  BarChart3, 
  Lightbulb, 
  Shield, 
  TrendingUp, 
  Video,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Mail,
  BrainCircuit,
  Target,
  Clock
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9">
                <Image src="/anentLogo.jpeg" alt="Anent" width={36} height={36} className="rounded-lg object-contain" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Anent
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hidden sm:block">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hidden sm:block">
                Privacy
              </Link>
              <Link href="/login" className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary px-4 py-2 rounded-lg text-sm font-medium text-white">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Content Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Your Content, <br />
            <span className="gradient-text">Supercharged by AI</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Anent analyzes your social media performance with artificial intelligence to deliver hyper-personalized strategies that predict viral potential and maximize engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary px-8 py-3 rounded-xl text-base font-semibold text-white inline-flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="px-8 py-3 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Built for Modern Creators</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From analytics to AI-generated recommendations, Anent gives you the tools to understand your audience and create content that resonates.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BrainCircuit, title: 'AI Content Analysis', desc: 'Deep learning models analyze every video, hashtag, and trend to uncover what drives your growth.' },
              { icon: Target, title: 'Hyper-Personalization', desc: 'Recommendations tailored to your specific niche, audience demographics, and current creator phase.' },
              { icon: Zap, title: 'Viral Prediction', desc: 'Score your content ideas before posting. Our AI predicts performance based on historical patterns and market trends.' },
              { icon: BarChart3, title: 'Unified Analytics', desc: 'Connect TikTok, Instagram, and YouTube. All your metrics in one intelligent dashboard.' },
              { icon: Clock, title: 'Optimal Timing', desc: 'AI-calculated best posting times based on your audience activity and engagement heatmaps.' },
              { icon: Shield, title: 'Privacy First', desc: 'Read-only access. We never post on your behalf. Your data is encrypted and never sold to third parties.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 card-hover">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How Anent Works</h2>
            <p className="text-gray-600 dark:text-gray-400">From connection to actionable insights in under 5 minutes.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Connect', desc: 'Securely link your TikTok with OAuth. Read-only, zero posting permissions.' },
              { step: '2', title: 'Configure', desc: 'Tell Anent about your niche, goals, and target audience.' },
              { step: '3', title: 'Analyze', desc: 'Our AI engine processes your metrics and identifies growth patterns.' },
              { step: '4', title: 'Execute', desc: 'Receive personalized recommendations and viral-ready content strategies.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 dark:text-gray-400">Start free. Upgrade when you are ready to scale.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: 'Starter', price: '$0', desc: 'For creators exploring AI analytics', features: ['1 social account', '7-day analytics history', '5 AI recommendations/month', 'Basic viral scoring'] },
              { name: 'Pro', price: '$19', desc: 'For serious growth', features: ['3 social accounts', '90-day analytics history', 'Unlimited AI recommendations', 'Advanced viral predictor', 'Export PDF reports', 'Priority support'], popular: true },
              { name: 'Studio', price: '$49', desc: 'For teams and agencies', features: ['Unlimited accounts', 'Custom AI model training', 'White-label exports', 'API access', 'Dedicated account manager'] },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-6 border ${plan.popular ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 relative`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">/mo</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${plan.popular ? 'btn-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-9 h-9">
                <Image src="/logo.png" alt="Anent" width={36} height={36} className="rounded-lg object-contain" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Anent
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
              AI-powered content intelligence for creators who want to grow with data, not guesswork.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="#features" className="hover:text-blue-600">Features</Link></li>
              <li><Link href="/login" className="hover:text-blue-600">Dashboard</Link></li>
              <li><Link href="/register" className="hover:text-blue-600">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><a href="mailto:support@anent.app" className="hover:text-blue-600 flex items-center gap-1"><Mail className="w-3 h-3" /> support@anent.app</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          © 2026 Anent. All rights reserved.
        </div>
      </footer>
    </div>
  )
}