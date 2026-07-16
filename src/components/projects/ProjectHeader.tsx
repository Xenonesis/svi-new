import { MapPin } from 'lucide-react';

type ProjectHeaderProps = {
  title: string;
  location: string;
  type: string;
};

export default function ProjectHeader({ title, location, type }: ProjectHeaderProps) {
  return (
    <>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
        <MapPin size={16} className="text-brand-gold" />
        <span>
          {location} • {type}
        </span>
      </div>

      <h1 className="text-brand-navy mb-6 font-serif text-4xl leading-tight md:text-5xl lg:text-6xl dark:text-white">
        {title}
      </h1>
    </>
  );
}
