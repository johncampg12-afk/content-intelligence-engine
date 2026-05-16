// app/terms/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function TermsPage() {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; pulse: number }>>([])

  // Partículas flotantes (mismo efecto que landing)
  useEffect(() => {
    const initParticles = () => {
      const newParticles = []
      for (let i = 0; i < 120; i++) {
        newParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.5 + 0.2,
          pulse: Math.random() * Math.PI * 2,
        })
      }
      setParticles(newParticles)
    }
    initParticles()

    let animationFrame: number
    let time = 0
    const animate = () => {
      time += 0.02
      setParticles((prev) =>
        prev.map((p) => {
          let newX = p.x + p.speedX
          let newY = p.y + p.speedY
          if (newX < 0) newX = window.innerWidth
          if (newX > window.innerWidth) newX = 0
          if (newY < 0) newY = window.innerHeight
          if (newY > window.innerHeight) newY = 0
          const pulseAlpha = p.opacity + Math.sin(time + p.pulse) * 0.1
          return {
            ...p,
            x: newX,
            y: newY,
            opacity: Math.min(0.6, Math.max(0.1, pulseAlpha)),
          }
        })
      )
      animationFrame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-x-hidden">
      {/* Partículas flotantes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/40"
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

      {/* Header simple (coherente con la marca) */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Image
                src="/anentLogo.jpeg"
                alt="AnentLab Logo"
                fill
                className="rounded-lg object-cover shadow-sm transition-transform group-hover:scale-105"
              />
            </div>
            <span className="text-xl font-bold text-gray-800">
              Anent<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lab</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-500">Last updated: May 17, 2026</p>
          </div>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>Welcome to AnentLab ("we", "our", "us"). By accessing or using our website and services (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
              <p>AnentLab provides AI-powered social media analytics and content recommendations for TikTok creators. Our service analyzes your TikTok performance metrics, generates content ideas, predicts viral potential, and provides strategic recommendations.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Registration</h2>
              <p>To use our Service, you must:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Be at least 13 years old (or the minimum age required in your country).</li>
                <li>Provide accurate and complete registration information.</li>
                <li>Maintain the security of your account credentials.</li>
                <li>Accept responsibility for all activities under your account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. TikTok Data Collection & API Compliance</h2>
              <p>When you connect your TikTok account via TikTok Login Kit, we collect the following information strictly for providing our analytics and recommendations:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>user.info.basic:</strong> open_id, username, display name, avatar</li>
                <li><strong>user.info.profile:</strong> bio description, profile link, verification status</li>
                <li><strong>user.info.stats:</strong> follower count, following count, likes count, video count</li>
                <li><strong>video.list:</strong> video IDs, titles, view/like/comment/share counts, publish dates (last 20 videos)</li>
              </ul>
              <p className="mt-3">We do <strong>not</strong> collect your TikTok password, private messages, or draft videos. All TikTok data is stored securely, encrypted at rest, and used exclusively to provide the features described in Section 2. We comply with the <strong>TikTok Developer Terms of Service and API Terms</strong>. We do not sell, rent, or share TikTok data with third parties, nor do we use it for advertising, marketing, or cross‑platform user profiling.</p>
              <p className="mt-2">You can revoke access at any time via TikTok Settings → Security → Manage app permissions → AnentLab, or directly from your AnentLab account settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights (GDPR)</h2>
              <p>If you are in the European Economic Area, you have the right to access, correct, or delete your personal data. You can request deletion of your account and all associated data at any time from your Settings page, or by contacting us at <a href="mailto:privacy@anentlab.com" className="text-blue-600 hover:underline">privacy@anentlab.com</a>. We will delete your TikTok data within 48 hours of disconnection.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. AI-Generated Content & Predictions</h2>
              <p>Our Service uses artificial intelligence (DeepSeek AI) to generate content recommendations and performance predictions. These are for informational purposes only and do not guarantee results. You are solely responsible for any content you create based on our recommendations.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Prohibited Use</h2>
              <p>You may not use the Service for any illegal or unauthorized purpose, including but not limited to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Violating any laws or third‑party rights.</li>
                <li>Attempting to bypass security features.</li>
                <li>Using the Service to harass, abuse, or harm others.</li>
                <li>Reverse engineering or extracting source code.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Termination</h2>
              <p>We may terminate or suspend your account immediately for any breach of these Terms. You may delete your account at any time from the Settings page. Upon termination, your right to use the Service will cease immediately.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, AnentLab shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
              <p>We may modify these Terms at any time. If we make material changes, we will notify you by updating the "Last updated" date. Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Governing Law</h2>
              <p>These Terms shall be governed by the laws of Spain, without regard to its conflict of law provisions. Any disputes shall be resolved exclusively in the courts of Valencia, Spain.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Information</h2>
              <p>If you have any questions about these Terms, please contact us at:</p>
              <p className="mt-1">📧 <a href="mailto:support@anentlab.com" className="text-blue-600 hover:underline">support@anentlab.com</a><br />🏢 Valencia, Comunidad Valenciana, Spain</p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">By using AnentLab, you acknowledge that you have read, understood, and agree to these Terms of Service.</p>
          </div>
        </motion.div>
      </main>

      {/* Footer simple */}
      <footer className="relative z-10 border-t border-gray-200 py-6 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AnentLab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}