'use client';

import { motion } from 'motion/react';
import { FileText, Download, Calendar, Loader2 } from 'lucide-react';
import { useDocuments } from '@/src/lib/hooks/useCustomerPortal';
import { useTranslations } from 'next-intl';

export default function PortalDocuments() {
  const t = useTranslations('pages.portalDocuments');
  const { data: documents, isLoading, error } = useDocuments();

  const formatDocName = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 lg:text-3xl dark:text-white">
          {t('title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 text-sm text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
                <th className="border-b border-gray-100 px-6 py-4 font-medium dark:border-gray-700/50">
                  {t('columns.documentName')}
                </th>
                <th className="border-b border-gray-100 px-6 py-4 font-medium dark:border-gray-700/50">
                  {t('columns.type')}
                </th>
                <th className="border-b border-gray-100 px-6 py-4 font-medium dark:border-gray-700/50">
                  {t('columns.date')}
                </th>
                <th className="border-b border-gray-100 px-6 py-4 font-medium dark:border-gray-700/50">
                  {t('columns.status')}
                </th>
                <th className="border-b border-gray-100 px-6 py-4 text-right font-medium dark:border-gray-700/50">
                  {t('columns.action')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2">{t('loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-rose-500">
                    {t('loadError')}
                  </td>
                </tr>
              ) : documents?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {t('empty')}
                  </td>
                </tr>
              ) : (
                documents?.map((doc, index) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/20"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDocName(doc.document_type)}{' '}
                          {doc.amount ? `- ₹${doc.amount.toLocaleString()}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {formatDocName(doc.document_type)}
                      </span>
                    </td>
                    <td className="mt-1 flex items-center space-x-2 px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          doc.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : doc.status === 'draft'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {doc.pdf_url || doc.image_url ? (
                        <a
                          href={doc.pdf_url || doc.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0256B4] dark:hover:bg-gray-700 dark:hover:text-[#E8D17A]"
                          title={t('downloadTitle')}
                        >
                          <Download className="h-5 w-5" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
