"use client";

import { motion } from 'motion/react';
import { UserCircle2, ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Login functionality will be integrated with the backend.");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="pt-24 pb-20 bg-brand-navy min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '40px 40px' }}></div>
      
      <div className="container mx-auto px-4 relative z-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-50 border border-gray-200 text-brand-navy rounded-full flex items-center justify-center mx-auto mb-6">
               <UserCircle2 size={32} />
            </div>
            <h1 className="text-3xl font-serif text-brand-navy mb-2">Client Portal</h1>
            <p className="text-gray-500 text-sm">Log in to view your property documents and payment schedules.</p>
          </div>

          <div className="flex border-b border-gray-200 mb-8">
            <button 
              onClick={() => setLoginMethod('password')}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${loginMethod === 'password' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Password
            </button>
            <button 
              onClick={() => setLoginMethod('otp')}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-colors ${loginMethod === 'otp' ? 'text-brand-navy border-b-2 border-brand-navy' : 'text-gray-400 hover:text-gray-600'}`}
            >
              OTP Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-navy">Registered Email / Phone</label>
              <input type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors" />
            </div>

            {loginMethod === 'password' ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-navy">Password</label>
                  <a href="#" className="text-[10px] text-brand-gold hover:underline">Forgot?</a>
                </div>
                <input type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-none focus:border-brand-gold transition-colors" />
              </div>
            ) : (
              <button type="button" className="text-xs font-bold uppercase tracking-widest text-brand-gold border border-brand-gold py-2 px-4 w-full hover:bg-brand-gold hover:text-brand-navy transition-colors">
                Get OTP
              </button>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-brand-navy text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-gold hover:text-brand-navy transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>Log In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            Don't have an account? <Link href="/registration" className="text-brand-navy font-bold hover:text-brand-gold transition-colors">Register here</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
