import Link from 'next/link'
import { Zap, BarChart3, Lightbulb, Calendar, Sparkles, Shield, Users, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-3 py-1 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Social Intelligence</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Predict viral content before you post
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Content Intelligence Engine analyzes your TikTok performance and generates AI-powered recommendations to boost engagement and grow your audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                Start Free Trial
              </Link>
              <Link href="#features" className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to go viral</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI analyzes your data and provides actionable insights to optimize your content strategy.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Viral Predictor</h3>
              <p className="text-gray-600 dark:text-gray-300">Validate your content ideas before recording. AI predicts viral potential based on your audience and niche.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">Deep dive into your performance metrics with interactive charts and cohort analysis.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-300">Get personalized strategies to increase engagement and grow your following.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Calendar</h3>
              <p className="text-gray-600 dark:text-gray-300">Plan and schedule your posts with optimal timing recommendations from AI.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Idea Generator</h3>
              <p className="text-gray-600 dark:text-gray-300">Never run out of content ideas. AI generates viral hooks based on your niche.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Privacy First</h3>
              <p className="text-gray-600 dark:text-gray-300">Your data is encrypted. We never share your TikTok data with third parties.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (simplified for demo) */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Start for free, upgrade as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Free</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">€0<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                <li>1 TikTok account</li>
                <li>Basic analytics</li>
                <li>AI recommendations</li>
              </ul>
              <Link href="/register" className="block w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Get Started</Link>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center shadow-lg transform scale-105">
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <p className="text-3xl font-bold mb-4">€29<span className="text-sm font-normal">/month</span></p>
              <ul className="text-sm text-blue-100 space-y-2 mb-6">
                <li>Up to 3 accounts</li>
                <li>Advanced analytics + heatmaps</li>
                <li>Viral predictor + idea generator</li>
                <li>Priority support</li>
              </ul>
              <Link href="/register" className="block w-full py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition">Start Pro Trial</Link>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Agency</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">€99<span className="text-sm font-normal text-gray-500">/month</span></p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                <li>Up to 10 accounts</li>
                <li>White-label reports</li>
                <li>API access</li>
                <li>Dedicated support</li>
              </ul>
              <Link href="/register" className="block w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Content Intelligence Engine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}