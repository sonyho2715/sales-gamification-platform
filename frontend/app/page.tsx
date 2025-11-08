'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SG</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Gamification Platform</h1>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Turn Sales into a <span className="text-indigo-600">Game</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Motivate your sales team with real-time leaderboards, performance tracking, and gamified goals.
            Watch productivity soar as competition drives results.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg transition-colors shadow-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold text-lg transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-indigo-600 mb-2">95%</div>
            <div className="text-gray-600">Increased Team Motivation</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-indigo-600 mb-2">3x</div>
            <div className="text-gray-600">Faster Goal Achievement</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center transform hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
            <div className="text-gray-600">Real-Time Visibility</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
              Everything You Need to Motivate Your Team
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to drive sales performance and keep your team engaged.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Real-Time Leaderboards</h4>
              <p className="text-gray-600">
                See how you stack up against your colleagues with live rankings updated as sales are made.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Performance Analytics</h4>
              <p className="text-gray-600">
                Track KPIs like FCP percentage, sales per hour, and daily targets with beautiful visualizations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl p-8 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Goal Management</h4>
              <p className="text-gray-600">
                Set individual and team goals, then watch progress in real-time with Star Day achievements.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-8 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Multi-Location Support</h4>
              <p className="text-gray-600">
                Manage teams across multiple locations with location-based leaderboards and reporting.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-yellow-50 to-green-50 rounded-xl p-8 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Sales Tracking</h4>
              <p className="text-gray-600">
                Log sales quickly with transaction numbers, customer info, and automatic FCP calculations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 hover:shadow-xl transition-shadow">
              <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Role-Based Access</h4>
              <p className="text-gray-600">
                Admins, managers, and salespeople have tailored experiences with appropriate permissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-extrabold text-white mb-4">
            Ready to Boost Your Sales Team?
          </h3>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join successful organizations using gamification to drive performance and results.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 font-semibold text-lg transition-colors shadow-lg"
          >
            Start Now - It's Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 Sales Gamification Platform. All rights reserved.
            </p>
            <div className="mt-4 space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
