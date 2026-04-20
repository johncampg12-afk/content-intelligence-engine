import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Content<span className="gradient-text">Intel</span>
            </span>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Last updated: April 20, 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8 space-y-6">
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Content Intelligence Engine ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our Service. We comply with the General Data Protection Regulation (GDPR) and TikTok Developer Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              We collect the following types of information:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
              <li><strong>Account information</strong> - email, name, password (stored encrypted)</li>
              <li><strong>Profile preferences</strong> - content niche, goals, audience settings</li>
              <li><strong>TikTok data</strong> (see Section 3 below)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. TikTok Data Collection</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              When you connect via TikTok Login Kit, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>user.info.basic:</strong> open_id, username, display name, avatar</li>
              <li><strong>user.info.profile:</strong> bio description, profile link, verification status</li>
              <li><strong>user.info.stats:</strong> follower count, following count, likes count, video count</li>
              <li><strong>video.list:</strong> video IDs, titles, view/like/comment/share counts, publish dates (last 20 videos)</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-3">
              We do NOT collect your TikTok password, private messages, or draft videos. Data is stored in the EU (Vercel/Supabase), encrypted at rest, and cached for 24 hours. <strong>We comply with TikTok Developer Terms. We do not sell, rent, or share TikTok data with third parties, and we do not use TikTok data for advertising, marketing, or cross-platform user profiling.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Your Rights (GDPR)</h2>
            <p className="text-gray-600 dark:text-gray-300">
              You can request access, correction, or deletion of your data anytime via Settings → Delete Account or emailing privacy@contentintel.com. We delete TikTok data within 48 hours of disconnection. Data controller: Content Intelligence Engine, Valencia, Spain.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-3">
              You can also revoke access directly in TikTok: <strong>Settings → Security → Manage app permissions → Content Intelligence Engine</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. How We Use Your Data</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              We use your data to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
              <li>Provide AI-powered analytics and content recommendations</li>
              <li>Generate performance reports and predictions</li>
              <li>Improve our algorithms and service quality</li>
              <li>Communicate important updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Data Security</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We implement industry-standard security measures including encryption, secure authentication (Supabase Auth), and regular security audits. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Data Retention</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We retain your data while your account is active. When you disconnect TikTok or delete your account, your TikTok data is <strong>deleted within 48 hours from our production database and backups within 30 days</strong>. Anonymized analytics may be retained for research purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our Service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. International Data Transfers</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Your information is stored on servers in the EU (Frankfurt). We ensure appropriate safeguards are in place for data protection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Changes to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy. We will notify you of material changes by updating the "Last updated" date. Continued use constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
              If you have questions about this Privacy Policy or your data:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
              <li>Email: <a href="mailto:privacy@contentintel.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@contentintel.com</a></li>
              <li>Address: Valencia, Comunidad Valenciana, Spain</li>
            </ul>
          </section>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              By using Content Intelligence Engine, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}