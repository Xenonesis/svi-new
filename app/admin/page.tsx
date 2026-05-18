"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';

const GRID_STYLE = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201, 168, 76, 0.08) 1px, transparent 0)',
  backgroundSize: '24px 24px',
};

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.session) {
      setError(authError?.message || 'Login failed');
      setLoading(false);
      return;
    }

    // Verify admin role server-side via profile lookup
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setError('Access denied. This portal is for administrators only.');
      setLoading(false);
      return;
    }

    router.replace('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0C0C0C] flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background glow & luxury accents */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-[120px]" 
        />
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-brand-navy-light/10 rounded-full blur-[100px]" 
        />
        <div 
          className="absolute bottom-0 left-0 w-80 h-80 bg-brand-gold/5 rounded-full blur-[100px]" 
        />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-80" style={GRID_STYLE} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/80 dark:bg-[#0e0e14]/75 backdrop-blur-xl border border-gray-200 dark:border-brand-gold/15 rounded-2xl p-10 shadow-2xl relative overflow-hidden transition-colors duration-300">
          {/* Subtle gold line on top of the card */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center glow-gold">
              <ShieldCheck className="w-8 h-8 text-brand-gold" />
            </div>
          </div>

          <h1 className="text-3xl font-serif text-center text-brand-navy dark:text-white mb-2 tracking-tight transition-colors duration-300">
            Admin <span className="text-gradient-gold italic animate-bg-pan inline-block" style={{ backgroundSize: '200% 200%', backgroundImage: 'linear-gradient(135deg, #c9a84c, #f0d080, #b08f36, #dec070, #c9a84c)' }}>Portal</span>
          </h1>
          
          <div className="flex justify-center mb-8">
            <span className="inline-block px-3.5 py-1.5 bg-brand-gold/10 text-brand-gold text-[9px] font-bold uppercase tracking-[0.2em] rounded-sm border border-brand-gold/20 backdrop-blur-sm">
              SVI Infra Solutions — Restricted Access
            </span>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm mb-6 transition-colors duration-300"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@sviinfra.com"
                className="w-full bg-white dark:bg-[#111118]/80 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-gold focus:bg-gray-50 dark:focus:bg-white/5 focus:ring-2 focus:ring-brand-gold/20 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500 dark:text-gray-400 transition-colors duration-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-[#111118]/80 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 pr-12 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-brand-gold focus:bg-gray-50 dark:focus:bg-white/5 focus:ring-2 focus:ring-brand-gold/20 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 px-4 text-gray-500 hover:text-brand-gold transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 shimmer bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-bold text-xs uppercase tracking-widest py-4 rounded-lg shadow-xl glow-gold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-brand-navy/40 border-t-brand-navy rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-[9px] text-gray-500 dark:text-gray-600 mt-8 uppercase tracking-[0.15em] font-semibold transition-colors duration-300">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}
