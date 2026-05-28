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
      className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
        active
          ? 'bg-brand-gold/10 text-brand-gold'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-brand-gold text-brand-navy flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}
