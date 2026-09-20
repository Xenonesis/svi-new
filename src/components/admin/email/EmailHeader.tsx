import { motion } from 'motion/react';
import { Mail } from 'lucide-react';

export function EmailHeader() {
  const showDevBadge =
    process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SHOW_RESEND !== 'false';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-5">
          <div>
            <h1 className="font-serif text-3xl leading-tight tracking-tight text-[#111111] md:text-[2.5rem] dark:text-white">
              Email Center
            </h1>
            <p className="mt-1 font-mono text-xs tracking-wider text-[#787774]">
              {showDevBadge
                ? 'resend · compose · send · track'
                : 'compose · manage · track · deliver'}
            </p>
          </div>
        </div>

        {/* Resend badge — dev only */}
        {showDevBadge && (
          <a
            href="https://resend.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-max items-center gap-2.5 rounded-md border border-[#EAEAEA] bg-white px-3 py-1.5 transition-transform hover:scale-[0.98] dark:border-gray-800 dark:bg-[#111111]"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded bg-[#111111] dark:bg-white">
              <Mail className="h-2.5 w-2.5 text-white dark:text-[#111111]" />
            </div>
            <span className="text-xs font-medium text-[#787774] dark:text-gray-400">
              Powered by
            </span>
            <span className="text-xs font-medium text-[#111111] dark:text-white">Resend</span>
          </a>
        )}
      </div>
    </motion.div>
  );
}
