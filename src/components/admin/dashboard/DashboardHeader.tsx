import type React from 'react';

export function DashboardHeader(): React.JSX.Element {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-brand-navy mb-2 font-serif text-4xl tracking-tight transition-colors duration-300 dark:text-white">
          System{' '}
          <span
            className="text-gradient-gold animate-bg-pan inline-block pr-2.5 italic"
            style={{
              backgroundSize: '200% 200%',
              backgroundImage:
                'linear-gradient(135deg, #d4af37, #f0d080, #b08f36, #dec070, #d4af37)',
            }}
          >
            Dashboard
          </span>
        </h1>
        <p className="text-xs tracking-wide text-gray-600 transition-colors duration-300 dark:text-gray-400">
          Manage authorized user accounts and monitor administrative access permissions.
        </p>
      </div>
    </div>
  );
}
