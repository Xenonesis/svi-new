import type { BBALegalContext } from './types';
import { BbaPageFooter } from './BbaPageFooter';

/**
 * First page of the BBA: "Important Instructions to the Allottee(s)".
 * Includes the project header and the initial acknowledgement paragraph.
 */
export function InstructionsPage({ formData, companyInfo }: BBALegalContext) {
  return (
    <div
      style={{
        pageBreakBefore: 'always',
        paddingTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '257mm',
      }}
    >
      <p className="mb-2 text-center text-lg font-bold uppercase">"SHYAM AANGAN"</p>
      <p className="mb-4 text-center text-sm font-bold uppercase">JAIPUR, RAJASTHAN</p>
      <p className="mb-4 text-left text-[10px] font-semibold italic">
        Please read carefully..........
      </p>
      <p className="mb-6 text-left text-[11px] font-bold underline">
        Important Instructions to the Allottee(s)
      </p>
      <p className="mb-3 text-justify text-[13px] leading-relaxed">
        The Allottee(s) states and confirms that the firm has made the Allottee(s) aware of the
        availability of the Builder Buyers' Agreement (hereinafter defined) at the head office of
        the firm. The Allottee(s) confirms that the Allottee(s) has read and perused the Agreement,
        containing the detailed terms and conditions and in addition, the Allottee(s) further
        confirms to have fully understood the terms and conditions of the Agreement (including the
        Firms limitations) and the Allottee(s) is agreeable to perform his obligations as per the
        conditions stipulated in the Agreement.
      </p>
      <p className="mb-3 text-justify text-[13px] leading-relaxed">
        Thereafter the Allottee(s) has applied for allotment of a plot/shop in the Said Complex and
        has requested the firm to allot a plot/shop. The Allottee(s) agrees and confirms to sign the
        Agreement in entirety and to abide by the terms and conditions of the Agreement and the
        terms and conditions, as mentioned herein. The Allottee(s) will execute two (2) copies of
        the Agreement for each plot/shop to be purchased. The Agreement sets forth in detail the
        terms and conditions of sale with respect to the plot//shop(s). The Allottee(s) agrees and
        understands that if the Allottee(s) fails to execute and deliver the Agreement along with
        all annexures in its original form and all amounts due and payable as per the schedule of
        payment within thirty (30) days from the date of its dispatch by the firm, then the
        Allottee(s) authorizes the firm to cancel the allotment and on such cancelation, the
        Allottee(s) consents and authorizes the firm to forfeit the Earnest Money along with Non
        Refundable Amounts. Thereafter the Allottee(s) shall be left with no right, title or
        interest whatsoever in the Said Plot/shop.
      </p>
      <p className="mb-3 text-justify text-[13px] leading-relaxed">
        The Allottee(s) further agrees and understands that the firm is not obliged to send any
        notice/reminders in this regard.
      </p>
      <p className="mb-3 text-justify text-[13px] leading-relaxed">
        The Agreement shall not be binding on the firm until executed by the firm through it's
        authorized signatory. The firm reserves the right to request information as it may so desire
        concerning the Allottee(s). The firm will not execute any Agreement wherein the Allottee(s)
        has made any corrections/ cancellations / alterations / modifications. The firm also has the
        right to reject any Agreement executed by any allottee(s) without any cause or explanation
        or without assigning any reasons thereof and the decision of the firm shall be final and
        binding on the Allottee(s).
      </p>
      <p className="mb-3 text-justify text-[13px] leading-relaxed">
        <strong>
          Now, therefore, the Allottee(s) has read and perused the entire Agreement, including
          Annexures and is signing the same with full knowledge and consent.
        </strong>
      </p>
      <p className="mb-3 text-justify text-[13px] leading-relaxed">
        In witness whereof, the parties hereto have signed this Agreement on the date first
        mentioned above.
      </p>
      <p className="mt-8 text-[11px] font-bold">{formData.clientName}</p>
      <p className="mb-3 text-[10px]">(Allottee(s))</p>
      <BbaPageFooter companyInfo={companyInfo} />
    </div>
  );
}
