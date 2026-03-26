export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-gray-700">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold mt-6">1. Information We Collect</h2>
        <p>Content Intelligence Engine collects the following information from your TikTok account:</p>
        <ul className="list-disc pl-6">
          <li>Basic profile information (username, profile picture)</li>
          <li>Video content and metadata</li>
          <li>Video performance metrics (views, likes, comments, shares)</li>
          <li>Audience engagement data</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6">2. How We Use Your Information</h2>
        <p>We use this data to:</p>
        <ul className="list-disc pl-6">
          <li>Analyze content performance patterns</li>
          <li>Generate AI-powered content recommendations</li>
          <li>Provide predictive analytics for your content strategy</li>
          <li>Improve our AI models</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6">3. Data Storage</h2>
        <p>Your data is securely stored in our database. We do not share your personal information with third parties.</p>
        
        <h2 className="text-xl font-semibold mt-6">4. Your Rights</h2>
        <p>You can disconnect your TikTok account at any time. Upon disconnection, we will delete all associated data.</p>
        
        <h2 className="text-xl font-semibold mt-6">5. Contact</h2>
        <p>For questions, contact us at: support@cie.com</p>
      </div>
    </div>
  )
}