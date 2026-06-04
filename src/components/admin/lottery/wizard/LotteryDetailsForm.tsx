'use client';

import { motion } from 'motion/react';
import { Zap } from 'lucide-react';

interface LotteryDetailsFormProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const PRESETS: Record<string, { title: string; desc: string }> = {
  villa: {
    title: 'SVI Grand Villa Lucky Draw',
    desc: 'Win a premium villa in our exclusive residential community.',
  },
  plot: {
    title: 'Premium Residential Plot Giveaway',
    desc: 'Win a fully developed residential plot.',
  },
  apartment: {
    title: 'Luxury High-Rise Apartment Lucky Draw',
    desc: 'Exclusive token-based draw for a premium high-rise apartment.',
  },
  commercial: {
    title: 'Commercial Space Premium Lottery',
    desc: 'Win a commercial office/shop space.',
  },
  loyalty: {
    title: 'Investor Loyalty Reward Draw',
    desc: 'Exclusive draw for our loyal investors.',
  },
  festival: {
    title: 'Festival Special Lucky Draw',
    desc: 'Festive season lucky draw for all registered customers.',
  },
};

export function LotteryDetailsForm({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: LotteryDetailsFormProps) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h3 className="font-serif text-3xl font-bold text-slate-900 dark:text-white">
          Campaign Details
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
          Give your lucky draw a grand title and exciting description.
        </p>
      </div>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
          <label className="mb-2 block text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-gray-400">
            <Zap className="text-brand-gold mr-1.5 inline h-3.5 w-3.5" /> Quick Campaign Presets
          </label>
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (!val) return;
              const p = PRESETS[val];
              if (p) {
                onTitleChange(p.title);
                onDescriptionChange(p.desc);
              }
              e.target.value = '';
            }}
            defaultValue=""
            className="focus:border-brand-gold/50 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-gray-300"
          >
            <option value="">— Select a preset to auto-fill fields —</option>
            {Object.entries(PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.title}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[10px] text-slate-400 dark:text-gray-500">
            Selecting a preset fills the title and description. You can then edit freely.
          </p>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-300">
            Lottery Title <span className="text-brand-gold">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g., Summer Villa Mega Giveaway"
            className="focus:border-brand-gold/50 w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-lg font-bold text-slate-900 transition-all outline-none focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-gray-300">
            Description / Prizes
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe the grand prize and rules..."
            rows={4}
            className="focus:border-brand-gold/50 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-900 transition-all outline-none focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
          />
        </div>
      </div>
    </motion.div>
  );
}
