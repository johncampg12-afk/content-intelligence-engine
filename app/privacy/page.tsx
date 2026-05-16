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
            <p className="text-gray-500">Last updated: May 17, 2026 (version 2.3)</p>
            <p className="text-xs text-gray-400 mt-1">This document describes how we collect, use, and protect your personal data.</p>
          </div>

          <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
            {/* Sección 1: Introducción larga */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction and Scope</h2>
              <p>AnentLab ("we", "our", "us", "the Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, process, store, and share your personal information when you use our website (www.anentlab.com) and our SaaS platform (the "Service"). It also describes your rights under applicable data protection laws, including the General Data Protection Regulation (GDPR) (EU) 2016/679, the Spanish Organic Law 3/2018 on Data Protection and Digital Rights (LOPDGDD), and other relevant legislation.</p>
              <p className="mt-2">This Privacy Policy applies to all users of the Service, whether registered or not, and covers information collected through the website, the API, the dashboard, and any related communications. By accessing or using the Service, you acknowledge that you have read and understood this Privacy Policy and agree to the collection and processing of your data as described herein.</p>
              <p className="mt-2">If you do not agree with any part of this Privacy Policy, you must immediately stop using the Service and delete your account if you have one. We may update this policy from time to time. The latest version will always be posted at this URL, and we will notify you of any material changes via email or an in‑app notice at least 30 days in advance.</p>
            </section>

            {/* Sección 2: Controlador de datos y DPO */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Data Controller and Data Protection Officer (DPO)</h2>
              <p>The data controller responsible for your personal data is:</p>
              <p className="mt-1">AnentLab S.L.<br />Calle de la Innovación 123<br />46001 Valencia, Spain<br />Email: <a href="mailto:legal@anentlab.com" className="text-blue-600 hover:underline">legal@anentlab.com</a></p>
              <p className="mt-2">We have appointed a Data Protection Officer (DPO) who can be contacted at <a href="mailto:dpo@anentlab.com" className="text-blue-600 hover:underline">dpo@anentlab.com</a> for any questions regarding data protection matters.</p>
            </section>

            {/* Sección 3: Qué datos recogemos (tabla) */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Categories of Personal Data We Collect</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr><th className="border p-2 text-left">Category</th><th className="border p-2 text-left">Examples</th><th className="border p-2 text-left">Legal Basis</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="border p-2">Account Data</td><td className="border p-2">Email, name, encrypted password, account creation date, subscription status</td><td className="border p-2">Contract performance, legal obligation</td></tr>
                    <tr><td className="border p-2">Profile Preferences</td><td className="border p-2">Content niche, content goal, target audience, creator bio, current phase, main struggle</td><td className="border p-2">Consent, contract performance</td></tr>
                    <tr><td className="border p-2">TikTok Data (via Login Kit)</td><td className="border p-2">See Section 4 below – explicit scopes</td><td className="border p-2">Consent, legitimate interest (improving service)</td></tr>
                    <tr><td className="border p-2">Usage Data</td><td className="border p-2">IP address, browser type, device info, pages visited, time spent, clicks</td><td className="border p-2">Legitimate interest (security, analytics)</td></tr>
                    <tr><td className="border p-2">Cookies</td><td className="border p-2">Session cookies, preference cookies, analytics cookies (Google Analytics anonymized)</td><td className="border p-2">Consent (via cookie banner)</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Sección 4: TikTok scopes (repetido y detallado) */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. TikTok Data – Explicit Scopes and Purpose</h2>
              <p>When you connect your TikTok account using TikTok Login Kit, you grant us access to the following data categories. We use each scope only for the purpose described:</p>
              <div className="bg-gray-50 p-4 rounded-lg mt-2">
                <p className="font-semibold">🔹 user.info.basic</p>
                <p><strong>Data:</strong> open_id (unique identifier), username, display name, avatar URL, profile language, account creation time.</p>
                <p><strong>Purpose:</strong> Identify your TikTok account, display your username and avatar in our dashboard, associate analytics with your profile.</p>
                <p className="font-semibold mt-2">🔹 user.info.profile</p>
                <p><strong>Data:</strong> bio description, profile link, verification status.</p>
                <p><strong>Purpose:</strong> Analyze your public profile to tailor recommendations; show your bio in the settings page.</p>
                <p className="font-semibold mt-2">🔹 user.info.stats</p>
                <p><strong>Data:</strong> follower count, following count, total likes received, total video count.</p>
                <p><strong>Purpose:</strong> Track growth metrics, compare your performance against niche benchmarks, and display statistics in the dashboard.</p>
                <p className="font-semibold mt-2">🔹 video.list</p>
                <p><strong>Data:</strong> For your last 20 published videos: video ID, title, description, create timestamp, cover image URL, view count, like count, comment count, share count, download count, music info, duration.</p>
                <p><strong>Purpose:</strong> Analyze performance metrics, generate engagement charts, identify top‑performing content, and feed our AI recommendation engine.</p>
              </div>
              <p className="mt-3">We do <strong>not</strong> access your password, private messages, direct messages, draft videos, or any content you have not published. We do <strong>not</strong> store your TikTok videos – only the metadata and metrics described above. All TikTok data is stored in encrypted form on servers located in Frankfurt, Germany (EU). The data is cached for up to 24 hours to improve performance, after which it may be refreshed from TikTok API.</p>
              <p className="mt-2">We comply with the <strong>TikTok Developer Terms of Service, API Terms of Use, and Platform Policy</strong>. We do <strong>not</strong> sell, rent, or share any TikTok data with any third party. We do <strong>not</strong> use TikTok data for advertising, retargeting, or any form of cross‑platform user profiling. We do <strong>not</strong> combine TikTok data with data from other sources to create profiles for purposes other than improving our analytics and recommendation features for the same user.</p>
            </section>

            {/* Sección 5: Propósito del tratamiento */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Purposes of Processing</h2>
              <p>We process your personal data for the following purposes:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>To provide, maintain, and improve the Service (e.g., generating analytics, content recommendations, viral predictions).</li>
                <li>To personalize user experience (e.g., remembering your content niche and goals).</li>
                <li>To communicate with you about updates, security alerts, and support messages.</li>
                <li>To monitor and analyze usage patterns and technical performance.</li>
                <li>To detect, prevent, and address fraud, security issues, or technical problems.</li>
                <li>To comply with legal obligations (e.g., tax, anti‑fraud, data protection requests).</li>
              </ul>
            </section>

            {/* Sección 6: Base legal */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Legal Basis for Processing (GDPR)</h2>
              <p>We rely on the following legal bases as appropriate:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>Contract performance:</strong> Processing necessary to provide the Service you requested (e.g., account registration, TikTok connection, analytics).</li>
                <li><strong>Consent:</strong> For optional data collection (e.g., cookies, some profile fields, marketing emails). You may withdraw consent at any time.</li>
                <li><strong>Legitimate interests:</strong> To improve our Service, prevent fraud, ensure security, and conduct business analytics, where such interests are not overridden by your rights.</li>
                <li><strong>Legal obligation:</strong> To comply with tax, anti‑money laundering, or lawful requests from authorities.</li>
              </ul>
            </section>

            {/* Sección 7: Retención de datos (tabla de plazos) */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention Periods</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50"><tr><th className="border p-2">Data Type</th><th className="border p-2">Retention Period</th><th className="border p-2">Justification</th></tr></thead>
                  <tbody>
                    <tr><td className="border p-2">Account data</td><td className="border p-2">Until account deletion + 30 days for backup</td><td className="border p-2">Contract performance, legal backup</td></tr>
                    <tr><td className="border p-2">TikTok data (active connection)</td><td className="border p-2">While connected + 48 hours after disconnection</td><td className="border p-2">Service provision, user request</td></tr>
                    <tr><td className="border p-2">TikTok data (backups)</td><td className="border p-2">Up to 30 days after disconnection</td><td className="border p-2">Legal compliance, disaster recovery</td></tr>
                    <tr><td className="border p-2">Usage logs (IP, device)</td><td className="border p-2">6 months</td><td className="border p-2">Security, fraud detection</td></tr>
                    <tr><td className="border p-2">Analytics cookies</td><td className="border p-2">Session and persistent up to 2 years</td><td className="border p-2">User preference</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2">After the retention period, data is permanently deleted or anonymized. You may request earlier deletion of your data as described in Section 10.</p>
            </section>

            {/* Sección 8: Compartición con terceros */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Third‑Party Disclosures</h2>
              <p>We do not sell, rent, or trade your personal data. We may share your data only with the following categories of recipients, under strict confidentiality obligations:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>Service providers:</strong> Infrastructure hosting (Vercel, Supabase), AI processing (DeepSeek API), email services (Resend), analytics (Google Analytics anonymized).</li>
                <li><strong>Legal authorities:</strong> When required by law, court order, or to protect our rights or the safety of users.</li>
                <li><strong>Corporate transactions:</strong> In the event of a merger, acquisition, or sale of assets, data may be transferred subject to the same privacy commitments.</li>
              </ul>
              <p className="mt-2">All third‑party processors are contractually obligated to implement appropriate security measures and to use your data only for the purposes specified by us.</p>
            </section>

            {/* Sección 9: Transferencias internacionales */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. International Data Transfers</h2>
              <p>Your data is primarily stored on servers located in the European Union (Frankfurt, Germany). However, some processing may involve transfers to third countries (e.g., when using AI services). We ensure that any such transfer is subject to appropriate safeguards, such as the EU Standard Contractual Clauses (SCCs) or an adequacy decision by the European Commission. You can request a copy of these safeguards by contacting our DPO.</p>
            </section>

            {/* Sección 10: Derechos del usuario (GDPR) */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Your Rights Under GDPR (Detailed)</h2>
              <p>As a data subject in the European Economic Area (EEA), you have the following rights:</p>
              <ol className="list-decimal list-inside ml-4 space-y-2">
                <li><strong>Right to access</strong> – You can request a copy of all personal data we hold about you.</li>
                <li><strong>Right to rectification</strong> – You can ask us to correct inaccurate or incomplete data.</li>
                <li><strong>Right to erasure ("right to be forgotten")</strong> – You can request deletion of your data when it is no longer necessary for the purposes for which it was collected, or when you withdraw consent.</li>
                <li><strong>Right to restriction of processing</strong> – You can ask us to temporarily stop processing your data under certain circumstances (e.g., while we verify accuracy).</li>
                <li><strong>Right to data portability</strong> – You can request a structured, commonly used, machine‑readable copy of your data and have it transferred to another controller.</li>
                <li><strong>Right to object</strong> – You can object to processing based on legitimate interests or for direct marketing purposes.</li>
                <li><strong>Right to withdraw consent</strong> – Where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of processing before withdrawal.</li>
                <li><strong>Right to lodge a complaint</strong> – You have the right to file a complaint with your local supervisory authority (for Spain: Agencia Española de Protección de Datos – AEPD, www.aepd.es).</li>
              </ol>
              <p className="mt-2">To exercise any of these rights, send a written request to <a href="mailto:privacy@anentlab.com" className="text-blue-600 hover:underline">privacy@anentlab.com</a> or via postal mail to our address. We will respond within 30 days, free of charge. In case of manifestly unfounded or excessive requests, we may charge a reasonable fee or refuse to act.</p>
            </section>

            {/* Sección 11: Seguridad */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Data Security Measures</h2>
              <p>We implement technical and organizational measures to protect your data, including:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Encryption of data at rest (AES‑256) and in transit (TLS 1.3).</li>
                <li>Regular security audits and penetration testing.</li>
                <li>Access controls and authentication via Supabase Auth.</li>
                <li>Short retention of sensitive data and automatic deletion after disconnection.</li>
                <li>Employee training on data protection and confidentiality agreements.</li>
              </ul>
              <p className="mt-2">Despite these measures, no system is completely secure. If you believe your data has been compromised, please contact us immediately.</p>
            </section>

            {/* Sección 12: Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Cookies and Tracking Technologies</h2>
              <p>We use cookies and similar technologies to enhance your experience, analyze usage, and provide certain features. The types of cookies we use include:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>Essential cookies:</strong> Required for authentication and basic functionality (cannot be disabled).</li>
                <li><strong>Preference cookies:</strong> Remember your language and theme preferences.</li>
                <li><strong>Analytics cookies:</strong> We use Google Analytics 4 with anonymized IP addresses to collect aggregated usage data. You can opt out by installing the Google Analytics Opt‑out Browser Add‑on.</li>
                <li><strong>Security cookies:</strong> Help detect and prevent fraud.</li>
              </ul>
              <p className="mt-2">You can manage your cookie preferences through your browser settings. However, disabling essential cookies may prevent you from using the Service properly.</p>
            </section>

            {/* Sección 13: Menores */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Children's Privacy</h2>
              <p>The Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such data, please contact us immediately, and we will take steps to delete it.</p>
            </section>

            {/* Sección 14: Cambios a esta política */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Changes to This Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. The latest version will always be posted at this URL. If we make material changes, we will notify you via email (if you have provided one) or through an in‑app notice at least 30 days in advance. Your continued use of the Service after the changes become effective constitutes acceptance of the revised policy.</p>
            </section>

            {/* Sección 15: Contacto */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Contact Information</h2>
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact us:</p>
              <p className="mt-1">📧 Data Protection Officer: <a href="mailto:dpo@anentlab.com" className="text-blue-600 hover:underline">dpo@anentlab.com</a></p>
              <p>📧 General inquiries: <a href="mailto:support@anentlab.com" className="text-blue-600 hover:underline">support@anentlab.com</a></p>
              <p>📧 Legal matters: <a href="mailto:legal@anentlab.com" className="text-blue-600 hover:underline">legal@anentlab.com</a></p>
              <p>🏢 Postal address: Calle de la Innovación 123, 46001 Valencia, Spain</p>
              <p className="mt-2">You may also contact the Spanish Data Protection Agency (AEPD) at <a href="https://www.aepd.es" className="text-blue-600 hover:underline">www.aepd.es</a>.</p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
              <p>© {new Date().getFullYear()} AnentLab. All rights reserved. This Privacy Policy may be printed for your records.</p>
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