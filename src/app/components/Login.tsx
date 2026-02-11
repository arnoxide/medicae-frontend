import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, LogIn, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/auth/login', {
        email,
        password,
      });

      // Store tokens and user data
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      localStorage.setItem('practice', JSON.stringify(response.data.data.practice));

      toast.success('Welcome back!', {
        description: `Logged in as ${response.data.data.user.firstName} ${response.data.data.user.lastName}`,
      });

      // Navigate to clinic home
      navigate('/clinic');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Login failed';
      setError(errorMessage);
      toast.error('Login failed', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/20 mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Medicae account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-900/5 border border-gray-100/50 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-sm"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400 shadow-lg shadow-blue-600/30 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/setup"
                className="text-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
              >
                Complete Setup
              </Link>
              <Link
                to="/join"
                className="text-center px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
              >
                Join Clinic
              </Link>
            </div>
            <p className="text-center">
              <Link
                to="/onboarding"
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                or create a new clinic
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
