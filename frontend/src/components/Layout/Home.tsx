import { Ticket } from 'lucide-react';

interface HomeProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function Home({ onSignIn, onSignUp }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Ticket className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-blue-600">Smart Helpdesk</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          A modern support system that connects users, agents, and admins. 
          Manage tickets, knowledge base, analytics, and more with ease.
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onSignIn}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
          >
            Sign In
          </button>
          <button
            onClick={onSignUp}
            className="px-6 py-3 rounded-xl border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-all"
          >
            Sign Up
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🎫 Easy Ticketing</h3>
            <p className="text-gray-600 text-sm">
              Create and track support tickets effortlessly with real-time updates.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Knowledge Base</h3>
            <p className="text-gray-600 text-sm">
              Access articles and guides to resolve common issues quickly.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Analytics</h3>
            <p className="text-gray-600 text-sm">
              Admins get powerful insights with detailed analytics dashboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
