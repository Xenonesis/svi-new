import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="pt-24 min-h-screen flex items-center justify-center bg-brand-bg dark:bg-gray-900 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <span className="text-9xl font-serif font-bold text-brand-gold/20">404</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-brand-navy dark:text-gray-100 mb-6">
            Page Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4 leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
          <p className="text-brand-gold italic font-serif text-xl mb-12">
            "Where Dreams Take Address" — but not this one.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="bg-brand-gold text-brand-navy px-8 py-4 font-bold uppercase text-xs tracking-widest shadow-xl transition-colors hover:bg-brand-navy hover:text-brand-gold border border-brand-gold flex items-center gap-2"
            >
              <Home size={16} />
              Back to Home
            </Link>
            <Link
              href="/contact"
              className="text-brand-navy dark:text-gray-200 px-8 py-4 font-bold uppercase text-xs tracking-widest transition-colors hover:text-brand-gold flex items-center gap-2 border border-brand-navy dark:border-gray-200"
            >
              <ArrowLeft size={16} />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
