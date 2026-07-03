import type { BBALegalContext } from './types';
import { BbaPageFooter } from './BbaPageFooter';

/**
 * Final pages of the BBA legal preview: numbered clauses 1-32,
 * payment schedule, and the signature blocks for both parties.
 *
 * This is the longest section because the operative obligations
 * are detailed legal text; splitting further would not improve
 * readability meaningfully.
 */
export function OperativeClausesAndSignaturesPage({
  formData,
  companyInfo,
  totalCost,
}: BBALegalContext) {
  return (
    <>
      <div style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          1. That the Firm hereby agrees to sell/ convey/ Transfer the /shop/Plot NO.{' '}
          {formData.unitNumber} admeasuring {formData.area} SqYd in favour of Allottee, at Village
          Basadi, Tehsil Kishan Garh Renwal, Dist. Jaipur, State – Rajasthan.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          2. The Allottee(s) has paid a sum of Rs. {(totalCost * 0.1).toLocaleString('en-IN')}/-
          being part payment towards the Total Price at the time of Application, the receipt of
          which the Firm both hereby acknowledge and the Allottee(s) agrees to pay the remaining
          price of the Plot//shop as prescribed in schedule of payments (annexure-A ) attached with
          this Agreement along with all other charges, Taxes and Cesses, securities, etc. as may be
          demanded by the Firm within the time and in the manner specified therein.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          3. The Allottee(s) agrees and confirms that out of the total amount(s) paid/payable by the
          Allottee(s) for the Said Plot/shop, 30% of the Total Price of the Said Plot/shop shall be
          treated as Earnest Money to ensure fulfillment of the terms and conditions as contained in
          the Application and this Agreement. In the event, the Allottee(s) fails to perform any
          obligations or commit breach of any of the terms and conditions, mentioned in the
          Application and/or this Agreement, including but not limited to the occurrence of any
          event of default as stated in this Agreement and the failure of the Allottee(s) to sign
          and return this Agreement in original to the Firm within 30 days of dispatch, the
          Allottee(s) agrees, consents and authorizes the Firm to cancel the allotment and on such
          cancellation, the Allottee(s) authorizes the Firm to forfeit the Earnest Money along with
          Non Refundable Amounts. Thereafter the Allottee(s) shall be left with no right, interest
          and lien on the Said Plot/shop/Said Complex. This is in addition to any other
          remedy/right, which the Firm may have. If the amount paid by the Allottee(s) is less than
          the forfeitable amount, then the Allottee(s) undertakes to make good the shortfall of the
          forfeitable amounts.
        </p>
        <BbaPageFooter companyInfo={companyInfo} />
      </div>
      <div style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          4. The Allottee understands that the part advance given by him/them is towards provisional
          registration against to probable&apos;s allotments of plot(s)/shop(s)/in the ongoing
          project. That further Understand the Allotee at the provisional registration against a
          probable&apos;s allotment is subject to the following conditions:
          <br />
          I. II. EDC And IDC shall be charged extra @ 150/Sq. yard for plots and @ 50 /Sq. ft. for
          shop. PLC(s) determined by the firm shall be charged extra and will be charged
          proportionally with every Advances payment installments. There will be three types of PLC
          applicable on both plots and Shops (1) Corner, (2) Wide Road, (3) park facing, (4)
          facility. Payment for PLC&apos;s will be as Follows: one PLC&apos;s- 6% of BSP, Two
          PLC&apos;s- 9% of BSP, Three PLC&apos;s 12% of BSP.
          <br />
          III. IV. V. In the case any PDC is dishonored, firm reserves the right to cancel the
          provisional registration without any notice.
          <br />
          All other charges like maintenance deposits and such other charges as may be determined by
          the firm at the time of allotment/possession, shall be charged extra and compulsory to
          initiate final registration process. Registration charge, stamp duty and service tax will
          be extra as per the applicable rate. The all PDC&apos;s towards part advance payment
          installments for provisional registration must be honored. In the first instance. It is
          further understood that, without any prejudice to firms any right in case of the dishonor
          of Allottee part advance payment cheque, firm may at its own discretion are paid by the
          Allottee along with simple interest @ 18% p.a in addition to cheque bouncing charge of Rs
          1500/ instance and cheque collection charge of Rs 1500/ Instance within 7 days from the
          date of cheque bouncing. Any variation in the total sale consideration, due to change in
          EDC, infrastructure development charges or any other charges so demanded by the state
          government and /or authorities or any other government department, the Agreement as
          apportioned by the firm shall be final and bindings on Allottee.
        </p>
        <div className="my-6">
          <p className="mb-4 text-justify text-[13px] leading-relaxed font-bold">
            The Allottee(s) shall make all payments within the stipulated time as mentioned in the
            schedule of payments as given in Annexure-A annexed to this Agreement and other charges
            and amounts, as may be demanded by the Firm from time to time, without any reminders
            from the Firm, through A/c payee cheque(s)/ demand draft(s) in favour of &apos;SVI INFRA
            SOLUTIONS PVT LTD&apos; or transfer online to:
          </p>
          <div className="ml-8 text-[13px] leading-relaxed font-bold">
            <div className="grid grid-cols-[150px_1fr] gap-1">
              <span>Account Name:</span>
              <span>{companyInfo.bank_account_name ?? 'SVI INFRA SOLUTIONS PVT LTD'}</span>
              <span>Account Number:</span>
              <span>{companyInfo.bank_account_no ?? '0894102000013837'}</span>
              <span>Bank:</span>
              <span>{companyInfo.bank_name ?? 'IDBI BANK'}</span>
              <span>IFSC CODE:</span>
              <span>{companyInfo.bank_ifsc ?? 'IBKL0000894'}</span>
            </div>
          </div>
        </div>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          5. The Allottee understands that the project is still at the concept stage and decision
          and developments will to an extent depend on the kind of Allottee response as generated by
          this and like request besides the completions of land acquisition, conversion and approval
          of plans.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          6. The Allottee further understands that the Agreement paid hereby and through the
          provisional registration against a probable&apos;s allotment shall be converted into
          allotment only upon the intimations by the firm post sanctions of the plans provided all
          payments due have been paid timely.
        </p>
        <BbaPageFooter companyInfo={companyInfo} />
      </div>
      <div style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          7. The Allottee understands that the allotment shall be subject to due execution of the
          firms Agreement in its standard format including maintenance agreement IBMS as per
          Annexure B and acceptance by him/ them of all term and condition of the firm.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          8. A. The Allottee understands that there is a lock in period of 12 months from the date
          of the realization of first part advance payment with a grace period of 6 months in order
          to claim 18% interest for delay on possession on the paid amount unless there shall be
          delay or failure due to Force Majeure conditions including but not limited to failure of
          the Allottee(s) to pay in time the Total Price and other charges and dues/payments
          mentioned in this Agreement or any failure on the part of the Allottee(s) to abide by all
          or any of the terms and conditions of this Agreement during which the Allottee understands
          that he /she will not be entitled to any refund of the money from the firm.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          B. Possession will be given within lock in period of 12 months along with 6 months grace
          period. If the possession of the Said Plot/shop is delayed due to Force Majeure
          conditions, then the Firm shall be entitled to extension of time for delivery of
          possession of the Said Plot/shop. The Firm during the continuance of the Force Majeure,
          reserves the right to alter or vary the terms and conditions of this Agreement or if the
          circumstances so warrant, the Firm may also suspend the development of the project for
          such period as is considered expedient, the Allottee(s) agrees and consents that the
          Allottee(s) shall have no right to raise any claim, compensation of any nature whatsoever
          for or with regard to such suspension. The Allottee(s) agrees and understands that if the
          Force Majeure condition continues for a long period, then the Firm alone in its own
          judgment and discretion, may terminate this Agreement and in such case the only liability
          of the Firm shall be to refund the amounts without any interest or compensation
          whatsoever. The Allottee(s) agrees that the Allottee(s) shall have no right or claim of
          any nature whatsoever and the Firm shall be released and discharged of all its obligations
          and liabilities under this Agreement.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          C. The builder will provide basic facilities like internal Roads, Parks, External Boundary
          Walls/Fencing, Street Lights, Security System, etc…..
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          D. If the Firm is unable to construct/continue or complete the construction of the Said
          Building/Said Complex due to Force Majeure conditions or due to any government/regulatory
          authority&apos;s action, inaction or omission, then the Firm may challenge the same by
          moving the appropriate courts, tribunal(s) and / or authority. In such a situation, the
          amount(s) paid by the Allottee(s) shall continue to remain with the Firm and the
          Allottee(s) shall not have a right to terminate this Agreement and ask for refund of his
          money and this Agreement shall remain in abeyance till final determination by the court(s)
          / tribunal(s) / authority (ies). However, the Allottee(s) may, if so desires become a
          party along with the Firm in such litigation to protect Allottee&apos;s rights arising
          under this Agreement. In the event the Firm succeeding in its challenge to the impugned
          legislation or rule, regulation, order or notification as the case may be, it is hereby
          agreed that this Agreement shall stand revived and the Allottee(s) shall be liable to
          fulfill all obligations as provided in this Agreement. It is further agreed that in the
          event of the aforesaid challenge of the Firm to the impugned legislation, order, rules,
          regulations, notifications, and the said legislation, order, rules, regulations,
          notifications become final, absolute and binding, the Firm will, subject to provisions of
          law/court order, refund within reasonable time to the Allottee(s) the amounts received
          from the Allottee(s) after deducting Non Refundable Amounts, but without any interest or
          compensation and the decision of the Firm in this regard shall be final and binding on the
          Allottee(s) save as otherwise provided herein, the Allottee(s) shall be left with no other
          right, claim of whatsoever nature against the Firm under or in relation to this Agreement.
        </p>
        <BbaPageFooter companyInfo={companyInfo} />
      </div>
      <div style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          9. The Allottee(s) authorizes the Firm to adjust/appropriate all payments that shall be
          made by the Allottee(s) under any head(s) of dues against outstanding heads in
          Allottee&apos;s name and the Allottee(s) shall not have a right to object/demand/direct
          the Firm to adjust the payments in any manner otherwise than as decided by the Firm.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          10. The Allottee(s) agrees that time is essence with respect to payment of Total Price and
          other charges, deposits and amounts payable by the Allottee(s) as per this Agreement
          and/or as demanded by the Firm from time to time and also to perform/observe all the other
          obligations of the Allottee(s) under this Agreement. The Firm is not under any obligation
          to send any reminders for the payments to be made by the Allottee(s) as per the schedule
          of payments and for the payments to be made as per demand by the Firm or otherwise.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          11. If any delay in due payment, then the firm will charge 18% p.a interest on pro-rata
          basis and if such delay continue for 90 days then allotment will automatically get
          transfer to Market Payment Plan.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          12. The Allottee(s) has seen and accepted the schedule of payments, (as given in
          Annexure-A) .The Firm may in its sole discretion or as may be directed by any Governmental
          Authority (ies) or due to Force Majeure conditions carry out, such additions, alterations,
          deletions and/ or modifications in the plot//shop floor plans, specifications, etc.,
          including but not limited to change in the position of the Said Plot//shop, change in the
          number of Said Plot//shop, change in the area and/ or change in the dimension of the Said
          Plot//shop at any time thereafter till the grant of Conveyance Deed/Registry. The
          Allottee(s) agrees and understands that the construction will commence only after all
          necessary approvals are received from the concerned authorities.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          13. In case of any alteration/modifications resulting in (+)(-)10% change in the plot Area
          of the Said Plot/shop any time prior to and upon the grant of intimation letter/Conveyance
          Deed/ registration, the Firm shall intimate in writing to the Allottee(s) the changes
          thereof and the resultant change, if any, in the Total Price of the Said Plot/shop to be
          paid by the Allottee(s) and the Allottee(s) agrees to deliver to the Firm written consent
          or objections to the changes within thirty (30) days from the date of dispatch by the
          Firm. In case the Allottee(s) does not send his written consent, the Allottee(s) shall be
          deemed to have given unconditional consent to all such alterations/modifications and for
          payments, if any, to be paid in consequence thereof. If the Allottee(s) objects to such
          alterations/modifications indicating his non-consent/objections in writing then in such
          case alone the Firm may at its sole discretion decide to cancel this Agreement without
          further notice and refund the entire money received from the Allottee(s) in six equal
          installments within ninety (90) days from the date of intimation received by the Firm from
          the Allottee(s). Upon the decision of the Firm to cancel the Said Plot/shop, the Firm
          shall be discharged from all its obligations and liabilities under this Agreement and the
          Allottee(s) shall have no right, interest or claim of any nature whatsoever on the Said
          Plot/shop.
        </p>
        <BbaPageFooter companyInfo={companyInfo} />
      </div>
      <div style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          14. The Firm, upon obtaining necessary approvals from the Govt authority shall offer in
          writing possession of the Said Plot/shop to the Allottee(s). Within 30 days from the date
          of issue of such notice and the Firm shall give possession of the Said Plot/shop to the
          Allottee(s) provided the Allottee(s) is not in default of any of the terms and conditions
          of this Agreement and has complied with all provisions, formalities, documentation, etc.,
          as may be prescribed by the Firm in this regard. The Allottee(s) shall be liable to pay
          the Maintenance Charges from the date of grant of the intimation letter or Conveyance deed
          whichever is earlier irrespective of the date on which the Allottee(s) takes possession of
          the Said Plot/shop.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          15. Upon receiving a written intimation from the Firm in terms of clause 13 above, the
          Allottee(s) shall within the time stipulated by the Firm, take possession of the Said
          Plot//shop from the Firm by executing necessary indemnities, undertakings, and such other
          documentation as the Firm may prescribe and by making all the payments to the Firm of all
          charges/dues as specified in this Agreement and the Firm shall after satisfactory
          execution of such documents give possession of the Said Plot/shop to the Allottee(s),
          provided the Allottee(s) is not in breach of any other term of this Agreement. If the
          Allottee(s) fails to take the possession of the Said Plot/shop as aforesaid within the
          time limit prescribed by the Firm in its notice, then the Said Plot/shop shall be at the
          risk and cost of the Allottee(s) and the Firm shall have no liability or concern thereof.
          Further it is agreed by the Allottee(s) that in the event of the Allottee&apos;s failure
          to take possession of the Said Plot/shop in the manner as aforesaid, the Firm shall `have
          the option to cancel this Agreement and avail the remedies as are available in Law
          including as stipulated in clause 28 of this Agreement or the Firm may, without prejudice
          to its rights under any of the clauses of this Agreement and at its sole discretion,
          decide to condone the delay by the Allottee(s) in taking possession of the Said Plot//shop
          in the manner as stated in this clause on the condition that the Allottee(s) shall pay to
          the Firm holding charges @ Rs30/- per sq. yd/month. of the Plot Area per month for any
          delay of full one month or any part thereof in taking possession of the entire period of
          delay. The Allottee (s)acknowledges that the charges stipulated above are just, fair and
          reasonable which the Firm will suffer on account of delay in taking possession of the Said
          Plot//shop by the Allottee(s) That on such condition and after receiving entire amount of
          charges together with all other amounts due and payable under this Agreement (along with
          due interest, if any, thereon) the Firm shall hand over the possession of the Said
          Plot/shop to the Allottee(s). For the avoidance of any doubt it is clarified that these
          charges are in addition to maintenance or any other charges as provided in this Agreement.
          Further, the Allottee(s) agrees that in the event of the Allottee&apos;s failure to take
          possession of the Said Plot/shop within the time stipulated by the Firm in its notice, the
          Allottee(s) shall have no right or claim in respect of any item of work in the Said
          Plot//shop which the Allottee(s) may allege not to have been carried out or completed or
          in respect of any design specifications, building materials or any other reason whatsoever
          and the Allottee(s) shall be deemed to have been fully satisfied in all respects
          concerning construction and all other work relating to the Said Plot/shop/Said
          Building/Said Complex.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          16. If for any reasons other than those given in clauses 8(b), 8(c) and clause 28, the
          Firm is unable to or fails to deliver possession of the Said Plot//shop to the Allottee(s)
          within Twenty Four(24) months with a grace period of 6 months from the date of Application
          or within any extended period or periods as envisaged under this Agreement, then in such
          case, the Allottee(s) shall be entitled to give notice to the Firm, within ninety (90)
          days from the expiry of said period of Twelve (12) months with a grace period of 6 months
          or such extended periods, as the case may be, for terminating this Agreement. In that
          event, the Firm shall be at liberty to sell and/or dispose of the Said Plot//shop and the
          Parking Space(s) to any other party at such price and upon such terms and conditions, as
          the Firm may deem fit and thereafter the Firm shall within ninety (90) days from the date
          of full realization of the sale price after sale of Said Plot//shop refund to the
          Allottee(s), in six equal installments, without any interest, the amounts paid by the
          Allottee(s) in respect of the Said Plot//shop without deduction of Earnest Money but after
          deduction of brokerage paid by the Firm to the broker / sales organizer in case the
          booking is done through a broker/sales organizer. For the avoidance of doubt, it is stated
          that the Allottee (s)shall have no other right or claim against the Firm in respect of the
          Said Plot/shop and Parking Space(s). If the Allottee(s) fails to exercise the right of
          termination within the time limit as aforesaid, then the Allottee&apos;s right to
          terminate this Agreement shall stand waived off and the Allottee(s) shall continue to be
          bound by the provisions of this Agreement.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          17. Subject to the terms and conditions of the Agreement, in case of any delay other than
          clause 28 and conditions as mentioned in clause 8(b) and 8(c) by the Firm incompletion of
          handing over possession of the Said Plot/shop, the Firm shall pay compensation @ Rs. 20
          per sq. Yd/ft.of the Super Area of the Said Plot/shop per month or any part thereof only
          to the first named Allottee(s) and not to anyone else. The Allottee(s) agrees and confirms
          that the compensation herein is a just and equitable estimate of the damages which the
          Allottee(s) may suffer and the Allottee(s) agrees that it shall have no other right claims
          whatsoever. The adjustment of such compensation shall be done only at the time of
          execution of conveyance deed of the Said Plot/shop to the Allottee(s) first named.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          18. The Firm, its associates/subsidiaries shall execute a Conveyance Deed to convey the
          title, of the Said Plot/shop in favor of the Allottee(s), provided the Allottee(s) has
          paid the Total Price and other charges in accordance with this Agreement and the
          Allottee(s) is not in breach of all or any of the terms of this Agreement.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          19. In order to provide necessary maintenance services, upon the completion of the Said
          Building/Said Complex the maintenance of the Said Building / Said Complex may be handed
          over to the Maintenance Agency. The Allottee(s) agrees to execute Maintenance Agreement
          (draft given in annexure-B to this Agreement) with the Maintenance Agency or any other
          nominee/agency or other body/association of plot//shop owners as may be appointed by the
          Building/Said Complex, the maintenance of the Said Building/Said Complex may be handed
          over to the Maintenance Agency. The Allottee(s) agrees to execute a Maintenance Agreement
          (draft given in Annexure-B to this Agreement) with the Maintenance Agency or any other
          nominee/agency or other body/association of plot/shop owners as may be appointed by the
          Firm from time to time for the maintenance and upkeep of the Said Building/Said Complex.
          The Allottee(s) further undertakes to abide by the terms and conditions of the
          Maintenance.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          20. The total Maintenance Charges shall be more elaborately described in the Maintenance
          Agreement (draft given in annexure -_B_). The Allottee(s) undertakes to pay the same
          promptly. It is agreed by the Allottee(s) that the payment of Maintenance Charges will be
          applicable whether or not the possession of Said Plot//shop is taken by the Allottee(s).
          The Maintenance Charges shall be recovered on such estimated basis which may also include
          the overhead cost on monthly / quarterly intervals as may be decided by the Maintenance
          Agency and adjusted against the actual audited expenses as determined at every end of the
          financial year and any surplus/deficit thereof shall be carried forward and adjusted in
          the maintenance bills of the subsequent financial year. The estimates of the Maintenance
          Agency shall be final and binding on the Allottee(s). The Allottee(s) agrees and
          undertakes to pay the maintenance bills on or before due date as intimated by the
          Maintenance Agency.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          21. The Allottee(s) shall not use the Said Plot//shop for any purpose other than for
          residential purpose or commercial use, as prescribed; or use the same in a manner that may
          cause nuisance or annoyance to other plot/shop owners or residents of the Said Complex; or
          for any commercial or illegal or immoral purpose; or to do or cause anything to be done in
          or around the Said Plot//shop which tends to cause interference to any adjacent plot(s) /
          building(s) or in any manner interfere with the use of roads or amenities available for
          common use. The Allottee(s) shall indemnify the Firm against any action, damages or loss
          due to misuse for which the Allottee(s) / occupant shall be solely responsible.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          22. (a). The Allottee(s) agrees and understands that terms and conditions of the Agreement
          may be modified/amended by the Firm in accordance with any directions/order of any court
          of law, Governmental Authority, in compliance with applicable law and such amendment shall
          be binding on the Allottee(s). (b). The Allottee(s) further agrees that the Maintenance
          Schedule (annexure-_B_) attached to this Agreement is annexed to acquaint the Allottee(s)
          with the terms and conditions as may be stipulated as and when it is finally executed at
          the appropriate time to be notified by the Firm. The Allottee(s) consents to the terms and
          conditions contained in the draft which shall substantially be the same in the final
          document to be executed at the appropriate time to be notified by the Firm. The
          Allottee(s) further understands that the Firm shall have the right to impose additional
          terms and conditions or to modify/amend/change the terms and conditions as stated in this
          draft in the final document to be executed at the appropriate time. The Firm further
          reserves the right to correct, modify, amend or change all the annexures attached to this
          Agreement and also annexures which are indicated to be tentative at any time prior to the
          execution of the Conveyance Deed/intimation letter of the Said Plot//shop.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          23. The Allottee(s) agrees that the provisions of this Agreement, Maintenance Agreement,
          and those contained in other annexures are specific and applicable to plot//shops offered
          for sale in the Said Complex and these provisions cannot be read in evidence or
          interpreted in any manner in or for the purpose of any suit or proceedings before any
          Court(s), Commission, Consumer Forum(s) or any other judicial forum involving any other
          Disputes plot//shop(s)/building(s)/project(s) of the Firm/ its associates/subsidiaries,
          partnership firms in which the Firm is partner or interested.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          24. The Allottee(s) agrees and understands that if any provision of this Agreement is
          determined to be void or unenforceable under applicable law, such provisions shall be
          deemed amended or deleted in so far as reasonably inconsistent with the purpose of this
          Agreement and to the extent necessary to conform to applicable law and the remaining
          provisions of this Agreement shall remain valid and enforceable as applicable at the time
          of execution of this Agreement.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          25. The Firm shall not be responsible or liable for not performing any of its obligations
          or undertakings provided for in this Agreement if such performance is prevented due to
          Force Majeure conditions.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          26. The execution of this Agreement will be complete only upon its execution by the Firm
          through its authorized signatory at the Firms head office at, A-61 Sector-65 Noida Uttar
          Pradesh 201309, after the copies are duly executed by the Allottee(s) and are received by
          the Firm .
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          27. All notices are to be served on the Allottee(s) as contemplated in this Agreement
          shall be deemed to have been duly served if sent to the Allottee(s) or the Firm by
          registered post at their respective addresses specified below:
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed font-bold">
          {formData.address}
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          It shall be the duty of the Allottee(s) to inform the Firm of any change subsequent to the
          execution of this Agreement in the above address by Registered Post failing which all
          communications and letters posted at the above address shall be deemed to have been
          received by the Allottee(s).
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          28. The Allottee(s) agrees that all defaults, breaches and/or non-compliance of any of the
          terms and conditions of this Agreement shall be deemed to be events of defaults liable for
          consequences stipulated herein. Some of the indicative events of defaults are mentioned
          below which are merely illustrative and are not exhaustive.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          i) Failure to make payments within the time as stipulated in the schedule of payments as
          given in annexure-A and failure to pay the stamp duty, legal, registration, any incidental
          charges, any increases in security including but not limited to IBMS as demanded by the
          Firm, any other charges, deposits for bulk supply of electrical energy, Taxes etc. as may
          be notified by the Firm to the Allottee(s) under the terms of this Agreement, and all
          other defaults of similar nature.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          ii) Failure to take possession of the Said Plot//shop within the time stipulated by the
          Firm.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          iii) Failure to execute Maintenance Agreement and/or to pay on or before its due date the
          Maintenance Charges, maintenance security deposits, deposits/charges for bulk supply of
          electrical energy or any increases in respect thereof, as demanded by the Firm, its
          nominee, other Body or Association of Plot/shop Owners/Association of Condominium, as the
          case may be.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          iv) Assignment of this Agreement or any interest of the Allottee(s) in this Agreement
          without prior written consent of the Firm.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          v) Dishonour of any cheque(s) given by the Allottee(s) for any reason whatsoever.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">vi) Escalation Charges.</p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          vii) Any other acts, deeds or things which the Allottee(s) may commit, omit or fail to
          perform undertaking, affidavit/Agreement/indemnity etc. or as demanded by the Firm which
          in the opinion of the Firm amounts to an event of default and the Allottee(s) agrees and
          confirms that the decision of the Firm in this regard shall be final and binding on the
          Allottee(s).
        </p>
        <BbaPageFooter companyInfo={companyInfo} />
      </div>
      <div style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          Unless otherwise provided in this Agreement, upon the occurrence of any one or more of
          event(s) of default under this Agreement including but not limited to those specified
          above, the Firm may, in its sole discretion, by notice to the Allottee(s), cancel this
          Agreement by giving in writing thirty (30) days from the date of issue of notice to
          rectify the default as specified in that notice. In default of the above, this Agreement
          shall stand cancelled without any further notice. If the default is not rectified within
          such thirty (30)days, this Agreement shall stand cancelled without any further notice or
          intimation and the Firm shall have the right to retain Earnest Money along with the
          interest on delayed payments, any interest paid, due or payable, any other amount of a
          non-refundable nature. The Allottee(s) acknowledges that upon such cancellation of this
          Agreement, the Allottee(s) shall have no right or interest on the Said Plot//shop and the
          Firm shall be discharged of all liabilities and obligations under this Agreement and the
          Firm shall have the right to sell or deal with the Said Plot//shop in the manner in which
          it may deem fit as if this Agreement had never been executed. There fund, if any, shall be
          refunded by the Firm by registered post only after realizing amount on further sale/resale
          to any other party and without any interest or compensation whatsoever to the Allottee(s).
          This will be without prejudice to any other remedies and rights of the Firm to claim other
          liquidated damages which the Firm might have suffered due to such breach committed by the
          Allottee(s).
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          29. All or any disputes arising out or touching upon or in relation to the terms this
          Builder Buyer Agreement including the interpretation and validity of the terms thereof and
          the respective rights and obligations of the parties, which cannot be amicably settled,
          shall be settled through arbitration. The arbitration proceedings shall be governed by the
          Arbitration and Conciliation Act, 1996 or any statutory amendments / modifications thereof
          for the time being in force. The arbitration proceedings shall be held by a sole
          arbitrator who shall be appointed by the Managing Director of the Firm. The Allottee
          hereby confirms that he / she shall have no objection in this appointment. In case of any
          proceeding, reference etc. touching upon the arbitration subject including any award, the
          territorial jurisdiction shall lie with the competent courts of Rajasthan.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          30. That no Allottee shall have any rights to invoke jurisdiction of Civil Court directly
          without availing remedy of Arbitration.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          31. You are requested to keep one copy of this Agreement with you and return the second
          copy to us duly signed within 7 days failing of which we will presume that the given terms
          &amp; conditions of this Agreement are acceptable to you.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          32. This provisional agreement shall be null and void after final registration of
          plot/plots.
        </p>
        <div className="mt-8 flex justify-between">
          <div className="font-bold">
            <p className="mb-1 text-[13px] leading-relaxed">For &amp; on Behalf of</p>
            <p className="mb-1 text-[13px] leading-relaxed">
              {companyInfo.company_name || 'SVI INFRA SOLUTIONS PVT LTD'}
            </p>
            <div className="my-1 h-8 w-24">
              <img
                src="/signature.png"
                alt="Director Signature"
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mb-1 text-[13px] leading-relaxed">(Authorized signatory)</p>
          </div>
        </div>
      </div>
      <div style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          IN WITNESS WHEREOF the parties hereto have hereunto and to a duplicate copy hereof set and
          subscribed their respective hands at the places and on the day, month and year mentioned
          under their respective signatures:
        </p>
        <p className="mb-4 text-[13px] leading-relaxed">
          <strong>SIGNED AND DELIVERED BY THE WITHIN NAMED Allottee:</strong> (including joint
          Allottees) (1) (2) at
        </p>
        <p className="mb-4 text-[13px] leading-relaxed">in the presence of:</p>
        <p className="mb-4 text-[13px] leading-relaxed">on</p>
        <p className="mb-4 text-[13px] leading-relaxed">
          <strong>WITNESSES:</strong>
          <br />
          1. Signature
          <br />
          Name
          <br />
          Address
          <br />
          (to be completed by the Allottee(s)
        </p>
        <p className="mb-4 text-[13px] leading-relaxed">
          2. Signature
          <br />
          Name
          <br />
          Address
        </p>
        <p className="mt-8 mb-4 text-[13px] leading-relaxed">
          <strong>SIGNED AND DELIVERED by the within named Firm at</strong>
        </p>
        <p className="mb-4 text-[13px] leading-relaxed">on</p>
        <p className="mb-4 text-[13px] leading-relaxed">in the presence of:</p>
        <div className="my-1 h-8 w-24">
          <img
            src="/signature.png"
            alt="Director Signature"
            className="h-full w-full object-contain"
          />
        </div>
        <p className="mb-4 text-[13px] leading-relaxed">
          <strong>(AUTHORISED SIGNATORY)</strong>
        </p>
        <p className="mt-8 mb-4 text-[13px] leading-relaxed">
          <strong>WITNESSES:</strong>
          <br />
          1. Signature
          <br />
          Name
          <br />
          Address
        </p>
        <p className="mb-4 text-[13px] leading-relaxed">
          FOR AND ON BEHALF
          <br />
          2. Signature
          <br />
          Name
          <br />
          Address
        </p>
      </div>
    </>
  );
}
