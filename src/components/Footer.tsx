"use client";

import { useCallback, memo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Youtube, Instagram, MapPin, Phone, Mail, Send } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const Footer = memo(function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  }, [email]);

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <Link href="/" className="inline-block mb-6">
              <img src="/logo.png" alt="SVI Infra Solutions Pvt. Ltd." className="h-10 w-auto" />
            </Link>
            <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed text-sm">
              Where Dreams Take Address. Building trust and delivering excellence in real estate for over 15 years.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand-gold dark:hover:border-brand-gold hover:text-brand-gold transition-colors text-brand-navy dark:text-gray-200">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand-gold dark:hover:border-brand-gold hover:text-brand-gold transition-colors text-brand-navy dark:text-gray-200">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand-gold dark:hover:border-brand-gold hover:text-brand-gold transition-colors text-brand-navy dark:text-gray-200">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-brand-gold dark:hover:border-brand-gold hover:text-brand-gold transition-colors text-brand-navy dark:text-gray-200">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/" className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:text-brand-gold dark:hover:text-brand-gold transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:text-brand-gold dark:hover:text-brand-gold transition-colors">About Us</Link></li>
              <li><Link href="/leadership" className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:text-brand-gold dark:hover:text-brand-gold transition-colors">Leadership</Link></li>
              <li><Link href="/#faq" className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:text-brand-gold dark:hover:text-brand-gold transition-colors">FAQ</Link></li>
              <li><Link href="/projects/completed" className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:text-brand-gold dark:hover:text-brand-gold transition-colors">Completed Projects</Link></li>
              <li><Link href="/registration" className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:text-brand-gold dark:hover:text-brand-gold transition-colors">Register</Link></li>
              <li><Link href="/contact" className="text-xs font-bold uppercase tracking-widest text-brand-navy dark:text-gray-200 hover:text-brand-gold dark:hover:text-brand-gold transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">
              Services & Support
            </h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/payment" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-gold transition-colors">Pay Online</Link></li>
              <li><Link href="/grievance" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-gold transition-colors">Raise a Grievance</Link></li>
              <li className="text-sm font-semibold text-gray-600 dark:text-gray-400">Residential Properties</li>
              <li className="text-sm font-semibold text-gray-600 dark:text-gray-400">Commercial Properties</li>
              <li className="text-sm font-semibold text-gray-600 dark:text-gray-400">Property Management</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 dark:text-gray-500 mb-6">
              Contact Info
            </h4>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-3">
                <MapPin className="text-brand-gold shrink-0 mt-1" size={18} />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">A-61 Sector 65, Noida,<br />Uttar Pradesh 201309</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-brand-gold shrink-0" size={18} />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">+91 73000 07643</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-brand-gold shrink-0" size={18} />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">info@sviinfrasolutions.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-b border-gray-200 dark:border-gray-800 py-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-brand-navy dark:text-gray-100 mb-1">Stay Updated</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Get the latest property updates and exclusive offers in your inbox.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-3 border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-brand-navy dark:text-gray-100 focus:outline-none focus:border-brand-gold"
                required
              />
              <button
                type="submit"
                className="bg-brand-gold text-brand-navy px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-navy hover:text-brand-gold border border-brand-gold transition-colors flex items-center gap-2"
              >
                <Send size={14} />
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest text-center md:text-left">
            &copy; {CURRENT_YEAR} SVI Infra Solutions.
          </p>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            <Link href="/privacy-policy" className="hover:text-brand-gold transition-colors">Privacy</Link>
            <Link href="/terms-conditions" className="hover:text-brand-gold transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
