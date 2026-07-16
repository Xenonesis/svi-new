type ProjectLocationMapProps = {
  mapEmbedUrl?: string;
  isHindi?: boolean;
};

export default function ProjectLocationMap({ mapEmbedUrl, isHindi }: ProjectLocationMapProps) {
  if (!mapEmbedUrl) return null;

  return (
    <section className="mt-24 w-full">
      <div className="container mx-auto mb-10 px-4 text-center">
        <h2 className="text-brand-navy mb-4 font-serif text-4xl md:text-5xl dark:text-white">
          {isHindi ? 'लोकेशन' : 'Location'}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {isHindi ? 'मैप पर प्रोजेक्ट की लोकेशन देखें' : 'Explore the project location on the map'}
        </p>
      </div>
      <div className="relative h-[500px] w-full shadow-inner md:h-[600px]">
        <iframe
          src={mapEmbedUrl}
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
