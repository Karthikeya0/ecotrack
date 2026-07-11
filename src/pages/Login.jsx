import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { isFirebaseAvailable } from '../firebase';
import { Leaf, Mail, Lock, User, ArrowRight, Sparkles, Zap } from 'lucide-react';

const Login = () => {
  const { login, register, enableDemoMode, showToast } = useApp();
  const navigate = useNavigate();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (isRegistering && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isRegistering) {
        await register(formData.email, formData.name, formData.password);
        showToast("Registration successful! Welcome to EcoTrack.", "success");
      } else {
        await login(formData.email, formData.password);
        showToast("Welcome back!", "success");
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrors({ api: err.message || "An authentication error occurred. Please try again." });
      showToast(err.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    enableDemoMode();
    navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

        {/* Brand header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <Leaf className="h-8 w-8 fill-emerald-500/10 animate-pulse-slow" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold font-outfit text-white tracking-tight">
            {isRegistering ? 'Start tracking today' : 'Welcome to EcoTrack'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Monitor and reduce your daily carbon footprint
          </p>
        </div>

        {/* Main form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          
          {/* Server API error message */}
          {errors.api && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
              {errors.api}
            </div>
          )}

          {isRegistering && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full pl-10 glass-input"
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="text-rose-400 text-xs pl-1 font-medium mt-1">{errors.name}</p>}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full pl-10 glass-input"
                disabled={loading}
              />
            </div>
            {errors.email && <p className="text-rose-400 text-xs pl-1 font-medium mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-10 glass-input"
                disabled={loading}
              />
            </div>
            {errors.password && <p className="text-rose-400 text-xs pl-1 font-medium mt-1">{errors.password}</p>}
          </div>

          {/* Form Action buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-emerald-950/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegistering ? 'Create Eco Account' : 'Sign In'}</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Separator lines */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-900"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-slate-900"></div>
        </div>

        {/* Demo Mode trigger */}
        <div className="space-y-3">
          <button
            onClick={handleDemoMode}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all focus:outline-none disabled:opacity-50"
          >
            <Zap className="h-4 w-4 fill-amber-400/20" />
            <span>Explore in Demo Mode</span>
          </button>
          {!isFirebaseAvailable && (
            <p className="text-[11px] text-slate-500 text-center leading-normal">
              Firebase is currently not configured in your settings. Access cloud storage by setting credentials.
            </p>
          )}
        </div>

        {/* Form Toggle Link */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrors({});
            }}
            disabled={loading}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-colors focus:outline-none"
          >
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
