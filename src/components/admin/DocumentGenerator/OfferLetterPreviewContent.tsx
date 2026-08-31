import React from 'react';
import { SALARY_SLABS, SalarySlabType } from '@/src/components/admin/OfferLetter/SlabSelector';

export interface OfferLetterFormData {
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
  salaryType?: string;
  target?: string;
  targetUnit?: 'Sq. Yd.' | 'Sq. Ft.' | 'Lakhs' | 'Crores' | string;
  offerSlab?: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingDays?: string;
  probationPeriod?: string;
  salesCompensationType?: string;
  noSaleMonths?: string;
  customSalaryPercent?: string;
  subsistenceAllowance?: string;
  meetingsPerMonth?: string;
  gracePeriodMonths?: string;
  reducedSalaryPercent?: string;
  enablePartialTargetRule?: boolean | string;
  partialTargetSalaryPercent?: string;
  commissionReleasePercent?: string;
  includeSiteVisitPolicy?: boolean | string;
  siteVisitSchedule?: string;
  weeklyOffDays?: string;
  includeConveyanceAllowance?: boolean | string;
  conveyanceAllowanceAmount?: string;
  includeSalesPolicyBox?: boolean;
  includeDocumentationBox?: boolean;
  includeCandidateParticularsBox?: boolean;
}

export interface CompanyInfo {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_website: string;
}

interface OfferLetterPreviewContentProps {
  formData: OfferLetterFormData;
  companyInfo: CompanyInfo;
  matchedSlab?: SalarySlabType | null;
}

export default function OfferLetterPreviewContent({
  formData,
  companyInfo,
  matchedSlab: initialMatchedSlab,
}: OfferLetterPreviewContentProps) {
  const isSalesDepartment = formData.department === 'Sales';
  const targetUnit = formData.targetUnit || 'Sq. Yd.';

  // Resolve matched slab if not explicitly passed
  const matchedSlab =
    initialMatchedSlab !== undefined
      ? initialMatchedSlab
      : formData.salaryCtc
        ? SALARY_SLABS.find((s) => parseFloat(formData.salaryCtc || '0') === s.salary) || null
        : formData.target
          ? SALARY_SLABS.find((s) => parseFloat(formData.target || '0') === s.target) || null
          : null;

  // Format dates consistently (DD-MM-YYYY)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    }
    return dateStr;
  };

  const currentDateFormatted = formatDate(formData.date);
  const appointmentDateFormatted = formatDate(formData.appointmentDate);

  const docRefYear = formData.date
    ? formData.date.split('-')[0].length === 4
      ? formData.date.split('-')[0]
      : new Date().getFullYear()
    : new Date().getFullYear();

  const candidateInitials =
    formData.name
      ?.split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 3)
      .join('') || 'CND';

  const docReferenceNumber = `SVI/HR-OFFER/${docRefYear}/${candidateInitials}-${formData.mobileNo ? formData.mobileNo.slice(-4) : '2026'}`;

  const formatINR = (val?: string | number) => {
    if (!val) return '0.00';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const monthlyCTC = parseFloat(formData.salaryCtc || '0');
  const annualCTC = monthlyCTC * 12;

  // Running Header Component for Page 2
  const RunningHeader = () => (
    <div className="mb-3.5 flex items-center justify-between border-b border-gray-400 pb-2 text-[11.5px] text-gray-700">
      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Company Logo"
          className="h-7 w-auto object-contain"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <span className="text-gray-400">|</span>
        <span className="font-semibold tracking-wide text-gray-800 uppercase">
          Employment Contract &amp; Offer of Appointment
        </span>
      </div>
      <div className="text-right font-mono font-bold text-gray-800">{docReferenceNumber}</div>
    </div>
  );

  // Running Footer Component for both pages
  const RunningFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="mt-auto flex items-center justify-between border-t border-gray-400 pt-2.5 text-[11px] text-gray-600">
      <div>
        <span className="font-bold text-gray-800">CONFIDENTIAL &amp; PROPRIETARY</span> &mdash;{' '}
        {companyInfo.company_name}
      </div>
      <div className="font-mono font-medium text-gray-700">Ref: {docReferenceNumber}</div>
      <div className="flex items-center gap-3">
        <span>
          Candidate Initials:{' '}
          <span className="inline-block border-b border-gray-500 px-4 font-mono">______</span>
        </span>
        <span className="font-bold text-gray-900">Page {pageNum} of 2</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white text-left font-sans text-[12px] leading-[1.5] text-gray-900">
      {/* ========================================================================= */}
      {/* ────────────────────────────── PAGE 1 ─────────────────────────────────── */}
      {/* ========================================================================= */}
      <div
        className="relative flex flex-col justify-between bg-white px-6 py-5 sm:px-7 sm:py-5"
        style={{
          boxSizing: 'border-box',
        }}
      >
        {/* Background Watermark */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.02]">
          <img
            src="/logo.png"
            alt="Watermark"
            className="w-[60%] max-w-md object-contain grayscale"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>

        <div className="relative z-10 flex flex-col">
          {/* Corporate Header / Letterhead */}
          <div className="mb-2.5 flex items-start justify-between border-b-2 border-[#1e3a8a] pb-2">
            <div>
              <h1 className="text-[22px] leading-tight font-bold tracking-wide text-[#1e3a8a] uppercase">
                {companyInfo.company_name}
              </h1>
              <p className="mt-0.5 text-[11.5px] font-semibold text-gray-800">
                Corporate Real Estate, Infrastructure Advisory &amp; Strategic Project Development
              </p>
              <p className="mt-0.5 text-[11px] text-gray-700">
                Contact:{' '}
                <span className="font-bold text-gray-900">{companyInfo.company_phone}</span>{' '}
                &nbsp;|&nbsp; Email:{' '}
                <span className="font-bold text-gray-900">{companyInfo.company_email}</span>
                &nbsp;|&nbsp; Web:{' '}
                <span className="font-bold text-gray-900">{companyInfo.company_website}</span>
              </p>
              <p className="text-[10.5px] text-gray-600">Office: {companyInfo.company_address}</p>
            </div>
            <div className="w-36 flex-shrink-0 text-right">
              <img
                src="/logo.png"
                alt={companyInfo.company_name}
                className="ml-auto h-11 w-auto object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          </div>

          {/* Classification & Metadata Bar */}
          <div className="mb-2.5 flex items-center justify-between rounded border border-gray-300 bg-gray-50 px-3.5 py-1.5 text-[11.5px]">
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
          {Boolean(formData.includeCandidateParticularsBox ?? true) && (
            <div className="mb-2.5 rounded border border-gray-300 bg-gray-50/70 px-3.5 py-2">
              <p className="mb-1 border-b border-gray-300 pb-0.5 text-[11px] font-bold tracking-wider text-gray-700 uppercase">
                Candidate Recipient Particulars:
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
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
                    <span className="font-medium text-gray-700">
                      {' '}
                      (Alt: +91 {formData.alternativeNo})
                    </span>
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
          )}

          {/* Subject Line */}
          <div className="mb-2.5 border-y border-gray-400 bg-gray-100/80 py-1.5 text-center">
            <h3 className="text-[12.5px] font-bold tracking-wide text-[#1e3a8a] uppercase">
              Subject: Formal Offer of Employment &amp; Preliminary Contract of Appointment
            </h3>
          </div>

          {/* Preamble / Recitals */}
          <div className="mb-2.5 space-y-1 text-left text-[11.5px] leading-relaxed font-medium text-gray-800">
            <p>
              Dear{' '}
              <span className="font-bold text-[#1e3a8a]">
                {formData.name || '[Candidate Name]'}
              </span>
              ,
            </p>
            <p>
              On behalf of{' '}
              <span className="font-bold text-gray-900">{companyInfo.company_name}</span>{' '}
              (&ldquo;Company&rdquo; or &ldquo;Organization&rdquo;), we are pleased to extend this
              formal offer of employment to you. Following our comprehensive evaluation of your
              credentials, professional background, and domain proficiencies, we believe your
              capabilities align with our corporate growth objectives. This document sets forth the
              comprehensive terms, conditions, mutual covenants, and governance frameworks governing
              your appointment.
            </p>
          </div>

          {/* Clauses 1 to 6 */}
          <div className="space-y-2 text-left text-[11.5px] leading-relaxed">
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
                , or such other corporate officer as the Company may designate from time to time.
                You shall faithfully and diligently perform all duties incidental to your office and
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
                subsidiary, or affiliate of the Company within India or abroad at the sole
                discretion of the Management based on operational imperatives.
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
                    , payable monthly in arrears subject to applicable statutory deductions,
                    including Tax Deducted at Source (TDS) under the Income Tax Act, 1961,
                    Employees&rsquo; Provident Fund (EPF) contributions under the Employees&rsquo;
                    Provident Funds and Miscellaneous Provisions Act, 1952, Professional Tax, and
                    ESIC where statutorily mandated.
                  </>
                )}
              </p>

              {/* Master Sales Compensation & Terms Box */}
              {Boolean(formData.includeSalesPolicyBox ?? true) &&
                (formData.target ||
                  matchedSlab ||
                  formData.offerSlab ||
                  (isSalesDepartment &&
                    (formData.salesCompensationType ||
                      formData.enablePartialTargetRule ||
                      formData.meetingsPerMonth))) && (
                  <div className="mt-2 space-y-2 rounded border border-gray-300 bg-gray-50/90 p-2.5 text-[10.5px] leading-relaxed shadow-sm">
                    {/* Quota */}
                    {(formData.target || matchedSlab || formData.offerSlab) && (
                      <div>
                        <p className="font-bold text-[#1e3a8a]">
                          Sales Performance Quota &amp; Commission Matrix:
                        </p>
                        <p className="mt-0.5 text-gray-800">
                          Your assigned monthly sales quota is{' '}
                          <span className="font-bold text-gray-900">
                            {formData.target ||
                              (matchedSlab ? `${matchedSlab.target}` : '[Target]')}{' '}
                            {targetUnit}
                          </span>{' '}
                          per calendar month. You shall be eligible to receive a performance-linked
                          sales commission of{' '}
                          <span className="font-bold text-[#1e3a8a]">
                            {formData.offerSlab
                              ? `${formData.offerSlab.replace(/%$/, '')}%`
                              : matchedSlab
                                ? matchedSlab.offerSlab
                                : '3%'}
                          </span>{' '}
                          on confirmed realized revenue, computed in strict compliance with the
                          Company&rsquo;s Sales Compensation Policy.
                        </p>
                        {/* 30% Payment Realization Milestone */}
                        <p className="mt-1 text-[10px] text-gray-800">
                          <span className="font-bold text-gray-900">
                            Commission Disbursement Milestone (
                            {formData.commissionReleasePercent || '30'}% Realization Rule):
                          </span>{' '}
                          Performance-linked commission shall strictly be released only upon receipt
                          and realization of a minimum of{' '}
                          <span className="font-bold text-[#1e3a8a]">
                            {formData.commissionReleasePercent || '30'}% of the total property
                            consideration
                          </span>{' '}
                          from the customer into the Company&rsquo;s official bank accounts. In the
                          event of booking cancellation prior to{' '}
                          {formData.commissionReleasePercent || '30'}% realization, no commission
                          shall accrue.
                        </p>
                      </div>
                    )}

                    {/* No Sale No Salary */}
                    {isSalesDepartment &&
                      formData.salesCompensationType === 'no_sale_no_salary' && (
                        <div className="border-t border-gray-300 pt-2 text-gray-900">
                          <p className="font-bold text-[#1e3a8a]">
                            Clause 3.1 &mdash; Performance-Linked Compensation Condition (&ldquo;No
                            Sale No Salary&rdquo;):
                          </p>
                          <p className="mt-0.5 text-gray-800">
                            As an express condition of this sales appointment, full monthly salary
                            disbursement is strictly contingent upon sales quota achievement. In the
                            event zero (0) confirmed sales transactions are closed within a monthly
                            evaluation cycle, you shall be entitled solely to a subsistence
                            allowance of{' '}
                            <span className="font-bold text-gray-900">
                              {formData.subsistenceAllowance &&
                              parseFloat(formData.subsistenceAllowance) > 0
                                ? `₹ ${formatINR(formData.subsistenceAllowance)} per month`
                                : 'such sum as determined by the Company'}
                            </span>
                            . No additional salary, allowances, or arrears shall accrue until sales
                            closures are registered.
                          </p>
                        </div>
                      )}

                    {/* Custom Percent */}
                    {isSalesDepartment && formData.salesCompensationType === 'custom_percent' && (
                      <div className="border-t border-gray-300 pt-2 text-gray-900">
                        <p className="font-bold text-[#1e3a8a]">
                          Clause 3.1 &mdash; Guaranteed Staggered Remuneration During Quota
                          Incubation:
                        </p>
                        <p className="mt-0.5 text-gray-800">
                          During your initial incubation period of{' '}
                          <span className="font-bold text-gray-900">
                            {formData.probationPeriod || '3'} months
                          </span>
                          , your remuneration shall be structured at{' '}
                          <span className="font-bold text-gray-900">
                            {formData.customSalaryPercent || '[X]'}%
                          </span>{' '}
                          of your agreed{' '}
                          {formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand'
                            ? 'Net In-Hand salary'
                            : 'CTC'}
                          , amounting to{' '}
                          <span className="font-bold text-gray-900">
                            ₹{' '}
                            {(() => {
                              const pct = parseFloat(formData.customSalaryPercent || '0');
                              const ctc = parseFloat(formData.salaryCtc || '0');
                              return pct && ctc
                                ? formatINR(Math.round((pct / 100) * ctc))
                                : '[Amount]';
                            })()}{' '}
                            per month
                          </span>
                          . Upon successful achievement of sales benchmarks, full{' '}
                          {formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand'
                            ? 'Net In-Hand salary disbursement'
                            : 'CTC disbursement'}{' '}
                          as specified in Clause 3 shall be restored.
                        </p>
                      </div>
                    )}

                    {/* Grace Period + Reduced % */}
                    {isSalesDepartment &&
                      formData.salesCompensationType === 'grace_period_reduced_percent' && (
                        <div className="border-t border-gray-300 pt-2 text-gray-900">
                          <p className="font-bold text-[#1e3a8a]">
                            Clause 3.1 &mdash; Onboarding Incubation Window &amp;
                            Performance-Indexed Post-Tenure Remuneration:
                          </p>
                          <p className="mt-0.5 text-gray-800">
                            To facilitate structured pipeline gestation and market familiarization,
                            an initial onboarding incubation window of{' '}
                            <span className="font-bold text-gray-900">
                              {formData.gracePeriodMonths || '3'} months
                            </span>{' '}
                            from the Date of Appointment (&ldquo;Gestation Window&rdquo;) is hereby
                            established. During this designated gestation window, you shall be
                            entitled to unabated baseline monthly remuneration of{' '}
                            <span className="font-bold text-gray-900">
                              ₹ {formatINR(formData.salaryCtc || '0')} per month
                            </span>{' '}
                            (
                            {formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand'
                              ? 'Net In-Hand entitlement'
                              : 'fixed CTC'}
                            ) without prejudice to immediate deal closure realization. Effective
                            from Month{' '}
                            <span className="font-bold text-gray-900">
                              {parseInt(formData.gracePeriodMonths || '3') + 1}
                            </span>{' '}
                            onward, standard monthly disbursement becomes strictly
                            performance-contingent upon assigned sales quota realization. In any
                            subsequent evaluation cycle characterized by sub-quota or zero
                            transaction yield, monthly emoluments shall automatically be revised to{' '}
                            <span className="font-bold text-gray-900">
                              {formData.reducedSalaryPercent || '50'}%
                            </span>{' '}
                            of contracted baseline compensation, amounting to{' '}
                            <span className="font-bold text-gray-900">
                              ₹{' '}
                              {(() => {
                                const pct = parseFloat(formData.reducedSalaryPercent || '50');
                                const ctc = parseFloat(formData.salaryCtc || '0');
                                return pct && ctc
                                  ? formatINR(Math.round((pct / 100) * ctc))
                                  : '[Amount]';
                              })()}{' '}
                              per month
                            </span>
                            . Upon achieving confirmed sales closures and fulfilling benchmark
                            quotas, standard unabated compensation disbursement shall be restored
                            for the applicable billing period.
                          </p>
                        </div>
                      )}

                    {/* Target-Linked Pro-Rata & Zero-Sale Policy */}
                    {isSalesDepartment && Boolean(formData.enablePartialTargetRule) && (
                      <div className="border-t border-gray-300 pt-2 text-gray-900">
                        <p className="font-bold text-[#1e3a8a]">
                          Clause 3.2 &mdash; Quota-Indexed Tiered Remuneration &amp; Performance
                          Contingency Matrix:
                        </p>
                        <p className="mt-0.5 text-gray-800">
                          Monthly compensation entitlement is strictly indexed to your assigned
                          sales benchmark of{' '}
                          <span className="font-bold text-gray-900">
                            {formData.target ||
                              (matchedSlab ? `${matchedSlab.target}` : '[Target]')}{' '}
                            {targetUnit}
                          </span>{' '}
                          per calendar month under the following performance appraisal tiers:
                        </p>
                        <ul className="mt-1 space-y-0.5 pl-2 text-gray-800">
                          <li className="flex items-start gap-1">
                            <span className="font-bold text-[#1e3a8a]">&bull;</span>
                            <div>
                              <span className="font-semibold text-gray-900">
                                Tier 1 &mdash; Benchmark Realization (&ge;{' '}
                                {formData.target ||
                                  (matchedSlab ? `${matchedSlab.target}` : '[Target]')}{' '}
                                {targetUnit}):
                              </span>{' '}
                              Disbursement of unabated contracted{' '}
                              {formData.salaryType === 'in_hand' ||
                              formData.salaryType === 'In-Hand'
                                ? 'Net In-Hand compensation'
                                : 'CTC'}{' '}
                              of{' '}
                              <span className="font-bold text-gray-900">
                                ₹ {formatINR(formData.salaryCtc || '0')} per month
                              </span>
                              , in addition to eligible variable incentive apportionments.
                            </div>
                          </li>
                          <li className="flex items-start gap-1">
                            <span className="font-bold text-amber-600">&bull;</span>
                            <div>
                              <span className="font-semibold text-gray-900">
                                Tier 2 &mdash; Sub-Benchmark Production Yield (&lt;{' '}
                                {formData.target ||
                                  (matchedSlab ? `${matchedSlab.target}` : '[Target]')}{' '}
                                {targetUnit} with active closures):
                              </span>{' '}
                              Where verified sales realization falls below the assigned monthly
                              threshold despite active transaction closures, monthly remuneration
                              shall be restricted to a{' '}
                              <span className="font-bold text-gray-900">
                                prorated fifty percent (50%) baseline emolument apportionment
                              </span>
                              , amounting to{' '}
                              <span className="font-bold text-gray-900">
                                ₹{' '}
                                {formatINR(Math.round(parseFloat(formData.salaryCtc || '0') * 0.5))}{' '}
                                per month
                              </span>
                              .
                            </div>
                          </li>
                          <li className="flex items-start gap-1">
                            <span className="font-bold text-red-600">&bull;</span>
                            <div>
                              <span className="font-semibold text-gray-900">
                                Tier 3 &mdash; Zero-Production Non-Disbursement Policy (0 closures):
                              </span>{' '}
                              In any monthly cycle resulting in zero (0) verified transaction
                              closures, complete remuneration abeyance shall be enforced under the
                              Company&rsquo;s{' '}
                              <span className="font-bold text-gray-900">
                                &ldquo;Zero-Production Non-Disbursement Policy&rdquo;
                              </span>
                              . No fixed emoluments, retainership allowances, or retrospective
                              compensation shall accrue, applicable ab initio from Month 1 and
                              across all operational cycles.
                            </div>
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Meetings */}
                    {isSalesDepartment && formData.meetingsPerMonth && (
                      <div className="border-t border-gray-300 pt-1.5 text-[10.5px] text-gray-800">
                        <span className="font-bold text-gray-900">
                          Clause 3.2 &mdash; Mandatory Client Meeting Thresholds:
                        </span>{' '}
                        You are contractually required to conduct a minimum of{' '}
                        <span className="font-bold text-gray-900">
                          {formData.meetingsPerMonth} validated in-person / prospective client
                          meetings
                        </span>{' '}
                        per calendar month. Failure to meet baseline meeting logs shall directly
                        impact performance evaluations.
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Clause 4: MANDATORY PRE-EMPLOYMENT ONBOARDING DOCUMENTATION */}
            {Boolean(formData.includeDocumentationBox ?? true) && (
              <div className="rounded border border-[#1e3a8a] bg-gray-50/90 p-2.5 shadow-sm">
                <div className="mb-1 flex items-center justify-between border-b border-[#1e3a8a]/40 pb-0.5">
                  <p className="text-[11.5px] font-bold tracking-wide text-[#1e3a8a] uppercase">
                    4. Mandatory Pre-Employment Onboarding Documentation &amp; Verification
                    Protocols
                  </p>
                  <span className="text-[10px] font-bold tracking-wider text-[#1e3a8a] uppercase">
                    Mandatory Submission Schedule
                  </span>
                </div>
                <p className="mb-1.5 text-[10.5px] font-medium text-gray-900">
                  In compliance with corporate governance standards, formal appointment is
                  conditional upon submission of records via the SVI HR Onboarding Desk (
                  <span className="font-semibold text-[#1e3a8a]">
                    {companyInfo.company_email || 'hr@sviinfrasolutions.com'}
                  </span>
                  ):
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
                  <div className="rounded border border-gray-300 bg-white p-2">
                    <span className="font-bold text-[#1e3a8a]">1. Academic Credentials:</span>{' '}
                    Copies of marksheets &amp; degree certificates (10th, 12th, Bachelor&rsquo;s,
                    Post-Graduate / Diplomas).
                  </div>
                  <div className="rounded border border-gray-300 bg-white p-2">
                    <span className="font-bold text-[#1e3a8a]">2. Photographic Records:</span> Two
                    (2) colored passport-sized photos against white background.
                  </div>
                  <div className="rounded border border-gray-300 bg-white p-2">
                    <span className="font-bold text-[#1e3a8a]">
                      3. Identity Verification (Aadhaar):
                    </span>{' '}
                    Valid Government-issued Aadhaar Card copy (front &amp; reverse).
                  </div>
                  <div className="rounded border border-gray-300 bg-white p-2">
                    <span className="font-bold text-[#1e3a8a]">
                      4. Tax Registration (PAN Card):
                    </span>{' '}
                    Valid PAN Card copy issued by Income Tax Department.
                  </div>
                  <div className="col-span-2 rounded border border-gray-300 bg-white p-2">
                    <span className="font-bold text-[#1e3a8a]">
                      5. Prior Employment Experience &amp; Relieving Credentials:
                    </span>{' '}
                    Relieving letter from previous employer, resignation acceptance &amp; pay slips
                    for 3 consecutive months.
                  </div>
                </div>
                <div className="mt-1.5 border-t border-gray-300 pt-1 text-[9.5px] font-medium text-gray-800">
                  <p>
                    Upload in clear{' '}
                    <span className="font-bold">
                      PDF, JPEG, or PNG formats (maximum file size 5MB per document)
                    </span>{' '}
                    within <span className="font-bold">three (3) business days</span> of acceptance.
                    Subject to independent{' '}
                    <span className="font-bold">Background Verification (BGV)</span>.
                  </p>
                </div>
              </div>
            )}

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
                not automatic; confirmation shall only occur upon the issuance of an explicit,
                written Confirmation Letter executed by the Director or Head of Human Resources.
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
                <span className="font-bold text-gray-900">
                  {formData.weeklyOffDays || 'Tuesday'}
                </span>{' '}
                or as per departmental duty rosters). You are obligated to record your daily
                attendance via the Company&rsquo;s biometric or digital logging infrastructure.
                Punctuality is paramount; repeated unauthorized absenteeism or chronic tardiness
                shall be deemed gross misconduct.
              </p>

              {/* Customer Site Visits Policy */}
              {isSalesDepartment && Boolean(formData.includeSiteVisitPolicy ?? true) && (
                <p className="mt-1 text-gray-800">
                  <span className="font-bold text-gray-900">
                    6.1 Mandatory Customer Site Visits &amp; Weekend Operations:
                  </span>{' '}
                  Real estate sales operations require active on-ground customer facilitation. You
                  are contractually obligated to coordinate and execute prospective buyer site
                  visits as per operational requirements (
                  {formData.siteVisitSchedule ||
                    'Mandatory on Saturdays, Sundays & scheduled customer appointment slots'}
                  ).
                </p>
              )}

              {/* Conveyance / Fuel Allowance */}
              {Boolean(formData.includeConveyanceAllowance) && (
                <p className="mt-1 text-gray-800">
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
          </div>
        </div>

        <RunningFooter pageNum={1} />
      </div>

      {/* ========================================================================= */}
      {/* ────────────────────────────── PAGE 2 ─────────────────────────────────── */}
      {/* ========================================================================= */}
      <div
        className="relative flex flex-col justify-between bg-white px-6 py-5 sm:px-7 sm:py-5"
        style={{
          pageBreakBefore: 'always',
          boxSizing: 'border-box',
        }}
      >
        {/* Background Watermark */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.02]">
          <img
            src="/logo.png"
            alt="Watermark"
            className="w-[60%] max-w-md object-contain grayscale"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>

        <div className="relative z-10 flex flex-col">
          <RunningHeader />

          {/* Document Section Banner */}
          <div className="mb-2.5 border-y border-gray-400 bg-gray-100/80 py-1.5 text-center">
            <h3 className="text-[12.5px] font-bold tracking-wider text-[#1e3a8a] uppercase">
              Section II: Terms &amp; Conditions, Restrictive Covenants, Governance &amp; Acceptance
            </h3>
          </div>

          <div className="space-y-2 text-left text-[11px] leading-[1.48]">
            {/* Clause 7: Confidentiality, NDA & Trade Secrets */}
            <div>
              <p className="text-[11.5px] font-bold text-[#1e3a8a] uppercase">
                7. Comprehensive Non-Disclosure, Trade Secrets &amp; Data Protection (DPDPA 2023)
              </p>
              <p className="mt-0.5 text-gray-800">
                In the course of your employment, you will have access to proprietary trade secrets,
                investor rosters, client databases, pricing methodologies, architectural layouts,
                financial ledgers, land bank acquisitions, marketing strategies, software
                algorithms, and confidential business intelligence (&ldquo;Confidential
                Information&rdquo;). You covenant and agree to maintain absolute confidentiality of
                all such information during your tenure and perpetually following separation. You
                shall strictly comply with the Digital Personal Data Protection Act, 2023 (DPDPA)
                and the Information Technology Act, 2000. You shall not divulge, copy, disclose,
                publish, or transmit any Confidential Information to third parties without prior
                written authorization.
              </p>
            </div>

            {/* Clause 8: Intellectual Property Assignment */}
            <div>
              <p className="text-[11.5px] font-bold text-[#1e3a8a] uppercase">
                8. Intellectual Property (IP) Ownership, Inventions &amp; Work-for-Hire Assignment
              </p>
              <p className="mt-0.5 text-gray-800">
                All intellectual property, including without limitation copyrights, design
                blueprints, branding assets, software code, marketing materials, analytical
                frameworks, operational processes, patents, and inventions developed, conceived, or
                authored by you (solely or jointly) in connection with your employment shall
                constitute &ldquo;work made for hire&rdquo; and shall be the exclusive, perpetual,
                and worldwide property of{' '}
                <span className="font-bold text-gray-900">{companyInfo.company_name}</span>. You
                hereby unconditionally assign, transfer, and convey all rights, titles, and moral
                rights in such assets to the Company and agree to execute all necessary formal
                documentation required to vest absolute legal title in the Company.
              </p>
            </div>
            {/* Clause 9: Restrictive Covenants & Non-Solicitation */}
            <div>
              <p className="text-[11.5px] font-bold text-[#1e3a8a] uppercase">
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
                <span className="font-bold text-gray-900">9.2 Non-Solicitation Covenant:</span> For
                a period of twelve (12) months following the termination of your employment (for any
                reason whatsoever), you shall not directly or indirectly: (a) solicit, induce, or
                entice any client, customer, investor, vendor, or contractor of the Company to
                terminate or diminish their commercial relationship with the Company; or (b)
                solicit, recruit, or hire any employee, executive, or consultant of the Company.
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
                breach constitutes criminal breach of trust (under BNS / IPC), resulting in
                immediate summary dismissal, full forfeiture of pending commissions, and criminal
                prosecution.
              </p>
            </div>
            {/* Clause 10: Performance Management & PIP */}
            <div>
              <p className="text-[11.5px] font-bold text-[#1e3a8a] uppercase">
                10. Performance Management Governance &amp; Performance Improvement Plan (PIP)
              </p>
              <p className="mt-0.5 text-gray-800">
                The Company maintains rigorous performance assessment standards. If your
                performance, sales conversion rate, attendance, or operational deliverable fails to
                achieve established Key Performance Indicators (KPIs), the Company reserves the
                prerogative to place you on a formal Performance Improvement Plan (PIP) for a
                structured period (typically 30 to 60 days). Under the PIP, you will receive
                designated objectives and milestone reviews. Failure to meet the requisite
                performance thresholds by the expiration of the PIP period shall constitute
                legitimate cause for immediate separation without severance.
              </p>
            </div>

            {/* Clause 11: Relocation of Reporting Location */}
            <div>
              <p className="text-[11.5px] font-bold text-[#1e3a8a] uppercase">
                11. Relocation of Reporting Location &amp; Operational Discretion
              </p>
              <p className="mt-0.5 text-gray-800">
                The Company may, at its sole operational discretion, relocate, expand, or adjust its
                principal headquarters, branch network, or project site offices. You explicitly
                agree to report to any updated corporate or project site location designated by the
                Company from time to time without claiming adjustment allowances unless formally
                sanctioned.
              </p>
            </div>

            {/* Clause 12: Termination of Employment */}
            <div>
              <p className="text-[11.5px] font-bold text-[#1e3a8a] uppercase">
                12. Termination of Employment, Cash Handling Rules &amp; Summary Dismissal
              </p>
              <p className="mt-0.5 text-gray-800">
                <span className="font-bold text-gray-900">12.1 Notice Periods:</span> During
                probation, either party may terminate the employment by serving fifteen (15)
                calendar days&rsquo; written notice or basic salary in lieu thereof.
                Post-confirmation, notice period shall be thirty (30) calendar days or salary in
                lieu, subject to full handover clearance.
              </p>
              <p className="mt-0.5 text-gray-800">
                <span className="font-bold text-gray-900">
                  12.2 Zero-Tolerance Direct Cash Handling &amp; Unauthorized Collections:
                </span>{' '}
                All customer booking tokens, earnest money, and installment payments must strictly
                be deposited directly into the Company&rsquo;s official bank accounts against
                authorized printed SVI receipts. You are strictly barred from accepting direct cash
                payments from clients or soliciting funds into your personal bank account / UPI ID
                under any circumstances. Any violation constitutes financial fraud and embezzlement,
                triggering immediate summary dismissal without dues and the lodging of a Police FIR.
              </p>
              <p className="mt-0.5 text-gray-800">
                <span className="font-bold text-gray-900">12.3 Summary Dismissal for Cause:</span>{' '}
                The Company reserves the right to immediately terminate employment without notice or
                terminal benefits for: (a) breach of confidentiality, IP theft, or lead diversion;
                (b) financial fraud, unauthorized cash collection, or criminal conduct; (c)
                submission of forged onboarding credentials; (d) gross insubordination; or (e)
                continuous unauthorized absence exceeding three (3) business days.
              </p>
              <p className="mt-0.5 text-gray-800">
                <span className="font-bold text-gray-900">12.4 Asset Handover &amp; NOC:</span> Upon
                separation, all Company laptops, keycards, records, client lists, and digital
                credentials must be surrendered immediately prior to final dues settlement.
              </p>
            </div>

            {/* Clause 13: Indemnification */}
            <div>
              <p className="text-[11.5px] font-bold text-[#1e3a8a] uppercase">
                13. Indemnification
              </p>
              <p className="mt-0.5 text-gray-800">
                You agree to indemnify, defend, and hold harmless the Company, its Directors, and
                officers against all liabilities, claims, damages, losses, and legal costs arising
                from your willful misconduct, gross negligence, fraudulent representations, or
                breach of statutory duties.
              </p>
            </div>

            {/* Clause 14: Governing Law & Dispute Resolution */}
            <div>
              <p className="text-[11.5px] font-bold text-[#1e3a8a] uppercase">
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
              <p className="text-[11.5px] font-bold text-[#1e3a8a] uppercase">
                15. Entire Agreement, Severability &amp; Offer Expiration
              </p>
              <p className="mt-0.5 text-gray-800">
                This document constitutes the entire agreement between the parties and supersedes
                all prior communications. This offer shall automatically lapse within{' '}
                <span className="font-bold text-gray-900">five (5) business days</span> from
                issuance unless countersigned and returned alongside the mandatory onboarding
                records.
              </p>
            </div>
          </div>

          {/* Balanced Dual Signatures & Execution Section */}
          <div className="mt-3.5 rounded border border-gray-400 bg-gray-50/70 p-3.5 shadow-sm">
            <div className="grid grid-cols-2 items-end gap-6">
              {/* Employer Execution Block */}
              <div className="border-r border-gray-300 pr-4">
                <p className="mb-0.5 text-[11px] font-bold tracking-wider text-gray-700 uppercase">
                  Issued For and on behalf of Organization:
                </p>
                <p className="text-[12.5px] font-bold text-[#1e3a8a] uppercase">
                  {companyInfo.company_name}
                </p>
                <div className="my-2">
                  <img
                    src="/signature.png"
                    alt="Authorized Signatory"
                    className="h-10 w-auto opacity-90 mix-blend-multiply"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
                <p className="text-[12px] font-bold text-gray-900">Iliyas Ali</p>
                <p className="text-[11px] font-semibold text-gray-700">
                  Director &amp; Authorized Signatory
                </p>
                <p className="mt-0.5 text-[10px] text-gray-600">
                  Date of Issuance: {currentDateFormatted}
                </p>
              </div>

              {/* Candidate Acceptance & Attestation Block */}
              <div className="pl-1 text-[11px]">
                <p className="mb-0.5 text-[11.5px] font-bold tracking-wider text-gray-900 uppercase">
                  Candidate Formal Acceptance &amp; Attestation:
                </p>
                <p className="mb-2 text-[10px] leading-snug font-medium text-gray-800 italic">
                  &ldquo;I hereby unconditionally accept this offer of employment and agree to abide
                  by all terms, covenants, onboarding documentation requirements via the designated
                  SVI HR Onboarding Desk, and policies outlined herein. I affirm all credentials
                  provided are authentic and truthful.&rdquo;
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
        </div>

        <RunningFooter pageNum={2} />
      </div>
    </div>
  );
}
