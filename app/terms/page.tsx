// app/terms/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function TermsPage() {
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
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-500">Last updated: May 17, 2026</p>
            <p className="text-xs text-gray-400 mt-1">AnentLab – Legal Agreement for Use of the Service</p>
          </div>

          <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
            <p className="italic">These Terms of Service form a binding legal contract between AnentLab and any person or entity accessing or using the AnentLab website or SaaS platform. By registering, connecting a TikTok account, or otherwise interacting with the service, the user agrees to be bound by all terms set forth below. Any questions regarding these Terms should be directed to legal@anentlab.com.</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
              <p>AnentLab provides an artificial intelligence powered social media analytics and content recommendation service for TikTok creators. Access to and use of the service is conditional upon the user’s explicit acceptance of these Terms. If the user does not agree to any part of these Terms, the user must immediately cease using the service and delete any existing account. AnentLab reserves the right to update these Terms at any time. The date of the latest revision appears at the top of this page. Registered users will be notified of material changes by email or through an in‑application notice at least thirty days before they become effective. Continued use of the service after the effective date constitutes acceptance of the modified Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Eligibility and Account Registration</h2>
              <p>The service is not intended for persons under the age of thirteen years. AnentLab does not knowingly collect or process data from individuals under thirteen. By creating an account, the user affirms that the user is at least thirteen years old and, if required by applicable law, of the legal age to enter into a binding contract. The user agrees to provide accurate, current, and complete information during the registration process, including a valid email address and a secure password. The user is solely responsible for maintaining the confidentiality of the account credentials and for all activities that occur under the account. AnentLab disclaims any liability for unauthorised access due to negligence in safeguarding login details.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Description of the Service</h2>
              <p>AnentLab offers a SaaS platform that connects to a user’s TikTok account through the official TikTok Login Kit. After connection, the service collects metadata and metrics from the user’s TikTok profile and up to twenty of the most recent videos, as detailed in the Privacy Policy. Using proprietary algorithms and third‑party artificial intelligence services, AnentLab then generates analytics dashboards, performance charts, content recommendations, optimal posting time predictions, viral potential scores, idea generators, and a content calendar. The service also includes a closed‑loop learning system that tracks which recommendations lead to actual published content and adjusts future suggestions based on that performance. All predictions and recommendations are for informational purposes only and do not constitute guaranteed results. AnentLab does not guarantee any increase in views, followers, engagement, or monetization. The user assumes full responsibility for any content created, posted, or shared based on the recommendations provided by the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. TikTok Data Access and API Compliance</h2>
              <p>By connecting a TikTok account, the user authorises AnentLab to access the specific scopes required by TikTok Developer Terms: user.info.basic, user.info.profile, user.info.stats, and video.list. AnentLab does not request or collect any password, private message, direct message, or draft video. The service uses the obtained data solely to provide the features described in Section 3. AnentLab complies with all applicable TikTok Developer Terms, API Terms of Use, and Platform Policies. AnentLab does not sell, rent, or share TikTok data with any third party, nor does it use TikTok data for advertising, marketing, retargeting, or cross‑platform user profiling. The user may revoke AnentLab’s access at any time directly from the TikTok application settings or from within the AnentLab settings page. Upon revocation or account deletion, all TikTok data is removed from the production database within forty‑eight hours and from backups within thirty days.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Prohibited Uses and Conduct</h2>
              <p>The user agrees not to use the service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the service. Prohibited activities include but are not limited to attempting to gain unauthorised access to any part of the service, using automated scripts or scrapers to extract data, interfering with the proper operation of the service, reselling or commercialising the service without a separate written agreement, and violating any third‑party platform rules including those of TikTok. AnentLab reserves the right to suspend or terminate any account that engages in such prohibited conduct, with or without prior notice.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Intellectual Property</h2>
              <p>All content, features, and functionality of the AnentLab service, including but not limited to the software, code, databases, graphics, logos, trademarks, user interfaces, reports, and AI models, are the exclusive property of AnentLab and are protected by Spanish and international intellectual property laws. The user may not reproduce, modify, distribute, reverse engineer, or create derivative works of any part of the service without the express written permission of AnentLab. The user retains ownership of any original content created using the service’s ideas, but grants AnentLab a non‑exclusive, royalty‑free license to use aggregated, anonymised data to improve the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">7. AI‑Generated Content and Disclaimers</h2>
              <p>The service incorporates artificial intelligence models, including DeepSeek AI, to generate predictions, recommendations, and content ideas. Such outputs are generated based on statistical patterns and user-provided data; they are not guaranteed to be accurate, complete, or up‑to‑date. AnentLab disclaims all liability for any loss or damage arising from reliance on AI‑generated content. The user is solely responsible for evaluating the suitability of any recommendation and for any content created as a result.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Termination and Suspension</h2>
              <p>AnentLab may suspend or terminate the user’s account at any time, with or without cause, effective immediately, without prior notice, if the user violates these Terms, engages in conduct that harms the service or other users, or if required by law. Upon termination, the user’s right to use the service will cease, and AnentLab may delete the account and associated data in accordance with the data retention policies described in the Privacy Policy. The user may also terminate the account at any time by deleting it from the settings page.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, AnentLab, its directors, employees, partners, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, loss of data, loss of goodwill, or business interruption, arising out of or in connection with the use of or inability to use the service, even if AnentLab has been advised of the possibility of such damages. The total aggregate liability of AnentLab for any claim arising from these Terms or the service shall not exceed the amount paid by the user (if any) in the twelve months preceding the claim, or fifty euros, whichever is greater.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Indemnification</h2>
              <p>The user agrees to indemnify, defend, and hold harmless AnentLab and its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses, including reasonable attorneys’ fees, arising out of or related to the user’s violation of these Terms, misuse of the service, or violation of any rights of a third party, including TikTok.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">11. Governing Law and Dispute Resolution</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of Spain, without regard to its conflict of laws principles. Any dispute arising out of or relating to these Terms or the service shall be resolved exclusively in the courts located in Valencia, Spain. The user agrees to submit to the personal jurisdiction of such courts and waives any objection based on inconvenient forum. For users located outside Spain, AnentLab may seek injunctive relief in any competent jurisdiction to protect its intellectual property or confidential information.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">12. Changes to the Service</h2>
              <p>AnentLab reserves the right to modify, suspend, or discontinue any part of the service at any time, with or without notice. AnentLab shall not be liable to the user or any third party for any modification, suspension, or discontinuation of the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">13. Entire Agreement and Severability</h2>
              <p>These Terms constitute the entire agreement between the user and AnentLab regarding the use of the service, superseding any prior agreements or understandings. If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">14. Contact Information</h2>
              <p>Any questions regarding these Terms of Service should be directed to AnentLab via email at legal@anentlab.com. Notices may also be sent by postal mail to AnentLab, Valencia, Spain. AnentLab does not provide a phone number for support; all inquiries must be made in writing.</p>
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