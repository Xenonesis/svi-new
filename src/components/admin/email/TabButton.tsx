import { motion } from 'motion/react';
import { Tab } from './types';

export function TabButton({
  id: _id,
  label,
  icon: Icon,
  active,
  onClick,
  badge,
}: {
  id: Tab;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'text-brand-gold font-bold'
          : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      {active && (
        <motion.div
          layoutId="activeEmailTab"
          className="bg-brand-gold/10 border-brand-gold/20 absolute inset-0 rounded-xl border"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <Icon className="relative z-10 h-4 w-4" />
      <span className="relative z-10 hidden sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-brand-gold text-brand-navy relative z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}
