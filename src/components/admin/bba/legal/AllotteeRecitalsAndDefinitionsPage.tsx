import type { BBALegalContext } from './types';
import { BbaPageFooter } from './BbaPageFooter';

/**
 * Pages 3-5 of the BBA: Allottee representations, the "WHEREAS" chain, and
 * the definitions + interpretation section.
 */
export function AllotteeRecitalsAndDefinitionsPage({ formData, companyInfo }: BBALegalContext) {
  const getProjectLocationName = (projectName: string) => {
    if (projectName?.toLowerCase().includes('shivani vatika')) {
      return 'HARSOLI, TEHSIL RENWAL, DISTRICT JAIPUR, RAJASTHAN';
    }
    return 'BASADI, KISHAN GARH RENWAL, JAIPUR, RAJASTHAN';
  };

  return (
    <>
      <div
        style={{
          pageBreakBefore: 'always',
          paddingTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '257mm',
        }}
      >
        <p className="mb-4 text-[13px] font-bold">Allottee(s) Representations</p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>AND WHEREAS</strong> the Allottee(s) vide Application Dated{' '}
          <strong>
            {new Date(formData.bookingDate || Date.now()).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </strong>{' '}
          applied for allotment of Said Plot//shop (herein after defined) in the Said Complex after
          perusal and understanding the terms and conditions of this Agreement.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>AND WHEREAS</strong> the Allottee after fully satisfying himself with the stated
          facts applied to the firm is in the process of developing the Residential Colony on the
          said Land, and in pursuance thereof, it is understood and agreed by the Allottee that the
          Plot//shop area and location of Plot/shop, which the Allottee is intending to buy are
          tentative and are subject to change.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>AND WHEREAS</strong> the Allottee after fully satisfying himself about the right,
          title, interest and limitation of the firm in the said land / complex has shown interest
          in the Complex and has approached the Firm for allotment of Plot/shop admeasuring{' '}
          <strong>{formData.area} sq.yd</strong> vide application form dated{' '}
          <strong>
            {new Date(formData.bookingDate || Date.now()).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </strong>
          .
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>AND WHEREAS</strong> the Allottee has read and understood the advance payment
          plans offered by SVI INFRA SOLUTIONS PVT LTD, and hereby agree to abide by the conditions
          mentioned in it and the Allottee has/have chosen to pay the balance advance/subscription
          Agreement towards the provisional registration against a probable allotment of
          plot(s)/shops as per detailed in Annexure- A.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>AND WHEREAS</strong> in pursuance to the aforesaid application for allotment the
          firm accepted the application of the Allottee and allotted{' '}
          <strong>Plot No – {formData.unitNumber}</strong> in{' '}
          <strong>{formData?.projectName?.toUpperCase() || 'SHYAM AANGAN'}</strong> on dated{' '}
          <strong>
            {new Date(formData.bookingDate || Date.now()).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </strong>{' '}
          to the Allottee and the Allottee has verified and satisfied with the records which entitle
          the firm to execute this Agreement.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>AND WHEREAS</strong> the Allottee hereby undertakes that he/she shall abide by all
          laws, rules, regulations, notifications and terms and conditions of Rajasthan Government,
          as per law and any alteration(s)/amendment(s)/modification(s) thereto, and shall be liable
          for defaults and/or breaches of any of the conditions, rules or regulations as may be
          applicable to the said land/complex from time to time.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>AND WHEREAS</strong> the Allottee has represented and warranted to the firm that
          the Allottee has the power, competence and authority to enter into and perform this
          Agreement and has clearly understood his / her rights, duties, responsibilities and
          obligations under the Agreement.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>AND WHEREAS</strong> the firm relying on the confirmations, representations and
          assurances of the Allottee(s) to faithfully abide by all the terms, conditions and
          stipulations contained in this Agreement has accepted in good faith the Application to
          allot the Said Plot/shop and is now willing to enter into this Agreement on the terms and
          conditions appearing hereinafter.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed font-bold">
          NOW, THEREFORE, THIS INDENTURE WITNESSETH AND IT IS HEREBY AGREED AND DECLARED BY AND
          BETWEEN THE PARTIES HERETO AS FOLLOWS:
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&apos;Agreement&apos;</strong> shall mean Builder Buyer&apos;s agreement, which is
          used by and between the firm and the Allottee;
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&apos;Allottee&apos;</strong> means the person(s) named and referred to as party
          and who is being allotted the Said Plot/shop and who has signed and executed the
          Agreement.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&apos;Date of Possession&apos;</strong> shall mean the date on which the actual
          physical possession is taken or deemed to have been taken by the Allottee.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&apos;Deemed Possession&apos;</strong> shall mean the possession of the Plot/shop,
          if not taken, by the Allottee possession be deemed to be delivered on the next succeeding
          day after the expiry date of the notice of possession.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&quot;Earnest Money&quot;</strong> means 50% of the Total Price, of the Said
          Plot/shop payable by the Allottee(s) and more clearly setout in schedule of payments,
          Annexure A.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&apos;External Developmental Charges (EDC)&apos;</strong> means the charges levied
          or leviable on the Said Complex/ Said Land (whatever name called or in whatever form) by
          the Government of Rajasthan or any other Governmental Authority and with all such
          conditions imposed to be paid by the Allottee(s) and also includes any further increase in
          such charges.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&quot;Force Majeure&quot;</strong> means any event or combination of events or
          circumstances beyond the control of the firm which cannot (a) by the exercise of
          reasonable diligence, or (b) despite the adoption of reasonable precaution and/or
          alternative measures, be prevented, or caused to be prevented, and which adversely affects
          the Firms ability to perform obligations under this Agreement, which shall include but not
          be limited to: (a) acts of God i.e. fire, drought, flood, earthquake, epidemics, natural
          disasters; (b) explosions or accidents, air crashes and shipwrecks, act of terrorism; (c)
          strikes or lock outs, industrial dispute; (d) non-availability of cement, steel or other
          construction material due to strikes of manufacturers, suppliers, transporters or other
          intermediaries or due to any reason whatsoever; (e) war and hostilities of war, riots,
          bandh, act of terrorism or civil commotion; (f) the promulgation of or amendment in any
          law, rule or regulation or the issue of any injunction, court order or direction from any
          Governmental Authority that prevents or restricts a party from complying with any or all
          the terms and conditions as agreed in this Agreement; (g) any legislation, order or rule
          or regulation made or issued by the Govt. or any other Authority or if any Governmental
          Authority(ies) refuses, delays, withholds, denies the grant of necessary approvals for the
          Said Complex/ Said Building or if any matters, issues relating to such approvals,
          permissions, notices, notifications by the Governmental Authority(ies) become subject
          matter of any suit / writ before a competent court or; for any reason whatsoever; (h) any
          event or circumstances analogous to the foregoing.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed font-bold">
          <strong>&quot;IBMS&quot;</strong> means the interest bearing maintenance security to be
          paid by the Allottee(s) for the maintenance and upkeep of the Said Complex/ Said Building
          to be paid as per the Schedule of payments (attached as Annexure-B to this Agreement) to
          the firm.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed font-bold">
          <strong>&apos;Infrastructure Development Charges (IDC)&apos;</strong> shall mean the
          infrastructure development charges levied/ leviable (by whatever name called, now or in
          future) by the Governmental Authority towards the cost of development of major
          infrastructure projects.
        </p>
        <BbaPageFooter companyInfo={companyInfo} />
      </div>
      <div
        style={{
          pageBreakBefore: 'always',
          paddingTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '257mm',
        }}
      >
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&quot;Governmental Authority&quot;</strong> or{' '}
          <strong>&quot;Governmental Authorities&quot;</strong> shall mean any government authority,
          statutory authority, competent authority, government department, agency, commission,
          board, tribunal or court or other law, rule or regulation making entity having or
          purporting to have jurisdiction on behalf of the Republic of India or any state or other
          subdivision thereof or any municipality, district or other subdivision thereof, and any
          other municipal/ local authority having jurisdiction over the land on which the Said
          Complex/ Said Building is situated;
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&quot;Maintenance Agency&quot;</strong> means the Firm, its nominee(s) or
          association of plot/shop allottee&apos;s or such other agency/ body/ Firm/ association of
          condominium to whom the Firm may handover the maintenance and who shall be responsible for
          carrying out the maintenance of the Said Complex/ Said Building.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&quot;Maintenance Charges&quot;</strong> shall mean the charges payable by the
          Allottee(s) to the Maintenance Agency for the maintenance services of the Said
          Building/Said Complex, including common areas and facilities but does not include; (a) the
          charges for actual consumption of utilities in the Said Plot/shop including but not
          limited to electricity, water, which shall be charged based on actual consumption on
          monthly basis and (b) any statutory payments, taxes, with regard to the Said
          Plot/shop/Said Building/Said Complex. The details of Maintenance Charges shall be more
          elaborately described in the Maintenance Agreement.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&quot;Non Refundable Amounts&quot;</strong> means the interest paid or payable on
          delayed payments, brokerage paid/payable by the Firm, if any, etc.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&quot;Preferential Location Charges (PLC)&quot;</strong> means charges for the
          preferential location attribute(s) of the Said Plot/shop payable/ as applicable to be
          calculated on the per sq. yd./sq. ft. based on super area of the Said Plot/shop, as
          mentioned in this Agreement.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&quot;Said Plot/shop&quot;</strong> means the plot/shop allotted to the
          Allottee/s, details of which have been set out in clause 1 of this Agreement, the
          tentative typical plot/shop plan and the tentative specifications of the same given in
          annexure-A and includes any alternative plot/shop allotted in lieu of the Said Plot/shop.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&quot;Said Complex&quot;</strong> means the &quot;
          {formData?.projectName?.toUpperCase() || 'SHYAM AANGAN'}&quot;,{' '}
          {getProjectLocationName(formData?.projectName)} comprising of residential plot/shop
          buildings, shops, club house swimming pool, gym etc., community shopping, nursery school,
          and any other building Amenities and Facilities as may be approved by the Governmental
          Authority.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>&quot;Total Price&quot;</strong> means any and all kind of the amount amongst
          others, payable for the Said Plot/shop which includes basic sale price, PLC (if the Said
          Plot/shop is preferentially located), Additional PLC calculated on per sqyd./sq.ft. based
          on the Area of the Said Plot/shop and EDC/IDC, but does not include other amounts,
          charges, security amount etc., which are payable in accordance with the terms of the
          Application/Agreement, including but not limited to: i) Wealth tax, government rates tax
          on land, fees or levies of all and any kinds by whatever name called. ii) IBMS. iii)
          Maintenance charges, property tax, municipal tax on the Said Plot/shop. iv) Stamp duty,
          registration and incidental charges as well as expenses for execution of the Agreement and
          conveyance deed etc. v) Taxes and Cesses. vi) The cost for electric and water meter as
          well as charges for water and electricity connection and consumption. vii) Club membership
          fees and club charges, as applicable. viii) Escalation charges. ix) Any other charges that
          may be payable by the Allottee(s) as per the other terms of the Agreement and such other
          charges as may be demanded by the Firm which amounts shall be payable by the Allottee(s)
          in addition to the Total Price in accordance with the terms and conditions of the
          Agreement and as per the demand raised by the Firm from time to time.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          <strong>Interpretation</strong>
          <br />
          Unless the context otherwise requires in this Agreement:
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          a. the use of words importing the singular shall include plural and masculine shall
          include feminine gender and vice versa;
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          b. reference to any law shall include such law as from time to time enacted, amended,
          supplemented or re-enacted;
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          c. reference to the words &quot;include&quot; or &quot;including&quot; shall be construed
          without limitation;
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          d. reference to this Agreement, or any other agreement, deed or other instrument or
          document shall be construed as a reference to this Agreement or such agreement, deed or
          other instrument or document as the same may from time to time be amended, varied,
          supplemented or novated.
        </p>
        <p className="mb-4 text-justify text-[13px] leading-relaxed">
          The Allottee(s) agrees that wherever in this Agreement, it is explicitly mentioned that
          the Allottee(s) has understood or acknowledged obligations of the Allottee(s) or the
          rights of the Firm, the Allottee(s) has given consent to the actions of the Firm or the
          Allottee(s) has acknowledged that the Allottee(s) has no right of whatsoever nature, the
          Allottee(s) in furtherance of the same, shall do all such acts, deeds or things, as the
          Firm may deem necessary and/or execute such documents/deeds in favour of the Firm at the
          first request without any protest or demur.
        </p>
        <BbaPageFooter companyInfo={companyInfo} />
      </div>
    </>
  );
}
