import { OfferLetterFormData } from './types';

interface CandidateParticularsCardProps {
  formData: OfferLetterFormData;
}

export default function CandidateParticularsCard({ formData }: CandidateParticularsCardProps) {
  if (formData.includeCandidateParticularsBox === false) {
    return null;
  }

  return (
    <div className="mb-2 rounded border border-gray-300 bg-gray-50/80 px-3.5 py-1.5">
      <p className="mb-1 border-b border-gray-300 pb-0.5 text-[11px] font-bold tracking-wider text-gray-700 uppercase">
        Candidate Recipient Particulars:
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11.5px]">
        <div>
          <span className="font-bold text-gray-700">Candidate Name:</span>{' '}
          <span className="font-bold text-[#1e3a8a]">
            {formData.name || '[Candidate Full Name]'}
          </span>
        </div>
        <div>
          <span className="font-bold text-gray-700">Primary Contact:</span>{' '}
          <span className="font-bold text-gray-900">
            {formData.mobileNo ? `+91 ${formData.mobileNo}` : '[Mobile Number]'}
          </span>
          {formData.alternativeNo && (
            <span className="font-medium text-gray-700"> (Alt: +91 {formData.alternativeNo})</span>
          )}
        </div>
        <div>
          <span className="font-bold text-gray-700">Residential Address:</span>{' '}
          <span className="font-medium text-gray-900">
            {formData.address || '[Candidate Address]'}
          </span>
        </div>
        <div>
          <span className="font-bold text-gray-700">Email Address:</span>{' '}
          <span className="font-mono font-medium text-gray-900">
            {formData.emailId || '[Candidate Email ID]'}
          </span>
        </div>
      </div>
    </div>
  );
}
