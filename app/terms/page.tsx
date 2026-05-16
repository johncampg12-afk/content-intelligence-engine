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
            <p className="text-gray-500">Last updated: May 17, 2026 (version 2.3)</p>
            <p className="text-xs text-gray-400 mt-1">Please read carefully before using AnentLab.</p>
          </div>

          <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
            {/* Sección 1 muy expandida */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction and Acceptance</h2>
              <p>AnentLab ("we", "our", "us", "the Company") operates the website located at <strong>www.anentlab.com</strong> and provides a SaaS (Software‑as‑a‑Service) platform that offers AI‑driven social media analytics, content recommendations, and performance predictions for TikTok creators (the "Service").</p>
              <p className="mt-2">By accessing or using the Service in any way – including but not limited to browsing, registering an account, connecting a TikTok account, generating reports, or using our AI tools – you agree to be bound by these Terms of Service (the "Terms"). If you do not agree to all of these Terms, you must not access or use the Service.</p>
              <p className="mt-2">These Terms constitute a legally binding agreement between you and AnentLab. You affirm that you are at least 13 years old (or the age of majority in your jurisdiction) and have the legal capacity to enter into this agreement. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization.</p>
              <p className="mt-2">We may update these Terms from time to time. When we make changes, we will revise the "Last updated" date at the top of this page. In some cases, we may also notify you by email or through a notice on the Service. Your continued use of the Service after any changes constitutes acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service and delete your account.</p>
            </section>

            {/* Sección 2 expandida */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of the Service</h2>
              <p>AnentLab provides a proprietary AI‑powered analytics engine that connects to your TikTok account (via TikTok Login Kit) and performs the following functions:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Collects and analyzes your TikTok video performance metrics (views, likes, comments, shares, saves, reach, watch time, etc.).</li>
                <li>Compares your performance against aggregated, anonymized benchmarks from successful accounts in your self‑selected content niche (e.g., tutorials, humor, tech, fitness, food, travel).</li>
                <li>Generates AI‑based content recommendations, optimal posting times, viral hooks, and idea suggestions using a proprietary closed‑loop learning model (DeepSeek AI).</li>
                <li>Provides a dashboard, analytics charts, content calendar, viral predictor, and idea generator tools.</li>
                <li>Continuously learns from your results and from our niche database to improve the relevance of future recommendations.</li>
              </ul>
              <p className="mt-2">The Service is provided "as is" and "as available". We do not guarantee any specific results, such as increased views, followers, or engagement. Any predictions or recommendations generated by our AI are for informational purposes only and do not constitute professional advice. You are solely responsible for any content you create, post, or share based on our recommendations.</p>
            </section>

            {/* Sección 3 expandida (cuentas) */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Registration and Responsibilities</h2>
              <p>To access most features of the Service, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Provide accurate, current, and complete information during registration (including your email address, password, and optional profile data).</li>
                <li>Maintain the confidentiality of your login credentials and not share them with any third party.</li>
                <li>Accept full responsibility for all activities that occur under your account, whether or not you authorized them.</li>
                <li>Notify us immediately of any unauthorized use of your account or any other security breach.</li>
                <li>Comply with all applicable laws and regulations, including those related to data protection, intellectual property, and social media platform rules.</li>
              </ul>
              <p className="mt-2">You may delete your account at any time from the Settings page. Upon deletion, your personal data will be removed in accordance with our Privacy Policy. We reserve the right to suspend or terminate your account at our sole discretion, without prior notice, for any conduct that we believe violates these Terms or harms our Service or other users.</p>
            </section>

            {/* Sección 4 extremadamente detallada sobre TikTok y cumplimiento API */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. TikTok Data Collection and API Compliance (Detailed)</h2>
              <p>When you connect your TikTok account to AnentLab using the TikTok Login Kit, you expressly authorize us to access and collect the following categories of data from your TikTok account, strictly for the purpose of providing the Service described in Section 2:</p>
              <div className="bg-gray-50 p-4 rounded-lg mt-2">
                <p className="font-semibold">Scope: <strong>user.info.basic</strong></p>
                <p className="text-xs text-gray-600">Data collected: open_id, username, display name, avatar URL, profile language, account creation time.</p>
                <p className="font-semibold mt-2">Scope: <strong>user.info.profile</strong></p>
                <p className="text-xs text-gray-600">Data collected: bio description, profile link (if any), verification status (verified or not).</p>
                <p className="font-semibold mt-2">Scope: <strong>user.info.stats</strong></p>
                <p className="text-xs text-gray-600">Data collected: follower count, following count, number of likes received, total video count.</p>
                <p className="font-semibold mt-2">Scope: <strong>video.list</strong></p>
                <p className="text-xs text-gray-600">Data collected: video IDs, titles, descriptions, create timestamps, cover image URLs, view counts, like counts, comment counts, share counts, download counts, music information, duration.</p>
              </div>
              <p className="mt-3">We do <strong>not</strong> collect your TikTok password, private messages, direct messages, draft videos, or any content that is not publicly available through the authorized TikTok API endpoints. All TikTok data is stored on secure servers located in the European Union (Frankfurt, Germany), encrypted at rest using AES‑256, and cached for a maximum of 24 hours for performance reasons. After disconnection, your TikTok data is deleted from our production database within 48 hours and from backups within 30 days.</p>
              <p className="mt-2">We strictly comply with the <strong>TikTok Developer Terms of Service, TikTok API Terms of Use, and TikTok Platform Policy</strong>. We do <strong>not</strong> sell, rent, license, or share any TikTok data with third parties. We do <strong>not</strong> use TikTok data for advertising, marketing, retargeting, or any form of cross‑platform user profiling. We do <strong>not</strong> combine TikTok data with data from other sources to create user profiles for purposes other than improving our own analytics and recommendation features for the same user.</p>
              <p className="mt-2">You can revoke AnentLab's access to your TikTok data at any time by:</p>
              <ul className="list-decimal list-inside ml-4 mt-1">
                <li>Going to your TikTok app → Settings → Security → Manage app permissions → AnentLab → Remove.</li>
                <li>Disconnecting your TikTok account from your AnentLab Settings page.</li>
                <li>Deleting your AnentLab account (which will also trigger deletion of all associated data).</li>
              </ul>
              <p className="mt-2">Any violation of these terms regarding TikTok data may result in immediate termination of your account and reporting to TikTok's developer compliance team.</p>
            </section>

            {/* Sección 5: GDPR larga */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights Under the GDPR (for European Economic Area users)</h2>
              <p>If you are located in the European Economic Area (EEA), you have the following rights under the General Data Protection Regulation (GDPR) (EU) 2016/679:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>Right of access</strong> – You may request a copy of all personal data we hold about you.</li>
                <li><strong>Right to rectification</strong> – You may ask us to correct inaccurate or incomplete data.</li>
                <li><strong>Right to erasure ("right to be forgotten")</strong> – You may request that we delete your personal data.</li>
                <li><strong>Right to restriction of processing</strong> – You may ask us to temporarily stop processing your data under certain circumstances.</li>
                <li><strong>Right to data portability</strong> – You may request a machine‑readable copy of your data to transfer to another service.</li>
                <li><strong>Right to object</strong> – You may object to processing based on legitimate interests or for direct marketing.</li>
              </ul>
              <p className="mt-2">To exercise any of these rights, please contact our Data Protection Officer at <a href="mailto:privacy@anentlab.com" className="text-blue-600 hover:underline">privacy@anentlab.com</a>. We will respond within 30 days. You also have the right to lodge a complaint with your local data protection supervisory authority (e.g., the Spanish Data Protection Agency – AEPD).</p>
            </section>

            {/* Sección 6: AI y predicciones */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Artificial Intelligence Generated Content and Disclaimer</h2>
              <p>Our Service incorporates artificial intelligence models, including but not limited to DeepSeek AI (via API), to generate predictions, recommendations, and content ideas. While we strive for accuracy and relevance, AI models are not perfect. The recommendations provided by AnentLab are for informational and experimental purposes only. They do not guarantee any increase in views, followers, engagement, or monetization. You are solely responsible for the content you create, publish, or share based on these recommendations. We disclaim any liability for the results (or lack thereof) derived from using our AI‑generated outputs.</p>
            </section>

            {/* Sección 7: Propiedad intelectual */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
              <p>All content, features, and functionality of the Service – including but not limited to the software, code, databases, graphics, logos, trademarks (AnentLab, the logo), user interfaces, reports, and AI models – are the exclusive property of AnentLab and are protected by Spanish and international copyright, trademark, patent, and trade secret laws. You may not reproduce, modify, distribute, reverse engineer, or create derivative works of any part of the Service without our express written permission. You retain ownership of any original content you create using our ideas, but you grant us a non‑exclusive, royalty‑free license to use aggregated, anonymized data to improve our Service.</p>
            </section>

            {/* Sección 8: Prohibiciones */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Prohibited Uses</h2>
              <p>You agree not to use the Service for any purpose that is unlawful or prohibited by these Terms. Prohibited activities include, but are not limited to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Using the Service to harass, abuse, defame, or threaten any person.</li>
                <li>Attempting to gain unauthorized access to any part of the Service, including other users' accounts.</li>
                <li>Using automated scripts, bots, or scraping tools to extract data from the Service without permission.</li>
                <li>Interfering with the proper operation of the Service (e.g., denial‑of‑service attacks, excessive API calls).</li>
                <li>Reselling or commercializing the Service or any data obtained from it without a separate written agreement.</li>
                <li>Using the Service in any manner that violates TikTok's terms of service or any third‑party platform rules.</li>
              </ul>
            </section>

            {/* Sección 9: Terminación */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Suspension and Termination</h2>
              <p>We may suspend or terminate your access to the Service at any time, with or without cause, effective immediately, without prior notice, if you violate these Terms, engage in conduct that harms our Service or other users, or if required by law. Upon termination, your right to use the Service will cease, and we may delete your account and associated data in accordance with our data retention policies. You may also terminate your account at any time by deleting it from your Settings page.</p>
            </section>

            {/* Sección 10: Limitación de responsabilidad */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability (Important)</h2>
              <p>To the fullest extent permitted by law, AnentLab, its directors, employees, partners, and affiliates shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to loss of profits, loss of data, loss of goodwill, or business interruption, arising out of or in connection with your use of or inability to use the Service, even if we have been advised of the possibility of such damages. Our total aggregate liability to you for any claim arising from these Terms or the Service shall not exceed the amount you have paid us (if any) in the twelve months preceding the claim, or €50, whichever is greater.</p>
            </section>

            {/* Sección 11: Indemnización */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Indemnification</h2>
              <p>You agree to indemnify, defend, and hold harmless AnentLab and its officers, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to your violation of these Terms, your misuse of the Service, or your violation of any rights of a third party (including TikTok).</p>
            </section>

            {/* Sección 12: Ley aplicable */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Governing Law and Dispute Resolution</h2>
              <p>These Terms shall be governed by and construed in accordance with the laws of Spain, without regard to its conflict of laws principles. Any dispute arising out of or relating to these Terms or the Service shall be resolved exclusively in the courts located in Valencia, Spain. You agree to submit to the personal jurisdiction of such courts and waive any objection based on inconvenient forum.</p>
            </section>

            {/* Sección 13: Contacto */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact Information</h2>
              <p>If you have any questions, concerns, or complaints regarding these Terms or the Service, please contact us:</p>
              <p className="mt-1">📧 <a href="mailto:support@anentlab.com" className="text-blue-600 hover:underline">support@anentlab.com</a> (for general inquiries)</p>
              <p>📧 <a href="mailto:legal@anentlab.com" className="text-blue-600 hover:underline">legal@anentlab.com</a> (for legal notices)</p>
              <p>🏢 Address: Calle de la Innovación 123, 46001 Valencia, Spain</p>
              <p className="mt-2">For data protection matters: <a href="mailto:privacy@anentlab.com" className="text-blue-600 hover:underline">privacy@anentlab.com</a></p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
              <p>© {new Date().getFullYear()} AnentLab. All rights reserved. These Terms may be printed for your records.</p>
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