import { SalarySlabType } from '@/src/components/admin/OfferLetter/SlabSelector';
import { OfferLetterFormData } from './types';

interface SalesCompensationTermsBoxProps {
  formData: OfferLetterFormData;
  matchedSlab: SalarySlabType | null;
  targetUnit: string;
  isSalesDepartment: boolean;
  formatINR: (val?: string | number) => string;
}

export default function SalesCompensationTermsBox({
  formData,
  matchedSlab,
  targetUnit,
  isSalesDepartment,
  formatINR,
}: SalesCompensationTermsBoxProps) {
  if (formData.includeSalesPolicyBox === false) {
    return null;
  }

  const shouldRender =
    formData.target ||
    matchedSlab ||
    formData.offerSlab ||
    (isSalesDepartment &&
      (formData.salesCompensationType ||
        formData.enablePartialTargetRule ||
        formData.meetingsPerMonth));

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="mt-1.5 space-y-1.5 rounded border border-gray-300 bg-gray-50/90 p-2 text-[10.5px] leading-[1.45] shadow-xs">
      {/* Quota */}
      {(formData.target || matchedSlab || formData.offerSlab) && (
        <div>
          <p className="font-bold text-[#1e3a8a]">
            Sales Performance Quota &amp; Commission Matrix:
          </p>
          <p className="mt-0.5 text-gray-800">
            Your assigned monthly sales quota is{' '}
            <span className="font-bold text-gray-900">
              {formData.target || (matchedSlab ? `${matchedSlab.target}` : '[Target]')} {targetUnit}
            </span>{' '}
            per calendar month. You shall be eligible to receive a performance-linked sales
            commission of{' '}
            <span className="font-bold text-[#1e3a8a]">
              {formData.offerSlab
                ? `${formData.offerSlab.replace(/%$/, '')}%`
                : matchedSlab?.offerSlab
                  ? matchedSlab.offerSlab.includes('%')
                    ? matchedSlab.offerSlab
                    : `${matchedSlab.offerSlab}%`
                  : '3%'}
            </span>{' '}
            on confirmed realized revenue, computed in strict compliance with the Company&rsquo;s
            Sales Compensation Policy.
          </p>
          {/* 30% Payment Realization Milestone */}
          <p className="mt-0.5 text-[10px] text-gray-800">
            <span className="font-bold text-gray-900">
              Commission Disbursement Milestone ({formData.commissionReleasePercent || '30'}%
              Realization Rule):
            </span>{' '}
            Performance-linked commission shall strictly be released only upon receipt and
            realization of a minimum of{' '}
            <span className="font-bold text-[#1e3a8a]">
              {formData.commissionReleasePercent || '30'}% of the total property consideration
            </span>{' '}
            from the customer into the Company&rsquo;s official bank accounts. In the event of
            booking cancellation prior to {formData.commissionReleasePercent || '30'}% realization,
            no commission shall accrue.
          </p>
        </div>
      )}

      {/* No Sale No Salary */}
      {isSalesDepartment && formData.salesCompensationType === 'no_sale_no_salary' && (
        <div className="border-t border-gray-300 pt-1 text-gray-900">
          <p className="font-bold text-[#1e3a8a]">
            Clause 3.1 &mdash; Performance-Linked Compensation Condition (&ldquo;No Sale No
            Salary&rdquo;):
          </p>
          <p className="mt-0.5 text-gray-800">
            As an express condition of this sales appointment, full monthly salary disbursement is
            strictly contingent upon sales quota achievement. In the event zero (0) confirmed sales
            transactions are closed within a monthly evaluation cycle, you shall be entitled solely
            to a subsistence allowance of{' '}
            <span className="font-bold text-gray-900">
              {formData.subsistenceAllowance && parseFloat(formData.subsistenceAllowance) > 0
                ? `₹ ${formatINR(formData.subsistenceAllowance)} per month`
                : 'such sum as determined by the Company'}
            </span>
            . No additional salary, allowances, or arrears shall accrue until sales closures are
            registered.
          </p>
        </div>
      )}

      {/* Custom Percent */}
      {isSalesDepartment && formData.salesCompensationType === 'custom_percent' && (
        <div className="border-t border-gray-300 pt-1 text-gray-900">
          <p className="font-bold text-[#1e3a8a]">
            Clause 3.1 &mdash; Guaranteed Staggered Remuneration During Quota Incubation:
          </p>
          <p className="mt-0.5 text-gray-800">
            During your initial incubation period of{' '}
            <span className="font-bold text-gray-900">
              {formData.probationPeriod || '3'} months
            </span>
            , your remuneration shall be structured at{' '}
            <span className="font-bold text-gray-900">
              {parseFloat(formData.customSalaryPercent || '0')}%
            </span>{' '}
            of your agreed{' '}
            {formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand'
              ? 'Net In-Hand salary'
              : 'CTC'}
            , amounting to{' '}
            <span className="font-bold text-gray-900">
              ₹{' '}
              {(() => {
                const pctStr = formData.customSalaryPercent;
                const pct = pctStr !== undefined && pctStr !== '' ? parseFloat(pctStr) : NaN;
                const ctc = parseFloat(formData.salaryCtc || '0');
                if (isNaN(pct) || isNaN(ctc) || !formData.salaryCtc) return '[Amount]';
                return formatINR(Math.round((pct / 100) * ctc));
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
      {isSalesDepartment && formData.salesCompensationType === 'grace_period_reduced_percent' && (
        <div className="border-t border-gray-300 pt-1 text-gray-900">
          <p className="font-bold text-[#1e3a8a]">
            Clause 3.1 &mdash; Structured Onboarding Gestation Window &amp; Performance-Indexed
            Post-Tenure Remuneration:
          </p>
          <p className="mt-0.5 text-gray-800">
            To facilitate market familiarization, client prospecting, and structured deal pipeline
            gestation, an initial onboarding gestation window of{' '}
            <span className="font-bold text-gray-900">
              {formData.gracePeriodMonths || '3'}{' '}
              {formData.gracePeriodMonths === '1' ? 'month' : 'months'}
            </span>{' '}
            from the Date of Appointment (&ldquo;Gestation Window&rdquo;) is hereby established.
            During this designated gestation window, you shall be entitled to full unabated baseline
            monthly remuneration of{' '}
            <span className="font-bold text-gray-900">
              ₹ {formatINR(formData.salaryCtc || '0')} per month
            </span>{' '}
            (
            {formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand'
              ? 'Net In-Hand entitlement'
              : 'fixed CTC'}
            ) without prejudice to immediate deal closure realization.
          </p>
          <p className="mt-0.5 text-gray-800">
            Effective from Month{' '}
            <span className="font-bold text-gray-900">
              {parseInt(formData.gracePeriodMonths || '3') + 1}
            </span>{' '}
            onward, monthly baseline salary disbursement becomes strictly contingent upon active
            sales quota realization. In any subsequent evaluation cycle characterized by sub-quota
            or zero transaction yield,{' '}
            {(() => {
              const pctStr = formData.reducedSalaryPercent;
              const pct = pctStr !== undefined && pctStr !== '' ? parseFloat(pctStr) : 50;
              const ctc = parseFloat(formData.salaryCtc || '0');
              if (pct === 0) {
                return (
                  <>
                    fixed monthly retainership shall automatically be placed in abeyance at{' '}
                    <span className="font-bold text-gray-900">
                      0% of baseline compensation (₹ 0.00 fixed payout)
                    </span>
                    , transitioning your remuneration structure to a{' '}
                    <span className="font-bold text-gray-900">
                      100% performance-linked variable sales commission model
                    </span>{' '}
                    computed as per the Sales Compensation Schedule.
                  </>
                );
              }
              return (
                <>
                  monthly baseline emoluments shall automatically be prorated to{' '}
                  <span className="font-bold text-gray-900">{pct}%</span> of contracted baseline
                  compensation, amounting to{' '}
                  <span className="font-bold text-gray-900">
                    ₹{' '}
                    {isNaN(pct) || isNaN(ctc) || !formData.salaryCtc
                      ? '[Amount]'
                      : formatINR(Math.round((pct / 100) * ctc))}{' '}
                    per month
                  </span>
                  , alongside accrued variable performance commissions.
                </>
              );
            })()}{' '}
            Upon achieving confirmed sales closures and fulfilling benchmark quotas, standard
            unabated contractual baseline salary disbursement shall immediately be reinstated for
            the applicable billing period.
          </p>
        </div>
      )}

      {/* Target-Linked Pro-Rata & Zero-Sale Policy */}
      {isSalesDepartment && Boolean(formData.enablePartialTargetRule) && (
        <div className="border-t border-gray-300 pt-1 text-gray-900">
          <p className="font-bold text-[#1e3a8a]">
            Clause 3.2 &mdash; Quota-Indexed Tiered Remuneration &amp; Performance Contingency
            Matrix:
          </p>
          <p className="mt-0.5 text-gray-800">
            Monthly compensation entitlement is strictly indexed to your assigned sales benchmark of{' '}
            <span className="font-bold text-gray-900">
              {formData.target || (matchedSlab ? `${matchedSlab.target}` : '[Target]')} {targetUnit}
            </span>{' '}
            per calendar month under the following performance appraisal tiers:
          </p>
          <ul className="mt-0.5 space-y-0.5 pl-2 text-gray-800">
            <li className="flex items-start gap-1">
              <span className="font-bold text-[#1e3a8a]">&bull;</span>
              <div>
                <span className="font-semibold text-gray-900">
                  Tier 1 &mdash; Benchmark Realization (&ge;{' '}
                  {formData.target || (matchedSlab ? `${matchedSlab.target}` : '[Target]')}{' '}
                  {targetUnit}):
                </span>{' '}
                Disbursement of unabated contracted{' '}
                {formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand'
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
                  {formData.target || (matchedSlab ? `${matchedSlab.target}` : '[Target]')}{' '}
                  {targetUnit} with active closures):
                </span>{' '}
                Where verified sales realization falls below the assigned monthly threshold despite
                active transaction closures, monthly remuneration shall be restricted to a{' '}
                <span className="font-bold text-gray-900">
                  prorated fifty percent (50%) baseline emolument apportionment
                </span>
                , amounting to{' '}
                <span className="font-bold text-gray-900">
                  ₹ {formatINR(Math.round(parseFloat(formData.salaryCtc || '0') * 0.5))} per month
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
                In any monthly cycle resulting in zero (0) verified transaction closures, complete
                remuneration abeyance shall be enforced under the Company&rsquo;s{' '}
                <span className="font-bold text-gray-900">
                  &ldquo;Zero-Production Non-Disbursement Policy&rdquo;
                </span>
                . No fixed emoluments, retainership allowances, or retrospective compensation shall
                accrue, applicable ab initio from Month 1 and across all operational cycles.
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Meetings */}
      {isSalesDepartment && formData.meetingsPerMonth && (
        <div className="border-t border-gray-300 pt-1 text-[10px] text-gray-800">
          <span className="font-bold text-gray-900">
            Clause 3.2 &mdash; Mandatory Client Meeting Thresholds:
          </span>{' '}
          You are contractually required to conduct a minimum of{' '}
          <span className="font-bold text-gray-900">
            {formData.meetingsPerMonth} validated in-person / prospective client meetings
          </span>{' '}
          per calendar month. Failure to meet baseline meeting logs shall directly impact
          performance evaluations.
        </div>
      )}
    </div>
  );
}
