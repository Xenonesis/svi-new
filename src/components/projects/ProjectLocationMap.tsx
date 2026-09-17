import { MapPin, ExternalLink } from 'lucide-react';

type ProjectLocationMapProps = {
  mapEmbedUrl?: string;
  mapUrl?: string;
  isHindi?: boolean;
};

function getSafeEmbedUrl(embedUrl?: string, directUrl?: string): string | undefined {
  if (embedUrl && !embedUrl.includes('/maps/place/')) {
    return embedUrl;
  }
  const target = directUrl || embedUrl;
  if (!target) return undefined;

  const match =
    target.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || target.match(/3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);

  if (match) {
    return `https://maps.google.com/maps?q=${match[1]},${match[2]}&hl=en&z=16&output=embed`;
  }
  return embedUrl;
}

export default function ProjectLocationMap({
  mapEmbedUrl,
  mapUrl,
  isHindi,
}: ProjectLocationMapProps) {
  const resolvedEmbedUrl = getSafeEmbedUrl(mapEmbedUrl, mapUrl);
  if (!resolvedEmbedUrl) return null;
  return (
    <section className="mt-24 w-full">
      <div className="container mx-auto mb-10 px-4 text-center">
        <h2 className="text-brand-navy mb-4 font-serif text-4xl md:text-5xl dark:text-white">
          {isHindi ? 'लोकेशन' : 'Location'}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {isHindi ? 'मैप पर प्रोजेक्ट की लोकेशन देखें' : 'Explore the project location on the map'}
        </p>
        {mapUrl && (
          <div className="mt-4 flex justify-center">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-700 transition-all hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950 sm:text-sm dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400 dark:hover:text-slate-950"
            >
              <MapPin size={15} />
              <span>{isHindi ? 'गूगल मैप्स पर देखें' : 'Open in Google Maps'}</span>
              <ExternalLink size={13} className="opacity-70" />
            </a>
          </div>
        )}
      </div>
      <div className="relative h-[500px] w-full shadow-inner md:h-[600px]">
        <iframe
          title={isHindi ? 'प्रोजेक्ट लोकेशन मैप' : 'Project Location Map'}
          src={resolvedEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full contrast-[110%] grayscale-[20%]"
        ></iframe>
      </div>
    </section>
  );
}
