import type { ComponentType } from 'react';
import {
  CheckCircle,
  ShieldCheck,
  Trees,
  Droplets,
  Zap,
  Video,
  DoorClosed,
  Fence,
  Car,
  UserCheck,
  Building2,
  Dumbbell,
  Waves,
} from 'lucide-react';

type ProjectAmenitiesProps = {
  amenities: string[];
  isHindi?: boolean;
};

const getAmenityIcon = (name: string): ComponentType<{ className?: string }> => {
  const lower = name.toLowerCase();
  if (lower.includes('cctv') || lower.includes('camera') || lower.includes('सीसीटीवी'))
    return Video;
  if (lower.includes('24/7') || lower.includes('security') || lower.includes('सुरक्षा'))
    return ShieldCheck;
  if (lower.includes('gate') || lower.includes('गेट')) return DoorClosed;
  if (lower.includes('bound') || lower.includes('बाउंड्री')) return Fence;
  if (
    lower.includes('park') ||
    lower.includes('garden') ||
    lower.includes('पार्क') ||
    lower.includes('गार्डन')
  )
    return Trees;
  if (
    lower.includes('guard') ||
    lower.includes('care-taker') ||
    lower.includes('caretaker') ||
    lower.includes('गार्ड') ||
    lower.includes('केयरटेकर')
  )
    return UserCheck;
  if (lower.includes('water') || lower.includes('पानी')) return Droplets;
  if (lower.includes('electric') || lower.includes('बिजली') || lower.includes('power')) return Zap;
  if (lower.includes('road') || lower.includes('सड़क')) return Car;
  if (lower.includes('gym') || lower.includes('जिम')) return Dumbbell;
  if (lower.includes('pool') || lower.includes('पूल')) return Waves;
  if (lower.includes('club') || lower.includes('क्लब')) return Building2;
  return CheckCircle;
};

export default function ProjectAmenities({ amenities, isHindi }: ProjectAmenitiesProps) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <div className="mb-10">
      <h3 className="text-brand-navy mb-6 font-serif text-2xl dark:text-white">
        {isHindi ? 'सुविधाएँ' : 'Amenities'}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {amenities.map((amenity: string, idx: number) => {
          const Icon = getAmenityIcon(amenity);
          return (
            <div
              key={idx}
              className="hover:border-brand-gold/40 flex items-center gap-3.5 rounded-xl border border-gray-100 bg-white/80 p-3.5 shadow-xs backdrop-blur-xs transition-colors dark:border-gray-800 dark:bg-gray-800/80"
            >
              <div className="bg-brand-gold/10 text-brand-navy dark:bg-brand-gold/20 dark:text-brand-gold flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {amenity}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
