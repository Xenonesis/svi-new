import { SalarySlabType } from '@/src/components/admin/OfferLetter/SlabSelector';
import { OfferLetterFormData } from './types';

interface SalesCompensationTermsBoxProps {
  formData: OfferLetterFormData;
  matchedSlab: SalarySlabType | null;
  targetUnit: string;
  isSalesDepartment: boolean;
  formatINR: (val?: string | number) => string;
  language?: 'en' | 'hi';
}

export default function SalesCompensationTermsBox({
  formData,
  matchedSlab,
  targetUnit,
  isSalesDepartment,
  formatINR,
  language = 'en',
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
            {language === 'hi'
              ? 'बिक्री लक्ष्य एवं कमीशन संरचना:'
              : 'Sales Performance Quota & Commission Matrix:'}
          </p>
          <p className="mt-0.5 text-gray-800">
            {language === 'hi' ? (
              <>
                आपका निर्धारित मासिक बिक्री लक्ष्य प्रति कैलेंडर माह{' '}
                <span className="font-bold text-gray-900">
                  {formData.target || (matchedSlab ? `${matchedSlab.target}` : '[लक्ष्य]')}{' '}
                  {targetUnit}
                </span>{' '}
                है। आप कंपनी की सेल्स कंपनसेशन पॉलिसी के अनुसार पुष्ट व प्राप्त राजस्व पर{' '}
                <span className="font-bold text-[#1e3a8a]">
                  {formData.offerSlab
                    ? `${formData.offerSlab.replace(/%$/, '')}%`
                    : matchedSlab?.offerSlab
                      ? matchedSlab.offerSlab.includes('%')
                        ? matchedSlab.offerSlab
                        : `${matchedSlab.offerSlab}%`
                      : '3%'}
                </span>{' '}
                का कार्य-प्रदर्शन आधारित बिक्री कमीशन प्राप्त करने के पात्र होंगे।
              </>
            ) : (
              <>
                Your assigned monthly sales quota is{' '}
                <span className="font-bold text-gray-900">
                  {formData.target || (matchedSlab ? `${matchedSlab.target}` : '[Target]')}{' '}
                  {targetUnit}
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
                on confirmed realized revenue, computed in strict compliance with the
                Company&rsquo;s Sales Compensation Policy.
              </>
            )}
          </p>
          {/* 30% Payment Realization Milestone */}
          <p className="mt-0.5 text-[10px] text-gray-800">
            {language === 'hi' ? (
              <>
                <span className="font-bold text-gray-900">
                  कमीशन संवितरण मील का पत्थर ({formData.commissionReleasePercent || '30'}% प्राप्ति
                  नियम):
                </span>{' '}
                कार्य-प्रदर्शन आधारित कमीशन केवल तभी जारी किया जाएगा जब ग्राहक से संपत्ति के कुल
                प्रतिफल का न्यूनतम{' '}
                <span className="font-bold text-[#1e3a8a]">
                  {formData.commissionReleasePercent || '30'}% प्रतिफल
                </span>{' '}
                कंपनी के आधिकारिक बैंक खाते में विधिवत प्राप्त व वसूल हो जाए।{' '}
                {formData.commissionReleasePercent || '30'}% राशि प्राप्त होने से पूर्व बुकिंग रद्द
                होने की दशा में कोई कमीशन देय नहीं होगा।
              </>
            ) : (
              <>
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
                booking cancellation prior to {formData.commissionReleasePercent || '30'}%
                realization, no commission shall accrue.
              </>
            )}
          </p>
        </div>
      )}

      {/* No Sale No Salary */}
      {isSalesDepartment && formData.salesCompensationType === 'no_sale_no_salary' && (
        <div className="border-t border-gray-300 pt-1 text-gray-900">
          <p className="font-bold text-[#1e3a8a]">
            {language === 'hi'
              ? 'खंड ३.१ — कार्य-प्रदर्शन आधारित पारिश्रमिक शर्त (“No Sale No Salary”):'
              : 'Clause 3.1 — Performance-Linked Compensation Condition (“No Sale No Salary”):'}
          </p>
          <p className="mt-0.5 text-gray-800">
            {language === 'hi' ? (
              <>
                इस बिक्री नियुक्ति की एक स्पष्ट शर्त के रूप में, संपूर्ण मासिक वेतन का वितरण पूर्णतः
                बिक्री कोटा प्राप्ति पर निर्भर है। यदि किसी मासिक मूल्यांकन चक्र में शून्य (0) पुष्ट
                बिक्री लेनदेन होते हैं, तो आप केवल{' '}
                <span className="font-bold text-gray-900">
                  {formData.subsistenceAllowance && parseFloat(formData.subsistenceAllowance) > 0
                    ? `₹ ${formatINR(formData.subsistenceAllowance)} प्रति माह`
                    : 'कंपनी द्वारा निर्धारित राशि'}
                </span>{' '}
                के जीवन निर्वाह भत्ते (Subsistence Allowance) के हकदार होंगे। जब तक बिक्री लेनदेन
                पंजीकृत नहीं होते, कोई अतिरिक्त वेतन या बकाया देय नहीं होगा।
              </>
            ) : (
              <>
                As an express condition of this sales appointment, full monthly salary disbursement
                is strictly contingent upon sales quota achievement. In the event zero (0) confirmed
                sales transactions are closed within a monthly evaluation cycle, you shall be
                entitled solely to a subsistence allowance of{' '}
                <span className="font-bold text-gray-900">
                  {formData.subsistenceAllowance && parseFloat(formData.subsistenceAllowance) > 0
                    ? `₹ ${formatINR(formData.subsistenceAllowance)} per month`
                    : 'such sum as determined by the Company'}
                </span>
                . No additional salary, allowances, or arrears shall accrue until sales closures are
                registered.
              </>
            )}
          </p>
        </div>
      )}

      {/* Custom Percent */}
      {isSalesDepartment && formData.salesCompensationType === 'custom_percent' && (
        <div className="border-t border-gray-300 pt-1 text-gray-900">
          <p className="font-bold text-[#1e3a8a]">
            {language === 'hi'
              ? 'खंड ३.१ — कोटा उद्भवन अवधि के दौरान गारंटीकृत श्रेणीबद्ध पारिश्रमिक:'
              : 'Clause 3.1 — Guaranteed Staggered Remuneration During Quota Incubation:'}
          </p>
          <p className="mt-0.5 text-gray-800">
            {language === 'hi' ? (
              <>
                आपकी प्रारंभिक उद्भवन अवधि{' '}
                <span className="font-bold text-gray-900">
                  {formData.probationPeriod || '3'} माह
                </span>{' '}
                के दौरान, आपका पारिश्रमिक आपके सहमत{' '}
                {formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand'
                  ? 'Net In-Hand वेतन'
                  : 'CTC'}{' '}
                के{' '}
                <span className="font-bold text-gray-900">
                  {parseFloat(formData.customSalaryPercent || '0')}%
                </span>{' '}
                पर संरचित रहेगा, जो{' '}
                <span className="font-bold text-gray-900">
                  ₹{' '}
                  {(() => {
                    const pctStr = formData.customSalaryPercent;
                    const pct = pctStr !== undefined && pctStr !== '' ? parseFloat(pctStr) : NaN;
                    const ctc = parseFloat(formData.salaryCtc || '0');
                    if (isNaN(pct) || isNaN(ctc) || !formData.salaryCtc) return '[राशि]';
                    return formatINR(Math.round((pct / 100) * ctc));
                  })()}{' '}
                  प्रति माह
                </span>{' '}
                होगा। बिक्री लक्ष्य हासिल करने पर खंड 3 के अनुसार पूर्ण पारिश्रमिक बहाल कर दिया
                जाएगा।
              </>
            ) : (
              <>
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
              </>
            )}
          </p>
        </div>
      )}

      {/* Grace Period + Reduced % */}
      {isSalesDepartment && formData.salesCompensationType === 'grace_period_reduced_percent' && (
        <div className="border-t border-gray-300 pt-1 text-gray-900">
          <p className="font-bold text-[#1e3a8a]">
            {language === 'hi'
              ? 'खंड ३.१ — संरचित ऑनबोर्डिंग जेस्टेशन विंडो एवं कार्य-प्रदर्शन आधारित पारिश्रमिक:'
              : 'Clause 3.1 — Structured Onboarding Gestation Window & Performance-Indexed Post-Tenure Remuneration:'}
          </p>
          <p className="mt-0.5 text-gray-800">
            {language === 'hi' ? (
              <>
                बाजार की समझ, संभावित ग्राहकों की तलाश और बिक्री पाइपलाइन तैयार करने हेतु कार्यभार
                ग्रहण तिथि से{' '}
                <span className="font-bold text-gray-900">
                  {formData.gracePeriodMonths || '3'}{' '}
                  {formData.gracePeriodMonths === '1' ? 'माह' : 'माह'}
                </span>{' '}
                की एक प्रारंभिक ऑनबोर्डिंग जेस्टेशन विंडो (&ldquo;Gestation Window&rdquo;) निर्धारित
                की जाती है। इस अवधि के दौरान आप बिना किसी तत्काल बिक्री बाध्यता के{' '}
                <span className="font-bold text-gray-900">
                  ₹ {formatINR(formData.salaryCtc || '0')} प्रति माह
                </span>{' '}
                (
                {formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand'
                  ? 'Net In-Hand पात्रता'
                  : 'नियत CTC'}
                ) के पूर्ण मूल मासिक पारिश्रमिक के हकदार होंगे।
              </>
            ) : (
              <>
                To facilitate market familiarization, client prospecting, and structured deal
                pipeline gestation, an initial onboarding gestation window of{' '}
                <span className="font-bold text-gray-900">
                  {formData.gracePeriodMonths || '3'}{' '}
                  {formData.gracePeriodMonths === '1' ? 'month' : 'months'}
                </span>{' '}
                from the Date of Appointment (&ldquo;Gestation Window&rdquo;) is hereby established.
                During this designated gestation window, you shall be entitled to full unabated
                baseline monthly remuneration of{' '}
                <span className="font-bold text-gray-900">
                  ₹ {formatINR(formData.salaryCtc || '0')} per month
                </span>{' '}
                (
                {formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand'
                  ? 'Net In-Hand entitlement'
                  : 'fixed CTC'}
                ) without prejudice to immediate deal closure realization.
              </>
            )}
          </p>
          <p className="mt-0.5 text-gray-800">
            {language === 'hi' ? (
              <>
                माह{' '}
                <span className="font-bold text-gray-900">
                  {parseInt(formData.gracePeriodMonths || '3') + 1}
                </span>{' '}
                से आगे, मासिक मूल वेतन का भुगतान सक्रिय बिक्री कोटा प्राप्ति पर अनिवार्यतः निर्भर
                रहेगा। कोटा पूरा न होने या शून्य बिक्री रहने पर,{' '}
                {(() => {
                  const pctStr = formData.reducedSalaryPercent;
                  const pct = pctStr !== undefined && pctStr !== '' ? parseFloat(pctStr) : 50;
                  const ctc = parseFloat(formData.salaryCtc || '0');
                  if (pct === 0) {
                    return (
                      <>
                        नियत मासिक वेतन स्वतः{' '}
                        <span className="font-bold text-gray-900">
                          0% of baseline compensation (₹ 0.00 fixed payout)
                        </span>{' '}
                        पर स्थगित हो जाएगा, और आपकी पारिश्रमिक संरचना{' '}
                        <span className="font-bold text-gray-900">
                          100% performance-linked variable sales commission model
                        </span>{' '}
                        में परिवर्तित हो जाएगी।
                      </>
                    );
                  }
                  return (
                    <>
                      मासिक मूल पारिश्रमिक अनुबंधित मूल वेतन के{' '}
                      <span className="font-bold text-gray-900">{pct}%</span> तक आनुपातिक रहेगा, जो{' '}
                      <span className="font-bold text-gray-900">
                        ₹{' '}
                        {isNaN(pct) || isNaN(ctc) || !formData.salaryCtc
                          ? '[राशि]'
                          : formatINR(Math.round((pct / 100) * ctc))}{' '}
                        प्रति माह
                      </span>{' '}
                      होगा।
                    </>
                  );
                })()}{' '}
                पुष्ट बिक्री लेनदेन पूर्ण करने पर मानक अनुबंधात्मक वेतन पुनः तत्काल प्रभाव से बहाल
                कर दिया जाएगा।
              </>
            ) : (
              <>
                Effective from Month{' '}
                <span className="font-bold text-gray-900">
                  {parseInt(formData.gracePeriodMonths || '3') + 1}
                </span>{' '}
                onward, monthly baseline salary disbursement becomes strictly contingent upon active
                sales quota realization. In any subsequent evaluation cycle characterized by
                sub-quota or zero transaction yield,{' '}
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
                unabated contractual baseline salary disbursement shall immediately be reinstated
                for the applicable billing period.
              </>
            )}
          </p>
        </div>
      )}

      {/* Target-Linked Pro-Rata & Zero-Sale Policy */}
      {isSalesDepartment && Boolean(formData.enablePartialTargetRule) && (
        <div className="border-t border-gray-300 pt-1 text-gray-900">
          <p className="font-bold text-[#1e3a8a]">
            {language === 'hi'
              ? 'खंड ३.२ — कोटा-आधारित श्रेणीबद्ध पारिश्रमिक एवं प्रदर्शन आकस्मिकता मैट्रिक्स:'
              : 'Clause 3.2 — Quota-Indexed Tiered Remuneration & Performance Contingency Matrix:'}
          </p>
          <p className="mt-0.5 text-gray-800">
            {language === 'hi' ? (
              <>
                मासिक पारिश्रमिक पात्रता निम्नलिखित प्रदर्शन मूल्यांकन श्रेणियों के तहत प्रति
                कैलेंडर माह आपके निर्धारित बिक्री लक्ष्य{' '}
                <span className="font-bold text-gray-900">
                  {formData.target || (matchedSlab ? `${matchedSlab.target}` : '[लक्ष्य]')}{' '}
                  {targetUnit}
                </span>{' '}
                से सीधे जुड़ी है:
              </>
            ) : (
              <>
                Monthly compensation entitlement is strictly indexed to your assigned sales
                benchmark of{' '}
                <span className="font-bold text-gray-900">
                  {formData.target || (matchedSlab ? `${matchedSlab.target}` : '[Target]')}{' '}
                  {targetUnit}
                </span>{' '}
                per calendar month under the following performance appraisal tiers:
              </>
            )}
          </p>
          <ul className="mt-0.5 space-y-0.5 pl-2 text-gray-800">
            <li className="flex items-start gap-1">
              <span className="font-bold text-[#1e3a8a]">&bull;</span>
              <div>
                {language === 'hi' ? (
                  <>
                    <span className="font-semibold text-gray-900">
                      Tier 1 — Benchmark Realization (&ge;{' '}
                      {formData.target || (matchedSlab ? `${matchedSlab.target}` : '[लक्ष्य]')}{' '}
                      {targetUnit}):
                    </span>{' '}
                    अनुबंधित पूर्ण{' '}
                    {formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand'
                      ? 'Net In-Hand'
                      : 'CTC'}{' '}
                    <span className="font-bold text-gray-900">
                      ₹ {formatINR(formData.salaryCtc || '0')} प्रति माह
                    </span>{' '}
                    का संवितरण, पात्र परिवर्तनीय प्रोत्साहनों सहित।
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </li>
            <li className="flex items-start gap-1">
              <span className="font-bold text-amber-600">&bull;</span>
              <div>
                {language === 'hi' ? (
                  <>
                    <span className="font-semibold text-gray-900">
                      Tier 2 — Sub-Benchmark Production Yield (&lt;{' '}
                      {formData.target || (matchedSlab ? `${matchedSlab.target}` : '[लक्ष्य]')}{' '}
                      {targetUnit} सक्रिय बिक्री सहित):
                    </span>{' '}
                    सक्रिय लेनदेन के बावजूद यदि बिक्री निर्धारित सीमा से कम रहती है, तो मासिक
                    पारिश्रमिक{' '}
                    <span className="font-bold text-gray-900">
                      prorated fifty percent (50%) baseline emolument apportionment
                    </span>{' '}
                    तक सीमित रहेगा, जो{' '}
                    <span className="font-bold text-gray-900">
                      ₹ {formatINR(Math.round(parseFloat(formData.salaryCtc || '0') * 0.5))} प्रति
                      माह
                    </span>{' '}
                    होगा।
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">
                      Tier 2 &mdash; Sub-Benchmark Production Yield (&lt;{' '}
                      {formData.target || (matchedSlab ? `${matchedSlab.target}` : '[Target]')}{' '}
                      {targetUnit} with active closures):
                    </span>{' '}
                    Where verified sales realization falls below the assigned monthly threshold
                    despite active transaction closures, monthly remuneration shall be restricted to
                    a{' '}
                    <span className="font-bold text-gray-900">
                      prorated fifty percent (50%) baseline emolument apportionment
                    </span>
                    , amounting to{' '}
                    <span className="font-bold text-gray-900">
                      ₹ {formatINR(Math.round(parseFloat(formData.salaryCtc || '0') * 0.5))} per
                      month
                    </span>
                    .
                  </>
                )}
              </div>
            </li>
            <li className="flex items-start gap-1">
              <span className="font-bold text-red-600">&bull;</span>
              <div>
                {language === 'hi' ? (
                  <>
                    <span className="font-semibold text-gray-900">
                      Tier 3 — Zero-Production Non-Disbursement Policy (0 closures):
                    </span>{' '}
                    शून्य (0) सत्यापित लेनदेन वाले किसी भी मासिक चक्र में, कंपनी की{' '}
                    <span className="font-bold text-gray-900">
                      &ldquo;Zero-Production Non-Disbursement Policy&rdquo;
                    </span>{' '}
                    के तहत कोई निश्चित वेतन या भत्ता देय नहीं होगा।
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">
                      Tier 3 &mdash; Zero-Production Non-Disbursement Policy (0 closures):
                    </span>{' '}
                    In any monthly cycle resulting in zero (0) verified transaction closures,
                    complete remuneration abeyance shall be enforced under the Company&rsquo;s{' '}
                    <span className="font-bold text-gray-900">
                      &ldquo;Zero-Production Non-Disbursement Policy&rdquo;
                    </span>
                    . No fixed emoluments, retainership allowances, or retrospective compensation
                    shall accrue, applicable ab initio from Month 1 and across all operational
                    cycles.
                  </>
                )}
              </div>
            </li>
          </ul>
        </div>
      )}

      {/* Meetings */}
      {isSalesDepartment && formData.meetingsPerMonth && (
        <div className="border-t border-gray-300 pt-1 text-[10px] text-gray-800">
          {language === 'hi' ? (
            <>
              <span className="font-bold text-gray-900">खंड ३.२ — अनिवार्य ग्राहक बैठक सीमा:</span>{' '}
              आपको प्रति कैलेंडर माह न्यूनतम{' '}
              <span className="font-bold text-gray-900">
                {formData.meetingsPerMonth} प्रमाणित व्यक्तिगत / संभावित ग्राहक बैठकें
              </span>{' '}
              आयोजित करना अनिवार्य है। न्यूनतम बैठक लॉग पूरा न करने पर कार्य-प्रदर्शन मूल्यांकन सीधे
              प्रभावित होगा।
            </>
          ) : (
            <>
              <span className="font-bold text-gray-900">
                Clause 3.2 &mdash; Mandatory Client Meeting Thresholds:
              </span>{' '}
              You are contractually required to conduct a minimum of{' '}
              <span className="font-bold text-gray-900">
                {formData.meetingsPerMonth} validated in-person / prospective client meetings
              </span>{' '}
              per calendar month. Failure to meet baseline meeting logs shall directly impact
              performance evaluations.
            </>
          )}
        </div>
      )}
    </div>
  );
}
