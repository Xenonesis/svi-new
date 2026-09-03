import { OfferLetterCommonProps } from './types';
import SecurityWatermark from './SecurityWatermark';
import RunningHeader from './RunningHeader';
import RunningFooter from './RunningFooter';
import DualSignaturesBlock from './DualSignaturesBlock';
import { pageFontStyles } from './utils';

export default function OfferLetterPage3({
  formData,
  companyInfo,
  docReferenceNumber,
  currentDateFormatted,
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
        <RunningHeader docReferenceNumber={docReferenceNumber} />

        {/* Section III Banner */}
        <div className="mb-2.5 border-y border-gray-400 bg-gray-100/80 py-1 text-center">
          <h3 className="text-[12px] font-bold tracking-wider text-[#1e3a8a] uppercase">
            Section III: Terms of Separation, Legal Governance &amp; Formal Acceptance
          </h3>
        </div>

        <div className="space-y-2 text-left text-[11.5px] leading-[1.52]">
          {/* Clause 12: Termination of Employment */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              12. Termination of Employment, Cash Handling Rules &amp; Summary Dismissal
            </p>
            <p className="mt-0.5 text-gray-800">
              <span className="font-bold text-gray-900">12.1 Notice Periods:</span> During
              probation, either party may terminate the employment by serving fifteen (15) calendar
              days&rsquo; written notice or basic salary in lieu thereof. Post-confirmation, notice
              period shall be thirty (30) calendar days or salary in lieu, subject to full handover
              clearance.
            </p>
            <p className="mt-0.5 text-gray-800">
              <span className="font-bold text-gray-900">
                12.2 Zero-Tolerance Direct Cash Handling &amp; Unauthorized Collections:
              </span>{' '}
              All customer booking tokens, earnest money, and installment payments must strictly be
              deposited directly into the Company&rsquo;s official bank accounts against authorized
              printed SVI receipts. You are strictly barred from accepting direct cash payments from
              clients or soliciting funds into your personal bank account / UPI ID under any
              circumstances. Any violation constitutes financial fraud and embezzlement, triggering
              immediate summary dismissal without dues and the lodging of a Police FIR.
            </p>
            <p className="mt-0.5 text-gray-800">
              <span className="font-bold text-gray-900">12.3 Summary Dismissal for Cause:</span> The
              Company reserves the right to immediately terminate employment without notice or
              terminal benefits for: (a) breach of confidentiality, IP theft, or lead diversion; (b)
              financial fraud, unauthorized cash collection, or criminal conduct; (c) submission of
              forged onboarding credentials; (d) gross insubordination; or (e) continuous
              unauthorized absence exceeding three (3) business days.
            </p>
            <p className="mt-0.5 text-gray-800">
              <span className="font-bold text-gray-900">12.4 Asset Handover &amp; NOC:</span> Upon
              separation, all Company laptops, keycards, records, client lists, and digital
              credentials must be surrendered immediately prior to final dues settlement.
            </p>
          </div>

          {/* Clause 13: Indemnification */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">13. Indemnification</p>
            <p className="mt-0.5 text-gray-800">
              You agree to indemnify, defend, and hold harmless the Company, its Directors, and
              officers against all liabilities, claims, damages, losses, and legal costs arising
              from your willful misconduct, gross negligence, fraudulent representations, or breach
              of statutory duties.
            </p>
          </div>

          {/* Clause 14: Governing Law & Dispute Resolution */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              14. Governing Law &amp; Dispute Resolution
            </p>
            <p className="mt-0.5 text-gray-800">
              This contract is governed by the laws of India. Any disputes arising hereunder shall
              be referred to sole binding arbitration pursuant to the Arbitration and Conciliation
              Act, 1996 in Gautam Buddha Nagar (Noida), with exclusive jurisdiction vested in the
              competent courts of Gautam Buddha Nagar, Uttar Pradesh.
            </p>
          </div>

          {/* Clause 15: Entire Agreement & Validity */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              15. Entire Agreement, Severability &amp; Offer Expiration
            </p>
            <p className="mt-0.5 text-gray-800">
              This document constitutes the entire agreement between the parties and supersedes all
              prior communications. This offer shall automatically lapse within{' '}
              <span className="font-bold text-gray-900">five (5) business days</span> from issuance
              unless countersigned and returned alongside the mandatory onboarding records.
            </p>
          </div>
        </div>

        {/* Balanced Dual Signatures & Execution Section */}
        <DualSignaturesBlock
          companyInfo={companyInfo}
          formData={formData}
          currentDateFormatted={currentDateFormatted}
        />
      </div>

      <RunningFooter
        pageNum={3}
        docReferenceNumber={docReferenceNumber}
        companyName={companyInfo.company_name}
      />
    </div>
  );
}
