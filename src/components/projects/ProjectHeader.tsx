import { MapPin, ExternalLink } from 'lucide-react';

type ProjectHeaderProps = {
  title: string;
  location: string;
  type?: string;
  subtitle?: string;
  mapUrl?: string;
};

export default function ProjectHeader({
  title,
  location,
  type,
  subtitle,
  mapUrl,
}: ProjectHeaderProps) {
  const displayText = subtitle || (type ? `${location} • ${type}` : location);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
          <MapPin size={16} className="text-brand-gold" />
          <span>{displayText}</span>
        </div>

        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group border-brand-gold/70 text-brand-gold hover:border-brand-gold inline-flex items-center gap-2 rounded-full border bg-[#161a22] px-3.5 py-1 text-xs font-bold shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#1f2430] active:scale-95"
          >
            <MapPin size={13} className="text-brand-gold" />
            <span>Open in Google Maps</span>
            <ExternalLink
              size={12}
              className="text-brand-gold opacity-90 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        )}
      </div>

      <h1 className="text-brand-navy mb-6 font-serif text-4xl leading-tight md:text-5xl lg:text-6xl dark:text-white">
        {title}
      </h1>
    </>
  );
}
