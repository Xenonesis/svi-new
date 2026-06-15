'use client';

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="min-w-0 flex-1">
      <label className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus:border-brand-gold dark:bg-brand-dark-surface mt-1 w-full appearance-none truncate rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 transition-colors outline-none dark:border-white/10 dark:text-gray-300"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
