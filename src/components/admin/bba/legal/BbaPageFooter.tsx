import React from 'react';
import type { BBALegalCompanyInfo } from './types';

export function BbaPageFooter({ companyInfo }: { companyInfo?: BBALegalCompanyInfo }) {
  const companyName = companyInfo?.company_name || 'SVI INFRA SOLUTIONS PVT LTD';
  return (
    <div
      style={{ marginTop: 'auto' }}
      className="flex items-end justify-between border-t border-gray-300 pt-3 text-[10px] select-none"
    >
      <div className="flex flex-col">
        <span className="font-semibold text-gray-500">Allottee Signature(s):</span>
        <span className="mt-4 w-24 border-b border-dashed border-gray-400"></span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-right font-semibold text-[#1e3a8a]">{companyName}</span>
        <div className="mt-1 h-8 w-24">
          <img
            src="/signature.png"
            alt="Director Signature"
            className="h-full w-full object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
        <span className="font-bold text-gray-600">Director</span>
      </div>
    </div>
  );
}
