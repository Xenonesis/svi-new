import { OfferLetterCommonProps } from './types';
import SecurityWatermark from './SecurityWatermark';
import RunningFooter from './RunningFooter';
import CorporateHeader from './CorporateHeader';
import CandidateParticularsCard from './CandidateParticularsCard';
import SalesCompensationTermsBox from './SalesCompensationTermsBox';
import OnboardingDocumentationBox from './OnboardingDocumentationBox';
import { pageFontStyles } from './utils';

export default function OfferLetterPage1({
  formData,
  companyInfo,
  matchedSlab,
  docReferenceNumber,
  currentDateFormatted,
  appointmentDateFormatted,
  targetUnit,
  isSalesDepartment,
  formatINR,
  annualCTC,
}: OfferLetterCommonProps) {
  return (
    <div
      data-pdf-page="true"
      className="offer-letter-page relative flex flex-col justify-between rounded-sm bg-white text-left font-sans text-gray-900 shadow-md ring-1 ring-black/5"
      style={{
        width: '794px',
        minHeight: '1123px',
        height: '1123px',
        maxHeight: '1123px',
        boxSizing: 'border-box',
        padding: '24px 36px 20px 36px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        ...pageFontStyles,
      }}
    >
      <SecurityWatermark />

      <div className="relative z-10 flex flex-1 flex-col">
        {/* Corporate Header / Letterhead */}
        <CorporateHeader companyInfo={companyInfo} />

        {/* Classification & Metadata Bar */}
        <div className="mb-2 flex items-center justify-between rounded border border-gray-300 bg-gray-50 px-3.5 py-1 text-[11.5px]">
          <div>
            <span className="font-bold text-gray-700">Document Ref:</span>{' '}
            <span className="font-mono font-bold text-[#1e3a8a]">{docReferenceNumber}</span>
          </div>
          <div>
            <span className="font-bold text-gray-700">Issuance Date:</span>{' '}
            <span className="font-bold text-gray-900">{currentDateFormatted}</span>
          </div>
          <div className="text-[10px] font-bold tracking-wider text-gray-800 uppercase">
            Strictly Private &amp; Confidential
          </div>
        </div>

        {/* Balanced Candidate Particulars Card */}
        <CandidateParticularsCard formData={formData} />

        {/* Subject Line */}
        <div className="mb-2 border-y border-gray-400 bg-gray-100/80 py-1 text-center">
          <h3 className="text-[12px] font-bold tracking-wide text-[#1e3a8a] uppercase">
            Subject: Formal Offer of Employment &amp; Preliminary Contract of Appointment
          </h3>
        </div>

        {/* Preamble / Recitals */}
        <div className="mb-2 space-y-0.5 text-left text-[11.5px] leading-[1.5] font-medium text-gray-800">
          <p>
            Dear{' '}
            <span className="font-bold text-[#1e3a8a]">{formData.name || '[Candidate Name]'}</span>,
          </p>
          <p>
            On behalf of <span className="font-bold text-gray-900">{companyInfo.company_name}</span>{' '}
            (&ldquo;Company&rdquo; or &ldquo;Organization&rdquo;), we are pleased to extend this
            formal offer of employment to you. Following our comprehensive evaluation of your
            credentials, professional background, and domain proficiencies, we believe your
            capabilities align with our corporate growth objectives. This document sets forth the
            comprehensive terms, conditions, mutual covenants, and governance frameworks governing
            your appointment.
          </p>
        </div>

        {/* Core Clauses 1 to 4 */}
        <div className="space-y-1.5 text-left text-[11.5px] leading-[1.5]">
          {/* Clause 1: Position & Department */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              1. Designation, Department &amp; Reporting Matrix
            </p>
            <p className="mt-0.5 text-gray-800">
              You are appointed to the corporate position of{' '}
              <span className="font-bold text-gray-900">
                {formData.designation || '[Designation]'}
              </span>{' '}
              within the{' '}
              <span className="font-bold text-gray-900">
                {formData.department || '[Department]'}
              </span>{' '}
              Department. In this capacity, you shall report directly to{' '}
              <span className="font-bold text-gray-900">
                {formData.reportingTo || '[Reporting Authority / Functional Head]'}
              </span>
              , or such other corporate officer as the Company may designate from time to time. You
              shall faithfully and diligently perform all duties incidental to your office and
              comply with all lawful corporate directives.
            </p>
          </div>

          {/* Clause 2: Location & Mobility */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              2. Date of Commencement, Work Location &amp; Mobility
            </p>
            <p className="mt-0.5 text-gray-800">
              Your appointment shall take effect on your formal joining date of{' '}
              <span className="font-bold text-gray-900">{appointmentDateFormatted}</span>{' '}
              (&ldquo;Effective Date&rdquo;). Your principal place of employment shall be situated
              at{' '}
              <span className="font-bold text-gray-900">
                {formData.location || '[Primary Office Location]'}
              </span>
              . However, the Company operates across multi-regional jurisdictions; you may be
              transferred, second-assigned, or deputed to any branch office, project site,
              subsidiary, or affiliate of the Company within India or abroad at the sole discretion
              of the Management based on operational imperatives.
            </p>
          </div>

          {/* Clause 3: Compensation & Benefits */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              3. Remuneration Structure, Performance Slabs &amp; Statutory Deductions
            </p>
            <p className="mt-0.5 text-gray-800">
              {formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand' ? (
                <>
                  The Company shall compensate you with a fixed Net In-Hand Salary of{' '}
                  <span className="font-bold text-[#1e3a8a]">
                    ₹ {formData.salaryCtc ? formatINR(formData.salaryCtc) : '[Amount]'} per month
                  </span>
                  , payable monthly in arrears directly into your designated bank account, subject
                  to applicable statutory compliances and regulatory withholdings under prevailing
                  tax and labor statutes.
                </>
              ) : (
                <>
                  The Company shall compensate you with a Gross Total Cost to Company (CTC) of{' '}
                  <span className="font-bold text-[#1e3a8a]">
                    ₹ {formData.salaryCtc ? formatINR(formData.salaryCtc) : '[Amount]'} per month
                  </span>{' '}
                  {formData.salaryCtc && (
                    <span className="font-bold text-gray-800">
                      (equivalent to an annualized CTC of ₹ {formatINR(annualCTC)})
                    </span>
                  )}
                  , payable monthly in arrears subject to applicable statutory deductions, including
                  Tax Deducted at Source (TDS) under the Income Tax Act, 1961, Employees&rsquo;
                  Provident Fund (EPF) contributions under the Employees&rsquo; Provident Funds and
                  Miscellaneous Provisions Act, 1952, Professional Tax, and ESIC where statutorily
                  mandated.
                </>
              )}
            </p>

            {/* Master Sales Compensation & Terms Box */}
            <SalesCompensationTermsBox
              formData={formData}
              matchedSlab={matchedSlab}
              targetUnit={targetUnit}
              isSalesDepartment={isSalesDepartment}
              formatINR={formatINR}
            />
          </div>

          {/* Clause 4: Mandatory Onboarding Documentation */}
          <OnboardingDocumentationBox formData={formData} companyInfo={companyInfo} />
        </div>
      </div>

      <RunningFooter
        pageNum={1}
        docReferenceNumber={docReferenceNumber}
        companyName={companyInfo.company_name}
      />
    </div>
  );
}
