import Link from 'next/link';
import { CalendarRange, Phone, Mail } from 'lucide-react';

type ProjectActionsProps = {
  locale: string;
  slug: string;
  isHindi?: boolean;
};

export default function ProjectActions({ locale, slug, isHindi }: ProjectActionsProps) {
  return (
    <div className="mt-auto flex flex-col gap-4">
      <Link
        href={`/${locale}/contact?project=${slug}`}
        className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy flex w-full items-center justify-center gap-3 rounded-xl py-5 text-xl font-bold shadow-lg transition-all hover:-translate-y-1"
      >
        <CalendarRange size={24} />
        {isHindi ? 'साइट विजिट बुक करें' : 'Schedule a Site Visit'}
      </Link>
      <div className="flex gap-4">
        <a
          href="tel:+919218300589"
          className="bg-brand-navy hover:bg-brand-navy/90 dark:text-brand-navy flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold text-white shadow-md transition-all hover:-translate-y-1 dark:bg-white dark:hover:bg-gray-100"
        >
          <Phone size={20} />
          {isHindi ? 'कॉल करें' : 'Call Now'}
        </a>
        <a
          href="mailto:info@sviinfra.com"
          className="text-brand-navy flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white py-4 text-lg font-bold shadow-md transition-all hover:-translate-y-1 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          <Mail size={20} />
          {isHindi ? 'ईमेल करें' : 'Email Us'}
        </a>
      </div>
    </div>
  );
}
