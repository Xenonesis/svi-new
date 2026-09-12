import React from 'react';
import type { BBALegalCompanyInfo } from './types';

export function BbaPageFooter({
  companyInfo,
  style,
  className,
  pageNumber,
}: {
  companyInfo?: BBALegalCompanyInfo;
  style?: React.CSSProperties;
  className?: string;
  pageNumber?: number | string;
}) {
  const companyName = companyInfo?.company_name || 'SVI INFRA SOLUTIONS PVT LTD';
  return (
    <div
      style={{ marginTop: 'auto', ...style }}
      className={`mt-4 border-t border-slate-300 pt-2.5 pb-2 text-[11px] select-none ${className || ''}`}
    >
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
            Allottee Signature(s)
          </span>
          <span className="mt-3 w-32 border-b border-dashed border-slate-400"></span>
        </div>
        {pageNumber !== undefined && (
          <div className="flex flex-col items-center">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-600">
              Page {pageNumber} of 16
            </span>
            <span className="mt-0.5 font-mono text-[8.5px] tracking-tight text-slate-400">
              Sviinfrasolutions Pvt. Ltd. / BBA LEGAL
            </span>
          </div>
        )}
        <div className="flex flex-col items-end">
          <span className="text-right text-[11px] font-bold tracking-wide text-[#0f2942]">
            {companyName}
          </span>
          <div className="my-0.5 h-7 w-24">
            <img
              src="/signature.png"
              alt="Director Signature"
              className="ml-auto h-full w-full object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
          <span className="text-[9.5px] font-bold tracking-wider text-slate-600 uppercase">
            Authorized Signatory / Director
          </span>
        </div>
      </div>
    </div>
  );
}
