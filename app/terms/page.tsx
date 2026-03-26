export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="space-y-4 text-gray-700">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold mt-6">1. Acceptance of Terms</h2>
        <p>By using Content Intelligence Engine, you agree to these Terms of Service.</p>
        
        <h2 className="text-xl font-semibold mt-6">2. Service Description</h2>
        <p>Content Intelligence Engine provides AI-powered analytics and content recommendations for social media creators.</p>
        
        <h2 className="text-xl font-semibold mt-6">3. User Responsibilities</h2>
        <p>You are responsible for maintaining the security of your account and for all content you post.</p>
        
        <h2 className="text-xl font-semibold mt-6">4. Data Usage</h2>
        <p>We analyze your social media data to provide insights. You may disconnect your accounts at any time.</p>
        
        <h2 className="text-xl font-semibold mt-6">5. Limitation of Liability</h2>
        <p>We provide the service "as is" without warranties. We are not liable for any damages arising from use of the service.</p>
        
        <h2 className="text-xl font-semibold mt-6">6. Changes to Terms</h2>
        <p>We may update these terms. Continued use constitutes acceptance.</p>
        
        <h2 className="text-xl font-semibold mt-6">7. Contact</h2>
        <p>For questions: support@cie.com</p>
      </div>
    </div>
  )
}