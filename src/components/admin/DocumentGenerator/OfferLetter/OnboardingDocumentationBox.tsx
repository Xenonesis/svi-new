import { CompanyInfo, OfferLetterFormData } from './types';

interface OnboardingDocumentationBoxProps {
  formData: OfferLetterFormData;
  companyInfo: CompanyInfo;
}

export default function OnboardingDocumentationBox({
  formData,
  companyInfo,
}: OnboardingDocumentationBoxProps) {
  if (formData.includeDocumentationBox === false) {
    return null;
  }

  return (
    <div className="mt-2 rounded border border-[#1e3a8a] bg-gray-50/90 p-2 shadow-xs">
      <div className="mb-1 flex items-center justify-between border-b border-[#1e3a8a]/30 pb-0.5">
        <p className="text-[11.5px] font-bold tracking-wide text-[#1e3a8a] uppercase">
          4. Mandatory Pre-Employment Onboarding Documentation &amp; Verification Protocols
        </p>
        <span className="text-[10px] font-bold tracking-wider text-[#1e3a8a] uppercase">
          Mandatory Submission Schedule
        </span>
      </div>
      <p className="mb-1 text-[10.5px] font-medium text-gray-900">
        In compliance with corporate governance standards, formal appointment is conditional upon
        submission of records via the{' '}
        <span className="font-bold text-[#1e3a8a]">SVI HR Onboarding Desk</span> (
        <span className="font-semibold text-[#1e3a8a]">
          {companyInfo.company_email || 'hr@sviinfrasolutions.com'}
        </span>
        ):
      </p>

      <div className="grid grid-cols-2 gap-1 text-[10.5px]">
        <div className="rounded border border-gray-300 bg-white p-1.5">
          <span className="font-bold text-[#1e3a8a]">1. Academic Credentials:</span> Copies of
          marksheets &amp; degree certificates (10th, 12th, Bachelor&rsquo;s, Post-Graduate /
          Diplomas).
        </div>
        <div className="rounded border border-gray-300 bg-white p-1.5">
          <span className="font-bold text-[#1e3a8a]">2. Photographic Records:</span> Two (2) colored
          passport-sized photos against white background.
        </div>
        <div className="rounded border border-gray-300 bg-white p-1.5">
          <span className="font-bold text-[#1e3a8a]">3. Identity Verification (Aadhaar):</span>{' '}
          Valid Government-issued Aadhaar Card copy (front &amp; reverse).
        </div>
        <div className="rounded border border-gray-300 bg-white p-1.5">
          <span className="font-bold text-[#1e3a8a]">4. Tax Registration (PAN Card):</span> Valid
          PAN Card copy issued by Income Tax Department.
        </div>
        <div className="col-span-2 rounded border border-gray-300 bg-white p-1.5">
          <span className="font-bold text-[#1e3a8a]">
            5. Prior Employment Experience &amp; Relieving Credentials:
          </span>{' '}
          Relieving letter from previous employer, resignation acceptance &amp; pay slips for 3
          consecutive months.
        </div>
      </div>
      <div className="mt-1 border-t border-gray-300 pt-0.5 text-[9.5px] font-medium text-gray-800">
        <p>
          Upload in clear{' '}
          <span className="font-bold">
            PDF, JPEG, or PNG formats (maximum file size 5MB per document)
          </span>{' '}
          within <span className="font-bold">three (3) business days</span> of acceptance. Subject
          to independent <span className="font-bold">Background Verification (BGV)</span>.
        </p>
      </div>
    </div>
  );
}
