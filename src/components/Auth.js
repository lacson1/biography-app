import React, { useState } from 'react';
import { User, Lock, Mail, Eye, EyeOff, Settings, Sparkles } from 'lucide-react';
import { signIn, signUp } from '../firebase';
import { signInAsDemo, getDemoLoginLabel } from '../demoAuth';
import { isDemoLoginEnabled } from '../config/demo';

const Auth = ({ onAuthSuccess, onLocalDemoLogin, isAdmin, onAdminPanel }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError('');

    try {
      const result = await signInAsDemo();
      if (result.local && onLocalDemoLogin) {
        onLocalDemoLogin(result.user);
      } else {
        onAuthSuccess();
      }
    } catch (err) {
      const message =
        err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Wait a moment and try again.'
          : err.message || 'Demo login failed. Check Firebase Auth is enabled.';
      setError(message);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? 'Sign in to your biography app'
                : 'Start your life story journey'}
            </p>
          </div>

          {isDemoLoginEnabled && isLogin && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading || demoLoading}
                className="w-full border-2 border-dashed border-amber-300 bg-amber-50 text-amber-900 py-3 px-4 rounded-lg font-medium hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {demoLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-700" />
                    Opening demo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Continue with Demo
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-xs text-amber-800/80">
                Pre-filled sample biography · {getDemoLoginLabel()}
                <span className="block text-amber-700/70">Uses Firebase when available; otherwise saves locally in this browser.</span>
              </p>
            </div>
          )}

          {isDemoLoginEnabled && isLogin && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-500">or sign in</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>

          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onAdminPanel}
                className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
              >
                <Settings className="h-5 w-5 mr-2" />
                Admin Panel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
