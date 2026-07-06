'use client';

import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { Briefcase, Users, Target, Star, Zap, Heart, Award } from 'lucide-react';

type Career = {
  id: string;
  title: string;
  type: string;
  salary: string;
  icon: string;
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase size={28} />,
  Users: <Users size={28} />,
  Target: <Target size={28} />,
  Star: <Star size={28} />,
  Zap: <Zap size={28} />,
  Heart: <Heart size={28} />,
  Award: <Award size={28} />,
};

interface OnsiteRolesProps {
  roles: Career[];
}

export default function OnsiteRoles({ roles }: OnsiteRolesProps) {
  if (roles.length === 0) {
    return (
      <div className="mb-16 text-center text-gray-400 dark:text-gray-500">
        No job openings at this time. Check back soon.
      </div>
    );
  }

  return (
    <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
      {roles.map((job, idx) => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="hover:border-brand-gold dark:hover:border-brand-gold group border border-gray-100 bg-white p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 sm:p-10 dark:border-gray-700 dark:bg-gray-900 dark:shadow-none"
        >
          <div className="text-brand-navy group-hover:text-brand-gold dark:group-hover:text-brand-gold group-hover:border-brand-gold mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gray-100 bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {ICON_MAP[job.icon] ?? <Briefcase size={28} />}
          </div>
          <h3 className="text-brand-navy mb-4 font-serif text-xl dark:text-gray-100">
            {job.title}
          </h3>
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <CheckCircle size={14} className="text-brand-gold" />
            <span>{job.type}</span>
          </div>
          <div className="bg-brand-bg text-brand-gold inline-block rounded-sm px-4 py-2 text-lg font-bold dark:bg-gray-800">
            {job.salary}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
