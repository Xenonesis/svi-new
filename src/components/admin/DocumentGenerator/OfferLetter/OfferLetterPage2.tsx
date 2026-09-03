import { OfferLetterCommonProps } from './types';
import SecurityWatermark from './SecurityWatermark';
import RunningHeader from './RunningHeader';
import RunningFooter from './RunningFooter';
import { pageFontStyles } from './utils';

export default function OfferLetterPage2({
  formData,
  companyInfo,
  docReferenceNumber,
  isSalesDepartment,
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

        {/* Section II Banner */}
        <div className="mb-2 border-y border-gray-400 bg-gray-100/80 py-1 text-center">
          <h3 className="text-[12px] font-bold tracking-wider text-[#1e3a8a] uppercase">
            Section II: Operational Protocols, Restrictive Covenants &amp; Governance
          </h3>
        </div>

        <div className="space-y-2 text-left text-[11.5px] leading-[1.52]">
          {/* Clause 5: Probation Period */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              5. Probationary Period, Performance Assessment &amp; Confirmation Protocols
            </p>
            <p className="mt-0.5 text-gray-800">
              You shall be placed on formal statutory probation for an initial period of{' '}
              <span className="font-bold text-gray-900">
                {formData.probationPeriod || '3'} (
                {formData.probationPeriod === '1'
                  ? 'One'
                  : formData.probationPeriod === '6'
                    ? 'Six'
                    : 'Three'}
                ) Months
              </span>{' '}
              from the Effective Date. During this period, your professional conduct, attendance,
              output quality, and quota fulfillment shall undergo continuous evaluation. Either
              party may terminate the employment within the probationary period by serving fifteen
              (15) calendar days&rsquo; written notice or salary in lieu thereof. The Company
              reserves the unilateral right to extend the probationary period by an additional
              duration if your performance is deemed unsatisfactory. Confirmation of employment is
              not automatic; confirmation shall only occur upon the issuance of an explicit, written
              Confirmation Letter executed by the Director or Head of Human Resources.
            </p>
          </div>

          {/* Clause 6: Working Hours, Customer Site Visits & Attendance */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              6. Standard Working Hours, Customer Site Visits &amp; Attendance Regimes
            </p>
            <p className="mt-0.5 text-gray-800">
              Your standard working hours shall be from{' '}
              <span className="font-bold text-gray-900">
                {formData.workingHoursStart || '10:30 AM'}
              </span>{' '}
              to{' '}
              <span className="font-bold text-gray-900">
                {formData.workingHoursEnd || '6:30 PM'}
              </span>
              , operating across the designated work week of{' '}
              <span className="font-bold text-gray-900">
                {formData.workingDays || 'Wednesday to Monday'}
              </span>{' '}
              (with weekly off scheduled on{' '}
              <span className="font-bold text-gray-900">{formData.weeklyOffDays || 'Tuesday'}</span>{' '}
              or as per departmental duty rosters). You are obligated to record your daily
              attendance via the Company&rsquo;s biometric or digital logging infrastructure.
              Punctuality is paramount; repeated unauthorized absenteeism or chronic tardiness shall
              be deemed gross misconduct.
            </p>

            {/* Customer Site Visits Policy */}
            {isSalesDepartment && Boolean(formData.includeSiteVisitPolicy ?? true) && (
              <p className="mt-0.5 text-gray-800">
                <span className="font-bold text-gray-900">
                  6.1 Mandatory Customer Site Visits &amp; Weekend Operations:
                </span>{' '}
                Real estate sales operations require active on-ground customer facilitation. You are
                contractually obligated to coordinate and execute prospective buyer site visits as
                per operational requirements (
                {formData.siteVisitSchedule ||
                  'Mandatory on Saturdays, Sundays & scheduled customer appointment slots'}
                ).
              </p>
            )}

            {/* Conveyance / Fuel Allowance */}
            {Boolean(formData.includeConveyanceAllowance) && (
              <p className="mt-0.5 text-gray-800">
                <span className="font-bold text-gray-900">
                  6.2 Field Travel &amp; Conveyance Policy:
                </span>{' '}
                To support customer property visits and field client meetings, the Company shall
                provide{' '}
                <span className="font-bold text-[#1e3a8a]">
                  {formData.conveyanceAllowanceAmount ||
                    'a monthly conveyance allowance / official travel reimbursement against verified site visit logs'}
                </span>
                , subject to submission and managerial approval of monthly travel expense logs.
              </p>
            )}
          </div>

          {/* Clause 7: Confidentiality, NDA & Trade Secrets */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              7. Comprehensive Non-Disclosure, Trade Secrets &amp; Data Protection (DPDPA 2023)
            </p>
            <p className="mt-0.5 text-gray-800">
              In the course of your employment, you will have access to proprietary trade secrets,
              investor rosters, client databases, pricing methodologies, architectural layouts,
              financial ledgers, land bank acquisitions, marketing strategies, software algorithms,
              and confidential business intelligence (&ldquo;Confidential Information&rdquo;). You
              covenant and agree to maintain absolute confidentiality of all such information during
              your tenure and perpetually following separation. You shall strictly comply with the
              Digital Personal Data Protection Act, 2023 (DPDPA) and the Information Technology Act,
              2000. You shall not divulge, copy, disclose, publish, or transmit any Confidential
              Information to third parties without prior written authorization.
            </p>
          </div>

          {/* Clause 8: Intellectual Property Assignment */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              8. Intellectual Property (IP) Ownership, Inventions &amp; Work-for-Hire Assignment
            </p>
            <p className="mt-0.5 text-gray-800">
              All intellectual property, including without limitation copyrights, design blueprints,
              branding assets, software code, marketing materials, analytical frameworks,
              operational processes, patents, and inventions developed, conceived, or authored by
              you (solely or jointly) in connection with your employment shall constitute
              &ldquo;work made for hire&rdquo; and shall be the exclusive, perpetual, and worldwide
              property of{' '}
              <span className="font-bold text-gray-900">{companyInfo.company_name}</span>. You
              hereby unconditionally assign, transfer, and convey all rights, titles, and moral
              rights in such assets to the Company and agree to execute all necessary formal
              documentation required to vest absolute legal title in the Company.
            </p>
          </div>

          {/* Clause 9: Restrictive Covenants & Non-Solicitation */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              9. Restrictive Covenants: Non-Solicitation, Lead Protection &amp; Anti-Kickback
            </p>
            <p className="mt-0.5 text-gray-800">
              <span className="font-bold text-gray-900">9.1 Exclusivity of Employment:</span> You
              shall devote your whole time, attention, and energies exclusively to the business of
              the Company. You are strictly prohibited from engaging in dual employment
              (&ldquo;moonlighting&rdquo;), commercial advisory, directorships, freelance
              consultancy, or any competing business enterprise, whether remunerated or honorary,
              without express prior written consent from the Board of Directors.
            </p>
            <p className="mt-0.5 text-gray-800">
              <span className="font-bold text-gray-900">9.2 Non-Solicitation Covenant:</span> For a
              period of twelve (12) months following the termination of your employment (for any
              reason whatsoever), you shall not directly or indirectly: (a) solicit, induce, or
              entice any client, customer, investor, vendor, or contractor of the Company to
              terminate or diminish their commercial relationship with the Company; or (b) solicit,
              recruit, or hire any employee, executive, or consultant of the Company.
            </p>
            <p className="mt-0.5 text-gray-800">
              <span className="font-bold text-gray-900">
                9.3 Company Lead Protection, Non-Diversion &amp; Anti-Kickback:
              </span>{' '}
              All prospective buyer enquiries, investor rosters, site visit logs, and client
              databases constitute strictly confidential trade secrets of the Company. You are
              expressly prohibited from: (a) diverting, transmitting, or selling Company leads or
              prospects to external real estate developers, brokers, or channel partners; (b)
              brokering or closing property transactions outside the Company for private gain; or
              (c) demanding or accepting personal kickbacks or unauthorized brokerage fees. Any
              breach constitutes criminal breach of trust (under BNS / IPC), resulting in immediate
              summary dismissal, full forfeiture of pending commissions, and criminal prosecution.
            </p>
          </div>

          {/* Clause 10: Performance Management & PIP */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              10. Performance Management Governance &amp; Performance Improvement Plan (PIP)
            </p>
            <p className="mt-0.5 text-gray-800">
              The Company maintains rigorous performance assessment standards. If your performance,
              sales conversion rate, attendance, or operational deliverable fails to achieve
              established Key Performance Indicators (KPIs), the Company reserves the prerogative to
              place you on a formal Performance Improvement Plan (PIP) for a structured period
              (typically 30 to 60 days). Under the PIP, you will receive designated objectives and
              milestone reviews. Failure to meet the requisite performance thresholds by the
              expiration of the PIP period shall constitute legitimate cause for immediate
              separation without severance.
            </p>
          </div>

          {/* Clause 11: Relocation of Reporting Location */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              11. Relocation of Reporting Location &amp; Operational Discretion
            </p>
            <p className="mt-0.5 text-gray-800">
              The Company may, at its sole operational discretion, relocate, expand, or adjust its
              principal headquarters, branch network, or project site offices. You explicitly agree
              to report to any updated corporate or project site location designated by the Company
              from time to time without claiming adjustment allowances unless formally sanctioned.
            </p>
          </div>
        </div>
      </div>

      <RunningFooter
        pageNum={2}
        docReferenceNumber={docReferenceNumber}
        companyName={companyInfo.company_name}
      />
    </div>
  );
}
