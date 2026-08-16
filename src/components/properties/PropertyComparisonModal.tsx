'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, MapPin, Tag, Building2, Eye } from 'lucide-react';
import { useComparisonStore } from '@/src/stores/comparisonStore';
import Image from 'next/image';
import Link from 'next/link';

// Detailed comparison details not available in translations
const PROJECT_EXTRA_DETAILS: Record<
  string,
  { price: string; amenities: string[]; area: string; verifiedTitle: boolean }
> = {
  'shree-shyam-residency': {
    price: '₹65 Lakhs onwards',
    area: '1500 - 2200 sq.ft.',
    amenities: ['Clubhouse', '24/7 Security', 'Gymnasium', 'Landscaped Gardens', 'Lift Access'],
    verifiedTitle: true,
  },
  'shivani-city': {
    price: 'Sold Out',
    area: '1200 - 3000 sq.ft.',
    amenities: ['Green Parks', 'Wide Walkways', 'Water Supply', 'Street Lights'],
    verifiedTitle: true,
  },
  'shivani-residency': {
    price: '₹15 Lakhs onwards',
    area: '1000 - 2500 sq.ft.',
    amenities: ['Power Backup', 'Water Harvesting', 'Scenic Views', 'Secure Boundary'],
    verifiedTitle: true,
  },
  'shivani-vatika': {
    price: '₹18 Lakhs onwards',
    area: '1200 - 2800 sq.ft.',
    amenities: ['Gated Entrance', 'Paved Roads', 'Children Play Area', 'Water Connection'],
    verifiedTitle: false, // Under dev
  },
  'shyam-aangan': {
    price: '₹12 Lakhs onwards',
    area: '900 - 2400 sq.ft.',
    amenities: ['Clear Registry Title', 'Community Hall', 'IT Corridor Proximity', 'Parks'],
    verifiedTitle: true,
  },
};

export default function PropertyComparisonModal() {
  const t = useTranslations('pages.projects');
  const { compareList, isOpen, setOpen, removeFromCompare } = useComparisonStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
        onClick={() => setOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-brand-navy flex items-center justify-between px-6 py-4 text-white">
            <div>
              <h3 className="text-brand-gold font-serif text-2xl">Compare Properties</h3>
              <p className="text-xs text-white/70">
                Compare up to 3 selected properties side-by-side
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="max-h-[80vh] overflow-y-auto p-6">
            {compareList.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>No properties selected for comparison.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="w-1/4 py-4 pr-4 font-semibold text-gray-900 dark:text-white">
                        Feature
                      </th>
                      {compareList.map((project) => (
                        <th key={project.id} className="w-1/4 p-4 align-top">
                          <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
                            <Image
                              src={project.img}
                              alt={project.title}
                              fill
                              className="object-cover"
                            />
                            <button
                              onClick={() => removeFromCompare(project.id)}
                              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black"
                              title="Remove"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <h4 className="text-brand-navy font-serif text-base font-bold dark:text-white">
                            {project.title}
                          </h4>
                          <span className="text-brand-gold text-xs font-semibold">
                            {project.type}
                          </span>
                        </th>
                      ))}
                      {/* Placeholder columns if < 3 properties compared */}
                      {compareList.length < 3 &&
                        Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <th
                            key={`empty-${i}`}
                            className="w-1/4 p-4 text-center align-middle text-gray-300 dark:text-gray-700"
                          >
                            <div className="flex h-36 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800">
                              <Building2 className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-700" />
                              <span className="text-xs">Add property to compare</span>
                            </div>
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-gray-150 divide-y dark:divide-gray-800">
                    {/* Location */}
                    <tr>
                      <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-gray-400" /> Location
                        </span>
                      </td>
                      {compareList.map((project) => (
                        <td key={project.id} className="p-4 text-gray-700 dark:text-gray-300">
                          {project.location}
                        </td>
                      ))}
                      {compareList.length < 3 &&
                        Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} />
                        ))}
                    </tr>

                    {/* Price */}
                    <tr>
                      <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">
                        <span className="flex items-center gap-1.5">
                          <Tag size={16} className="text-gray-400" /> Starting Price
                        </span>
                      </td>
                      {compareList.map((project) => {
                        const extra = PROJECT_EXTRA_DETAILS[project.id];
                        return (
                          <td
                            key={project.id}
                            className="text-brand-navy p-4 font-semibold dark:text-white"
                          >
                            {extra ? extra.price : 'Call for price'}
                          </td>
                        );
                      })}
                      {compareList.length < 3 &&
                        Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} />
                        ))}
                    </tr>

                    {/* Area Range */}
                    <tr>
                      <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">
                        Area Range
                      </td>
                      {compareList.map((project) => {
                        const extra = PROJECT_EXTRA_DETAILS[project.id];
                        return (
                          <td key={project.id} className="p-4 text-gray-700 dark:text-gray-300">
                            {extra ? extra.area : 'Varies'}
                          </td>
                        );
                      })}
                      {compareList.length < 3 &&
                        Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} />
                        ))}
                    </tr>

                    {/* Project Status */}
                    <tr>
                      <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">
                        Status
                      </td>
                      {compareList.map((project) => (
                        <td key={project.id} className="p-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                              project.status === 'Completed' || project.status === 'पूर्ण'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : project.status === 'Sold Out' ||
                                    project.status === 'पूरी तरह से बिका'
                                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                      ))}
                      {compareList.length < 3 &&
                        Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} />
                        ))}
                    </tr>

                    {/* Verified Land Title */}
                    <tr>
                      <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">
                        Verified Land Title
                      </td>
                      {compareList.map((project) => {
                        const extra = PROJECT_EXTRA_DETAILS[project.id];
                        return (
                          <td key={project.id} className="p-4">
                            {extra?.verifiedTitle ? (
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <Check size={16} /> Yes
                              </span>
                            ) : (
                              <span className="text-gray-400">Under Review</span>
                            )}
                          </td>
                        );
                      })}
                      {compareList.length < 3 &&
                        Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} />
                        ))}
                    </tr>

                    {/* Key Amenities */}
                    <tr>
                      <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">
                        Key Amenities
                      </td>
                      {compareList.map((project) => {
                        const extra = PROJECT_EXTRA_DETAILS[project.id];
                        return (
                          <td key={project.id} className="p-4">
                            <ul className="space-y-1 text-xs">
                              {extra?.amenities.map((amenity, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
                                >
                                  <span className="bg-brand-gold h-1 w-1 rounded-full" /> {amenity}
                                </li>
                              )) || <span className="text-gray-400">Standard Amenities</span>}
                            </ul>
                          </td>
                        );
                      })}
                      {compareList.length < 3 &&
                        Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} />
                        ))}
                    </tr>

                    {/* Action button */}
                    <tr>
                      <td className="py-4 pr-4" />
                      {compareList.map((project) => (
                        <td key={project.id} className="p-4">
                          <Link
                            href="/registration"
                            onClick={() => setOpen(false)}
                            className="bg-brand-navy hover:bg-brand-gold hover:text-brand-navy flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold text-white uppercase transition-colors"
                          >
                            Inquire Now
                          </Link>
                        </td>
                      ))}
                      {compareList.length < 3 &&
                        Array.from({ length: 3 - compareList.length }).map((_, i) => (
                          <td key={i} />
                        ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
