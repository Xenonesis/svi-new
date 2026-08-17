import { redirect } from '@/src/i18n/navigation';

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: '/projects/current', locale });
}
