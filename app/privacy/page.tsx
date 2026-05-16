// app/privacy/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; pulse: number }>>([])

  useEffect(() => {
    const initParticles = () => {
      const newParticles = []
      for (let i = 0; i < 180; i++) {
        newParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: (Math.random() - 0.5) * 0.15,
          opacity: Math.random() * 0.4 + 0.1,
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
          return { ...p, x: newX, y: newY, opacity: Math.min(0.5, Math.max(0.05, pulseAlpha)) }
        })
      )
      animationFrame = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map((p, i) => (
          <div key={i} className="absolute rounded-full bg-blue-400/30" style={{ left: p.x, top: p.y, width: p.size, height: p.size, opacity: p.opacity, transform: 'translate(-50%, -50%)' }} />
        ))}
      </div>

      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Image src="/anentLogo.jpeg" alt="AnentLab Logo" fill className="rounded-lg object-cover shadow-sm transition-transform group-hover:scale-105" />
            </div>
            <span className="text-xl font-bold text-gray-800">Anent<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Lab</span></span>
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">← Back to Home</Link>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-500">Last updated: May 17, 2026</p>
            <p className="text-xs text-gray-400 mt-1">AnentLab – Data Protection Declaration</p>
          </div>

          <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
            <p className="italic">This document describes how AnentLab collects, uses, stores, and deletes personal data. By using the AnentLab service, the user accepts all terms below. Any questions shall be directed to privacy@anentlab.com.</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Controller and Scope</h2>
              <p>AnentLab, with registered office in Valencia, Spain, is the data controller for all information processed through the website www.anentlab.com and the associated SaaS platform. This Privacy Policy applies to all users who register an account, connect a TikTok profile, or otherwise interact with the service. AnentLab does not knowingly collect data from individuals under the age of thirteen. If such data is discovered, it will be deleted immediately.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Categories of Personal Data</h2>
              <p>When a user creates an account, AnentLab collects an email address and a password which is stored in hashed form. Optionally, the user may provide a display name and profile preferences such as content niche, content goal, target audience, a short biography, current growth phase, and main creative struggle. These data are used solely to personalize the artificial intelligence recommendations and are not shared with any external party except as necessary to provide the service.</p>
              <p className="mt-2">When the user connects a TikTok account through TikTok Login Kit, AnentLaw accesses specific scopes as mandated by TikTok Developer Terms. The accessed data includes the user’s open identifier, username, display name, avatar URL, bio description, verification status, follower count, following count, total likes received, total video count, and for the twenty most recent videos: video identifier, title, description, creation time, cover image URL, view count, like count, comment count, share count, download count, music information, and duration. No password, private message, direct message, or draft video is ever collected. AnentLab does not store the video files themselves, only the metadata listed above.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Purposes of Processing</h2>
              <p>The collected data serves the following purposes exclusively: to present analytics dashboards, to generate AI‑driven content recommendations, to predict viral potential of user ideas, to compare user performance against aggregated niche benchmarks, to maintain the content calendar, to improve the relevance of future suggestions through a closed‑loop learning system, and to provide customer support. No data is used for advertising, marketing, retargeting, or any form of cross‑platform user profiling. AnentLab does not sell, rent, or trade any personal data with third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Legal Basis (GDPR Compliance)</h2>
              <p>For users within the European Economic Area, AnentLab relies on the following legal bases: contract performance for the provision of the service (account registration, TikTok connection, analytics); consent for optional profile fields and cookies; legitimate interest for fraud prevention, service improvement, and security monitoring; and legal obligation for tax and law enforcement requests. Users may withdraw consent at any time by deleting their account or adjusting settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. TikTok API Compliance and Revocation</h2>
              <p>AnentLab strictly complies with the TikTok Developer Terms of Service, API Terms of Use, and Platform Policy. The four scopes used are user.info.basic, user.info.profile, user.info.stats, and video.list. No data obtained from TikTok is ever transferred to any third party, nor is it used for advertising or profiling outside the AnentLab service. Users may revoke access at any time directly from TikTok’s settings under “Manage app permissions” or from within the AnentLab settings page. Upon revocation or account deletion, all TikTok data is removed from the production database within forty‑eight hours and from backups within thirty days.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Data Retention and Deletion</h2>
              <p>Account data is retained for as long as the account remains active. Upon account deletion, the user’s email, profile preferences, and TikTok data are erased from the active database within forty‑eight hours. Backups may retain the data for up to thirty additional days, after which it is permanently deleted. Usage logs containing IP addresses and device information are stored for no longer than six months for security purposes. Analytics cookies are retained for up to two years unless the user clears them via browser settings.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">7. User Rights Under GDPR</h2>
              <p>Users located in the European Economic Area have the right to access their personal data, rectify inaccurate information, request erasure, restrict processing, obtain a portable copy, object to processing based on legitimate interests, and withdraw consent at any time. To exercise any of these rights, the user must send a written request to privacy@anentlab.com. AnentLab will respond within thirty days without charge. In case of manifestly unfounded or excessive requests, a reasonable fee may be charged or action refused. Users may also lodge a complaint with the Spanish Data Protection Agency (Agencia Española de Protección de Datos).</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">8. International Data Transfers</h2>
              <p>All data is primarily stored on servers located in Frankfurt, Germany, within the European Union. Certain processing, such as the use of DeepSeek AI, may involve transfers to countries that have not received an adequacy decision from the European Commission. In such cases, AnentLab relies on the EU Standard Contractual Clauses (SCCs) to ensure an adequate level of protection. Copies of these clauses can be requested from the data protection officer at dpo@anentlab.com.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Security Measures</h2>
              <p>AnentLab implements technical and organizational measures including encryption of data at rest using AES‑256, encryption in transit via TLS 1.3, regular security audits, access controls, and employee confidentiality agreements. Despite these efforts, no system is completely secure. Users are responsible for maintaining the confidentiality of their own login credentials. Any suspected breach should be reported immediately to security@anentlab.com.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Cookies and Tracking</h2>
              <p>AnentLab uses essential cookies for authentication and session management, preference cookies to remember language and theme choices, and analytics cookies via Google Analytics 4 with anonymized IP addresses. No tracking cookies from third‑party advertisers are used. Users may disable non‑essential cookies through their browser settings, but doing so may impair certain features of the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">11. Changes to This Policy</h2>
              <p>AnentLab reserves the right to update this Privacy Policy at any time. The date of the latest revision appears at the top of this page. Material changes will be notified to registered users by email or through an in‑app notice at least thirty days in advance. Continued use of the service after the effective date constitutes acceptance of the revised terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">12. Contact Information</h2>
              <p>For any matter relating to this Privacy Policy or personal data processing, the user may contact AnentLab via email at privacy@anentlab.com, or by postal mail sent to AnentLab, Valencia, Spain. The designated data protection officer can be reached at dpo@anentlab.com. Complaints to the supervisory authority are accepted at the Spanish Data Protection Agency (AEPD).</p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
              <p>© {new Date().getFullYear()} AnentLab. All rights reserved. This document may be printed for personal records.</p>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-gray-200 py-6 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AnentLab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}