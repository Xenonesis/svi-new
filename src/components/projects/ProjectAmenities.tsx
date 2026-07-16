import { CheckCircle } from 'lucide-react';

type ProjectAmenitiesProps = {
  amenities: string[];
  isHindi?: boolean;
};

export default function ProjectAmenities({ amenities, isHindi }: ProjectAmenitiesProps) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <div className="mb-10">
      <h3 className="text-brand-navy mb-6 font-serif text-2xl dark:text-white">
        {isHindi ? 'सुविधाएँ' : 'Amenities'}
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {amenities.map((amenity: string, idx: number) => (
          <div key={idx} className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 shrink-0 text-green-600" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-300">
              {amenity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
