export interface AreaOverviewSectionProps {
  content: string;
  title?: string;
  isHindi?: boolean;
}

export function AreaOverviewSection({ content, title, isHindi = false }: AreaOverviewSectionProps) {
  const heading = title || (isHindi ? 'पड़ोस का अवलोकन' : 'Neighborhood Overview');

  return (
    <section className="mb-12">
      <h2 className="text-brand-navy mb-6 font-serif text-2xl dark:text-white">{heading}</h2>
      <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">{content}</p>
    </section>
  );
}

export default AreaOverviewSection;
