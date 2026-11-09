import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Lock, Mail, Eye, EyeOff, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary-brand flex items-center justify-center text-white shadow-xs">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-extrabold text-main">
              Neighbour<span className="text-primary-brand">Help</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-main">Welcome Back</h1>
          <p className="text-xs text-muted-custom">
            Log in to connect with neighbours, request help, or volunteer.
          </p>
        </div>

        {/* Demo Accounts Pill Box */}
        <div className="bg-surface border border-theme rounded-3xl p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-main">
            <Sparkles className="w-3.5 h-3.5 text-primary-brand" />
            <span>Instant Demo Logins (Click to autofill)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('sarah@example.com', 'password123')}
              className="p-2 rounded-xl bg-surface-hover hover:bg-primary-light border border-theme text-left transition-colors"
            >
              <span className="font-bold text-main block">Sarah (Requester)</span>
              <span className="text-muted-custom block text-[10px]">Has active requests</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('marcus@example.com', 'password123')}
              className="p-2 rounded-xl bg-surface-hover hover:bg-primary-light border border-theme text-left transition-colors"
            >
              <span className="font-bold text-main block">Marcus (Volunteer)</span>
              <span className="text-muted-custom block text-[10px]">Student volunteer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('eleanor@example.com', 'password123')}
              className="p-2 rounded-xl bg-surface-hover hover:bg-primary-light border border-theme text-left transition-colors"
            >
              <span className="font-bold text-main block">Eleanor (Senior)</span>
              <span className="text-muted-custom block text-[10px]">Pantry & garden help</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@neighbourhelp.org', 'admin123')}
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 text-left transition-colors text-rose-700 dark:text-rose-300"
            >
              <span className="font-bold block">Community Admin</span>
              <span className="opacity-80 block text-[10px]">Full moderation panel</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-custom">
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-main mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-main mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-custom absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-custom hover:text-main"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-primary-brand text-white font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 pt-3"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-theme text-center text-xs text-muted-custom">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-primary-brand font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

