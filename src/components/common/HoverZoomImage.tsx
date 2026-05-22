import { memo } from 'react';

interface HoverZoomImageProps {
  src: string;
  alt: string;
  className?: string;
}

const HoverZoomImage = memo(function HoverZoomImage({
  src,
  alt,
  className = '',
}: HoverZoomImageProps) {
  return (
    <div className={`hover-zoom-container relative h-full w-full overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="hover-zoom-img h-full w-full object-cover"
        style={{
          transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </div>
  );
});

export default HoverZoomImage;
