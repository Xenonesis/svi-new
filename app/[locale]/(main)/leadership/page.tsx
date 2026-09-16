'use client';

import { useTranslations } from 'next-intl';
import LeadershipFAQ from '@/src/components/faq/AboutFAQ';
import { LeadershipSchema } from '@/src/components/leadership/LeadershipSchema';
import { LeadershipHero } from '@/src/components/leadership/LeadershipHero';
import { LeadershipHierarchy } from '@/src/components/leadership/LeadershipHierarchy';
import { LeadershipCTA } from '@/src/components/leadership/LeadershipCTA';

export default function Leadership() {
  const t = useTranslations('pages.leadership');

  const hierarchy = {
    directors: [
      {
        name: t('data.iliyasAli.name'),
        role: t('data.iliyasAli.role'),
        bio: t('data.iliyasAli.bio'),
      },
      {
        name: t('data.vinodKumar.name'),
        role: t('data.vinodKumar.role'),
        bio: t('data.vinodKumar.bio'),
      },
    ],
    areaManagers: [
      {
        name: t('data.radheShyam.name'),
        role: t('data.radheShyam.role'),
      },
      {
        name: t('data.kailash.name'),
        role: t('data.kailash.role'),
      },
    ],
    hrManager: {
      name: t('data.hrManager.name'),
      role: t('data.hrManager.role'),
    },
    teamLead: {
      name: t('data.teamLead.name'),
      role: t('data.teamLead.role'),
    },
    staff: [
      { role: t('data.bde.role') },
      { role: t('data.bdm.role') },
      { role: t('data.telecaller.role') },
    ],
  };

  return (
    <div className="page-transition min-h-screen bg-gray-50 pt-20 pb-16 dark:bg-gray-900">
      <LeadershipSchema directors={hierarchy.directors} />
      <LeadershipHero />
      <LeadershipHierarchy hierarchy={hierarchy} />
      <LeadershipCTA />
      <LeadershipFAQ />
    </div>
  );
}
