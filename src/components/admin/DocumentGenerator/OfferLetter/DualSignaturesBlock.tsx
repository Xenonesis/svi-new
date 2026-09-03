import { CompanyInfo, OfferLetterFormData } from './types';

interface DualSignaturesBlockProps {
  companyInfo: CompanyInfo;
  formData: OfferLetterFormData;
  currentDateFormatted: string;
}

export default function DualSignaturesBlock({
  companyInfo,
  formData,
  currentDateFormatted,
}: DualSignaturesBlockProps) {
  return (
    <div className="mt-3.5 rounded border border-gray-400 bg-gray-50/80 p-3.5 shadow-xs">
      <div className="grid grid-cols-2 items-end gap-5">
        {/* Employer Execution Block */}
        <div className="border-r border-gray-300 pr-3">
          <p className="mb-0.5 text-[11px] font-bold tracking-wider text-gray-700 uppercase">
            Issued For and on behalf of Organization:
          </p>
          <p className="text-[12.5px] font-bold text-[#1e3a8a] uppercase">
            {companyInfo.company_name}
          </p>
          <div className="my-1.5">
            <img
              src="/signature.png"
              alt="Authorized Signatory"
              className="h-16 w-auto object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
          <p className="text-[12px] font-bold text-gray-900">Iliyas Ali</p>
          <p className="text-[11px] font-semibold text-gray-700">
            Director &amp; Authorized Signatory
          </p>
          <p className="mt-0.5 text-[10.5px] text-gray-600">
            Date of Issuance: {currentDateFormatted}
          </p>
        </div>

        {/* Candidate Acceptance & Attestation Block */}
        <div className="pl-1 text-[11px]">
          <p className="mb-0.5 text-[11.5px] font-bold tracking-wider text-gray-900 uppercase">
            Candidate Formal Acceptance &amp; Attestation:
          </p>
          <p className="mb-2.5 text-[10px] leading-snug font-medium text-gray-700 italic">
            &ldquo;I hereby unconditionally accept this offer of employment and agree to abide by
            all terms, covenants, onboarding documentation requirements via the designated SVI HR
            Onboarding Desk, and policies outlined herein. I affirm all credentials provided are
            authentic and truthful.&rdquo;
          </p>
          <div className="space-y-1.5 text-[11px] text-gray-900">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Candidate Signature:</span>
              <span className="inline-block w-36 border-b border-gray-500"></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Full Legal Name:</span>
              <span className="inline-block w-36 truncate border-b border-gray-400 text-right font-bold text-gray-900">
                {formData.name || '____________________'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Date of Execution:</span>
              <span className="inline-block w-36 border-b border-gray-500"></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Place / City:</span>
              <span className="inline-block w-36 border-b border-gray-500"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
