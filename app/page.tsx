import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          Content Intelligence Engine
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered content intelligence for social media. 
          Predict viral content and get automated recommendations.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Get Started
          </Link>
          <Link
            href="/register"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  )
}