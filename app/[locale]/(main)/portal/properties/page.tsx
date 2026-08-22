'use client';

import { motion } from 'motion/react';
import { Building2, MapPin, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { useAllotments } from '@/src/lib/hooks/useCustomerPortal';
import { useTranslations } from 'next-intl';

export default function PortalProperties() {
  const t = useTranslations('pages.portalProperties');
  const { data: properties, isLoading } = useAllotments();

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-3 font-serif text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
            {t('title')}
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
        </div>
      </div>

      {!isLoading && properties?.length === 0 ? (
        <div className="col-span-full rounded-2xl border border-gray-100 bg-white py-12 text-center text-gray-500 dark:border-gray-700/50 dark:bg-gray-800 dark:text-gray-400">
          {t('empty')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties?.map((property, index) => {
            const projectData = Array.isArray(property.properties)
              ? property.properties[0]
              : property.properties || {};
            const projectName = (projectData as any)?.name || t('unknownProject');
            const location = (projectData as any)?.location || t('locationPending');
            const imageUrl =
              (projectData as any)?.image_url ||
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400';

            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800"
              >
                <div className="relative h-48 flex-shrink-0 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={projectName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="rounded-full border border-emerald-100 bg-white/90 px-3 py-1 text-sm font-medium text-emerald-600 shadow-sm backdrop-blur-sm dark:border-emerald-800 dark:bg-gray-900/90 dark:text-emerald-400">
                      {property.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-grow flex-col p-6">
                  <h3 className="mb-2 line-clamp-1 text-xl font-bold text-gray-900 dark:text-white">
                    {projectName}
                  </h3>

                  <div className="mt-4 flex-grow space-y-3">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Building2 className="mr-3 h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {t('unit')} {property.unit_no}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="mr-3 h-4 w-4 text-gray-400" />
                      <span className="line-clamp-1">{location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="mr-3 h-4 w-4 text-gray-400" />
                      <span>
                        {t('allottedOn')} {new Date(property.allotted_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-700/50">
                    <button className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gray-50 py-2.5 font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:bg-gray-700/50 dark:text-white dark:hover:bg-gray-700">
                      <span>{t('viewDetails')}</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
