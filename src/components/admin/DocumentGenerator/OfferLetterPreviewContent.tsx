import React from 'react';

interface OfferLetterFormData {
  date?: string;
  name?: string;
  address?: string;
  mobileNo?: string;
  alternativeNo?: string;
  emailId?: string;
  designation?: string;
  department?: string;
  reportingTo?: string;
  appointmentDate?: string;
  location?: string;
  salaryCtc?: string;
  target?: string;
  offerSlab?: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingDays?: string;
  probationPeriod?: string;
}

interface CompanyInfo {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
}

export default function OfferLetterPreviewContent({
  formData,
  companyInfo,
}: {
  formData: OfferLetterFormData;
  companyInfo: CompanyInfo;
}) {
  return (
    <div className="bg-white p-8 font-sans text-[13px] leading-relaxed text-black">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold tracking-wide text-[#1e3a8a] uppercase">
            {companyInfo.company_name}
          </h1>
          <p className="text-gray-700">
            Cell: {companyInfo.company_phone} | Email: {companyInfo.company_email}
          </p>
          <p className="text-gray-700">Website: {companyInfo.company_website}</p>
          <p className="text-gray-700">Office Address : {companyInfo.company_address}</p>
        </div>
        <div className="w-48">
          <img
            src="/logo.png"
            alt={companyInfo.company_name}
            className="h-auto w-full object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      </div>

      {/* Date & To */}
      <div className="mb-6">
        <p className="mb-4">
          <span className="font-bold">Date:</span>{' '}
          {formData.date || new Date().toISOString().split('T')[0].split('-').reverse().join('-')}
        </p>
        <p className="font-bold">To,</p>
        <p className="font-bold">{formData.name || '[Candidate Name]'}</p>
        <p className="font-bold whitespace-pre-wrap">{formData.address || '[Address]'}</p>
        {formData.mobileNo && <p className="font-bold">Mobile NO : +91 {formData.mobileNo}</p>}
      </div>

      {/* Subject */}
      <div className="mb-6 text-center">
        <h3 className="font-bold uppercase underline">Subject: Offer of Employment</h3>
      </div>

      {/* Body */}
      <div className="mb-6 space-y-4 text-justify">
        <p>
          Dear <span className="font-bold">{formData.name || '[Candidate Name]'}</span>,
        </p>
        <p>
          We are pleased to offer you the position of{' '}
          <span className="font-bold">{formData.designation || '[Designation]'}</span> with{' '}
          {companyInfo.company_name}, a leading real estate organization known for excellence in
          property development and customer service. Your skills and experience make you a valuable
          addition to our team.
        </p>
        <p>
          Your appointment will be effective from{' '}
          <span className="font-bold">{formData.appointmentDate || '[Date]'}</span> under the
          following terms and conditions:
        </p>
      </div>

      {/* Terms & Conditions */}
      <div className="mb-6 space-y-3 text-justify">
        <p>
          <span className="font-bold">1. Position & Department</span>
          <br />
          You will be designated as{' '}
          <span className="font-bold">{formData.designation || '[Designation]'}</span> in the{' '}
          <span className="font-bold">{formData.department || '[Department]'}</span> Department and
          will report to{' '}
          <span className="font-bold">{formData.reportingTo || '[Reporting To]'}</span>.
        </p>
        <p>
          <span className="font-bold">2. Location of Posting</span>
          <br />
          Your primary work location will be{' '}
          <span className="font-bold">{formData.location || '[Location]'}</span>. However, you may
          be required to travel or relocate as per company requirements.
        </p>
        <p>
          <span className="font-bold">3. Salary & Benefits</span>
          <br />
          Your total compensation will be ₹{' '}
          <span className="font-bold">
            {formData.salaryCtc
              ? parseFloat(formData.salaryCtc).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : '[Amount]'}
          </span>
          {formData.target && (
            <>
              {' '}
              (Target – <span className="font-bold">{formData.target}</span>
            </>
          )}
          {formData.offerSlab && <> = {formData.offerSlab}</>}
          {formData.target && ')'}, which includes all statutory benefits as applicable. Additional
          performance based incentives will be provided as per company policy.
        </p>
        <p>
          <span className="font-bold">4. Working Hours</span>
          <br />
          Your working hours will be from{' '}
          <span className="font-bold">{formData.workingHoursStart || '10:30 am'}</span> to{' '}
          <span className="font-bold">{formData.workingHoursEnd || '6:30 pm'}</span>, Days of the
          Week, <span className="font-bold">{formData.workingDays || 'Wednesday to Monday'}</span>.
        </p>
        <p>
          <span className="font-bold">5. Probation Period</span>
          <br />
          You will be on probation for a period of{' '}
          <span className="font-bold">
            {formData.probationPeriod || '3'} month{formData.probationPeriod !== '1' ? 's' : ''}
          </span>
          . Upon successful completion, your employment may be confirmed in writing.
        </p>
        <p>
          <span className="font-bold">6. Duties & Responsibilities</span>
          <br />
          You are expected to perform the duties assigned to you diligently, promote company
          interests, and maintain professionalism with clients and colleagues.
        </p>
        <p>
          <span className="font-bold">7. Termination</span>
          <br />
          Either party may terminate the employment within probation period written notice or salary
          in lieu thereof.
        </p>
        <p>
          <span className="font-bold">8. Confidentiality</span>
          <br />
          You are required to maintain the confidentiality of all company and client information
          during and after your employment.
        </p>
      </div>

      {/* Closing */}
      <div className="mb-10 space-y-4 text-justify">
        <p>
          We look forward to welcoming you to {companyInfo.company_name} and working together
          towards mutual success.
        </p>
        <p>Please sign and return a copy of this letter as your acceptance of the offer.</p>
      </div>

      {/* Footer / Signatures */}
      <div className="mt-12 flex items-end justify-between">
        <div>
          <p className="mb-2">
            For <span className="font-bold text-[#1e3a8a]">{companyInfo.company_name}</span>
          </p>
          <img
            src="/signature.png"
            alt="Signature"
            className="mb-2 h-12 w-auto opacity-80 mix-blend-multiply"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
          <p className="font-bold">Ilyas Ali</p>
          <p className="text-gray-600">( Director )</p>
        </div>
        <div className="text-right">
          <p className="mb-1 font-bold">Accepted and Signed by:</p>
          <div className="space-y-1">
            <p>
              Name:{' '}
              <span className="border-b border-black px-8">
                {formData.name || '__________________'}
              </span>
            </p>
            <p>
              Signature: <span className="border-b border-black px-8">__________________</span>
            </p>
            <p>
              Date: <span className="border-b border-black px-8">__________________</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
