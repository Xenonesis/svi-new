'use client';

import React from 'react';
import { clsx } from 'clsx';
import { TouchCard } from '@/src/components/ui/TouchCard';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  /** Whether this column represents the primary title/name on mobile cards */
  isPrimary?: boolean;
  /** Whether to show in mobile card header */
  isBadge?: boolean;
  /** Hide in mobile card view if redundant */
  hideOnMobile?: boolean;
}

export interface AdaptiveRecordTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function AdaptiveRecordTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No records found.',
  onRowClick,
  className,
}: AdaptiveRecordTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-12 text-center dark:border-white/10">
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  const primaryCol = columns.find((c) => c.isPrimary) || columns[0];
  const badgeCols = columns.filter((c) => c.isBadge);
  const detailCols = columns.filter((c) => !c.isPrimary && !c.isBadge && !c.hideOnMobile);

  return (
    <div className={clsx('w-full', className)}>
      {/* ─── MOBILE VIEW (< 768px): Card Stack ─── */}
      <div className="flex flex-col gap-3 md:hidden">
        {data.map((item) => {
          const key = keyExtractor(item);
          return (
            <TouchCard
              key={key}
              interactive={!!onRowClick}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className="flex flex-col gap-3 p-4"
            >
              {/* Card Header: Primary Title + Badges */}
              <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5 dark:border-white/5">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {primaryCol.render(item)}
                  </div>
                </div>

                {badgeCols.length > 0 && (
                  <div className="flex shrink-0 items-center gap-1.5">
                    {badgeCols.map((col) => (
                      <div key={col.key}>{col.render(item)}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Body: Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {detailCols.map((col) => (
                  <div key={col.key} className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                      {col.header}
                    </span>
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      {col.render(item)}
                    </div>
                  </div>
                ))}
              </div>
            </TouchCard>
          );
        })}
      </div>

      {/* ─── DESKTOP VIEW (>= 768px): Data Table ─── */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white md:block dark:border-white/10 dark:bg-[#111118]">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-4 py-3.5">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {data.map((item) => {
              const key = keyExtractor(item);
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={clsx(
                    'transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.02]',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
