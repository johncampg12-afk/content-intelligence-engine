// app/privacy/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
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

      {/* Header simple */}
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
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-500">Last updated: May 17, 2026</p>
          </div>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>AnentLab ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our Service. We comply with the General Data Protection Regulation (GDPR) and the TikTok Developer Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <p>We collect the following information:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>Account information</strong> – email, name, password (stored encrypted).</li>
                <li><strong>Profile preferences</strong> – content niche, goals, audience settings.</li>
                <li><strong>TikTok data</strong> (see Section 3 below).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. TikTok Data Collection (Explicit Scopes)</h2>
              <p>When you connect your TikTok account via TikTok Login Kit, we collect the following information strictly for providing our analytics and content recommendations:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>user.info.basic:</strong> open_id, username, display name, avatar.</li>
                <li><strong>user.info.profile:</strong> bio description, profile link, verification status.</li>
                <li><strong>user.info.stats:</strong> follower count, following count, likes count, video count.</li>
                <li><strong>video.list:</strong> video IDs, titles, view/like/comment/share counts, publish dates (last 20 videos).</li>
              </ul>
              <p className="mt-3">We do <strong>not</strong> collect your TikTok password, private messages, or draft videos. All TikTok data is stored securely on servers in the EU (Frankfurt), encrypted at rest, and cached for 24 hours. We comply with the <strong>TikTok Developer Terms of Service and API Terms</strong>. We do <strong>not</strong> sell, rent, or share TikTok data with third parties, nor do we use it for advertising, marketing, or cross‑platform user profiling.</p>
              <p className="mt-2">You can revoke access at any time via <strong>TikTok Settings → Security → Manage app permissions → AnentLab</strong>, or directly from your AnentLab account settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. How We Use Your Data</h2>
              <p>We use your data to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Provide AI-powered analytics and content recommendations.</li>
                <li>Generate performance reports and predictions.</li>
                <li>Improve our algorithms and service quality.</li>
                <li>Communicate important updates.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security and Retention</h2>
              <p>We implement industry‑standard security measures (encryption, secure authentication, regular audits). Your TikTok data is deleted from our production database within <strong>48 hours</strong> of disconnection, and from backups within <strong>30 days</strong>. Account data is retained while your account is active. You may delete your account at any time from the Settings page, which will erase all personal data.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights (GDPR)</h2>
              <p>If you are in the European Economic Area, you have the right to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Access your personal data.</li>
                <li>Correct inaccurate or incomplete information.</li>
                <li>Request deletion of your data (Right to be Forgotten).</li>
                <li>Restrict or object to processing.</li>
                <li>Data portability.</li>
              </ul>
              <p className="mt-2">To exercise these rights, contact us at <a href="mailto:privacy@anentlab.com" className="text-blue-600 hover:underline">privacy@anentlab.com</a>. We will respond within 30 days.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Children's Privacy</h2>
              <p>Our Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. International Data Transfers</h2>
              <p>Your information is stored on servers in the EU (Frankfurt). We ensure appropriate safeguards are in place for data protection.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of material changes by updating the "Last updated" date. Continued use of the Service constitutes acceptance of the revised policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Information</h2>
              <p>If you have any questions about this Privacy Policy or your data, please contact us at:</p>
              <p className="mt-1">📧 <a href="mailto:privacy@anentlab.com" className="text-blue-600 hover:underline">privacy@anentlab.com</a><br />📧 <a href="mailto:support@anentlab.com" className="text-blue-600 hover:underline">support@anentlab.com</a><br />🏢 Valencia, Comunidad Valenciana, Spain</p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">By using AnentLab, you acknowledge that you have read and understood this Privacy Policy.</p>
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