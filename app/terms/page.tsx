import Link from 'next/link'

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Last updated: April 20, 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8 space-y-6">
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Welcome to Content Intelligence Engine ("Company", "we", "our", "us"). These Terms of Service ("Terms") govern your use of our website and services located at content-intelligence-engine-eta.vercel.app (the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Description of Service</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Content Intelligence Engine provides AI-powered social media analytics and content recommendations. Our service analyzes social media performance metrics, generates content ideas, predicts viral potential, and provides strategic recommendations to optimize your content strategy.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Account Registration</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              To use our Service, you must:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
              <li>Be at least 13 years old (or minimum age required in your country) and comply with TikTok's Terms of Service</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Data Collection and Usage</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              When you connect your TikTok account via TikTok Login Kit, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
              <li>TikTok basic profile (username, avatar, display name, open_id)</li>
              <li>TikTok profile data (bio description, verification status)</li>
              <li>TikTok account statistics (follower count, following count, total likes, video count)</li>
              <li>TikTok video metadata (video IDs, titles, create time, view counts, like counts, comment counts, share counts)</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
              We do NOT store TikTok video content. Data is cached for 24 hours and used exclusively to provide AI-powered analytics. You can revoke access anytime via TikTok Settings → Manage Apps or via our Settings page, which deletes all associated data within 48 hours.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. User Responsibilities</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 ml-4">
              <li>Comply with all applicable laws and regulations</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
              <li>Not attempt to bypass any security features of the Service</li>
              <li>Not interfere with or disrupt the Service or servers</li>
              <li>Not use the Service to harass, abuse, or harm others</li>
              <li>Not reverse engineer or extract the source code of the Service</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The Service and its original content, features, and functionality are owned by Content Intelligence Engine and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not modify, reproduce, distribute, or create derivative works based on our content without our express written permission.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Third-Party Services</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our Service integrates with third-party platforms including TikTok, Instagram, Facebook, and YouTube. Your use of these third-party services is subject to their respective terms of service and privacy policies. We are not responsible for the practices of these third-party platforms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7a. TikTok API Compliance</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our use of TikTok data complies with the TikTok Developer Terms of Service and API Terms. We do not transfer TikTok data to third parties, use it for advertising, or combine it with data from other sources for user profiling. All TikTok data is stored securely in the EU and processed only to provide the analytics features described in Section 2.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. AI-Generated Content</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Our Service uses artificial intelligence (DeepSeek AI) to generate content recommendations and analytics. While we strive for accuracy, AI-generated predictions and recommendations are for informational purposes only and should not be considered guaranteed results. You are solely responsible for any content you create based on our recommendations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Termination</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately. You may delete your account at any time from the Settings page.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, Content Intelligence Engine shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your use of the Service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. Disclaimer of Warranties</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the operation or availability of the Service, or the accuracy, reliability, or completeness of any content or information provided.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13. Governing Law</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of Spain, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved exclusively in the courts located in Spain.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14. Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              📧 support@contentintel.com<br/>
              🏢 Content Intelligence Engine, Valencia, Spain
            </p>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              By using Content Intelligence Engine, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}