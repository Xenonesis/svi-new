import { OfferLetterCommonProps } from './types';
import SecurityWatermark from './SecurityWatermark';
import RunningHeader from './RunningHeader';
import RunningFooter from './RunningFooter';
import { getPageFontStyles } from './utils';

export default function OfferLetterPage2({
  formData,
  companyInfo,
  docReferenceNumber,
  isSalesDepartment,
  language = 'en',
}: OfferLetterCommonProps) {
  const fontStyles = getPageFontStyles(language);

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
        ...fontStyles,
      }}
    >
      <SecurityWatermark />

      <div className="relative z-10 flex flex-1 flex-col">
        <RunningHeader docReferenceNumber={docReferenceNumber} language={language} />

        {/* Section II Banner */}
        <div className="mb-2 border-y border-gray-400 bg-gray-100/80 py-1 text-center">
          <h3 className="text-[12px] font-bold tracking-wider text-[#1e3a8a] uppercase">
            {language === 'hi'
              ? 'खंड २: परिचालन नियम, प्रतिबंधात्मक शर्तें एवं कॉर्पोरेट आचार संहिता'
              : 'Section II: Operational Protocols, Restrictive Covenants & Governance'}
          </h3>
        </div>

        <div className="space-y-2 text-left text-[11.5px] leading-[1.52]">
          {/* Clause 5: Probation Period */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              {language === 'hi'
                ? '5. परिवीक्षा अवधि, कार्य-मूल्यांकन एवं सेवा पुष्टिकरण प्रक्रिया'
                : '5. Probationary Period, Performance Assessment & Confirmation Protocols'}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  आप कार्यभार ग्रहण करने की प्रभावी तिथि से प्रारंभिक{' '}
                  <span className="font-bold text-gray-900">
                    {formData.probationPeriod || '3'} (
                    {formData.probationPeriod === '1'
                      ? 'एक'
                      : formData.probationPeriod === '6'
                        ? 'छह'
                        : 'तीन'}
                    ) माह
                  </span>{' '}
                  की औपचारिक वैधानिक परिवीक्षा अवधि (Probation Period) पर रहेंगे। इस अवधि के दौरान
                  आपके व्यावसायिक आचरण, उपस्थिति, कार्य गुणवत्ता एवं बिक्री कोटे का निरंतर मूल्यांकन
                  किया जाएगा। परिवीक्षा अवधि के दौरान कोई भी पक्ष पंद्रह (15) कैलेंडर दिनों की लिखित
                  सूचना या उसके बदले वेतन देकर सेवा समाप्त कर सकता है। संतोषजनक कार्य न होने पर
                  कंपनी को परिवीक्षा अवधि बढ़ाने का एकतरफा अधिकार होगा। सेवा की पुष्टि स्वतः नहीं
                  होगी; यह केवल निदेशक या मानव संसाधन प्रमुख द्वारा हस्ताक्षरित स्पष्ट लिखित
                  पुष्टिकरण पत्र (Confirmation Letter) जारी होने पर ही मान्य होगी।
                </>
              ) : (
                <>
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
                  from the Effective Date. During this period, your professional conduct,
                  attendance, output quality, and quota fulfillment shall undergo continuous
                  evaluation. Either party may terminate the employment within the probationary
                  period by serving fifteen (15) calendar days&rsquo; written notice or salary in
                  lieu thereof. The Company reserves the unilateral right to extend the probationary
                  period by an additional duration if your performance is deemed unsatisfactory.
                  Confirmation of employment is not automatic; confirmation shall only occur upon
                  the issuance of an explicit, written Confirmation Letter executed by the Director
                  or Head of Human Resources.
                </>
              )}
            </p>
          </div>

          {/* Clause 6: Working Hours, Customer Site Visits & Attendance */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              {language === 'hi'
                ? '6. कार्य समय, ग्राहक स्थल भ्रमण एवं उपस्थिति अनुसूची'
                : '6. Standard Working Hours, Customer Site Visits & Attendance Regimes'}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  आपका मानक कार्य समय{' '}
                  <span className="font-bold text-gray-900">
                    {formData.workingHoursStart || '10:30 AM'}
                  </span>{' '}
                  से{' '}
                  <span className="font-bold text-gray-900">
                    {formData.workingHoursEnd || '6:30 PM'}
                  </span>{' '}
                  तक रहेगा, जो{' '}
                  <span className="font-bold text-gray-900">
                    {formData.workingDays || 'बुधवार से सोमवार'}
                  </span>{' '}
                  (साप्ताहिक अवकाश{' '}
                  <span className="font-bold text-gray-900">
                    {formData.weeklyOffDays || 'मंगलवार'}
                  </span>{' '}
                  अथवा विभागीय रोस्टर अनुसार) की कार्य अनुसूची पर आधारित होगा। आपको कंपनी के
                  बायोमेट्रिक या डिजिटल सिस्टम के माध्यम से दैनिक उपस्थिति दर्ज करना अनिवार्य है।
                  समय की पाबंदी अनिवार्य है; बिना पूर्व सूचना के अनधिकृत अनुपस्थिति या बार-बार देरी
                  को गंभीर कदाचार माना जाएगा।
                </>
              ) : (
                <>
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
                </>
              )}
            </p>

            {/* Customer Site Visits Policy */}
            {isSalesDepartment && Boolean(formData.includeSiteVisitPolicy ?? true) && (
              <p className="mt-0.5 text-gray-800">
                {language === 'hi' ? (
                  <>
                    <span className="font-bold text-gray-900">
                      6.1 अनिवार्य ग्राहक स्थल भ्रमण एवं सप्ताहांत परिचालन:
                    </span>{' '}
                    रियल एस्टेट बिक्री कार्यों में ग्राहकों को सीधे साइट विजिट कराना अनिवार्य है।
                    परिचालन आवश्यकताओं (
                    {formData.siteVisitSchedule ||
                      'शनिवार, रविवार एवं निर्धारित ग्राहक अपॉइंटमेंट स्लॉट पर अनिवार्य'}
                    ) के अनुसार संभावित खरीदारों को प्रोजेक्ट साइट पर ले जाना और विजिट कराना आपकी
                    अनुबंधात्मक जिम्मेदारी है।
                  </>
                ) : (
                  <>
                    <span className="font-bold text-gray-900">
                      6.1 Mandatory Customer Site Visits &amp; Weekend Operations:
                    </span>{' '}
                    Real estate sales operations require active on-ground customer facilitation. You
                    are contractually obligated to coordinate and execute prospective buyer site
                    visits as per operational requirements (
                    {formData.siteVisitSchedule ||
                      'Mandatory on Saturdays, Sundays & scheduled customer appointment slots'}
                    ).
                  </>
                )}
              </p>
            )}

            {/* Conveyance / Fuel Allowance */}
            {Boolean(formData.includeConveyanceAllowance) && (
              <p className="mt-0.5 text-gray-800">
                {language === 'hi' ? (
                  <>
                    <span className="font-bold text-gray-900">
                      6.2 क्षेत्र भ्रमण एवं यात्रा भत्ता नीति:
                    </span>{' '}
                    ग्राहकों के प्रोजेक्ट विजिट एवं फील्ड बैठकों के समर्थन हेतु, कंपनी प्रमाणित साइट
                    विजिट लॉग के सत्यापन एवं प्रबंधकीय अनुमोदन के अधीन{' '}
                    <span className="font-bold text-[#1e3a8a]">
                      {formData.conveyanceAllowanceAmount ||
                        'मासिक यात्रा भत्ता / आधिकारिक यात्रा प्रतिपूर्ति'}
                    </span>{' '}
                    प्रदान करेगी।
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </p>
            )}
          </div>

          {/* Clause 7: Confidentiality, NDA & Trade Secrets */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              {language === 'hi'
                ? '7. व्यापक गैर-प्रकटीकरण, व्यापारिक रहस्य एवं डेटा संरक्षण (DPDPA 2023)'
                : '7. Comprehensive Non-Disclosure, Trade Secrets & Data Protection (DPDPA 2023)'}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  रोजगार के दौरान, आपकी पहुंच कंपनी के स्वामित्व वाले व्यापारिक रहस्यों, निवेशक
                  सूचियों, ग्राहक डेटाबेस, मूल्य निर्धारण विधियों, वास्तुशिल्प डिजाइनों, वित्तीय
                  खातों, भूमि अधिग्रहण योजनाओं, विपणन रणनीतियों और गोपनीय व्यावसायिक जानकारियों
                  (&ldquo;Confidential Information&rdquo;) तक होगी। आप अपने सेवाकाल के दौरान और सेवा
                  समाप्ति के बाद भी सदैव ऐसी सभी जानकारियों की पूर्ण गोपनीयता बनाए रखने का वचन देते
                  हैं। आप डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (DPDPA) एवं सूचना प्रौद्योगिकी
                  अधिनियम, 2000 का कड़ाई से पालन करेंगे। बिना पूर्व लिखित अनुमति के किसी भी तृतीय
                  पक्ष को गोपनीय जानकारी साझा करना, कॉपी करना या प्रकाशित करना पूर्णतः प्रतिबंधित
                  है।
                </>
              ) : (
                <>
                  In the course of your employment, you will have access to proprietary trade
                  secrets, investor rosters, client databases, pricing methodologies, architectural
                  layouts, financial ledgers, land bank acquisitions, marketing strategies, software
                  algorithms, and confidential business intelligence (&ldquo;Confidential
                  Information&rdquo;). You covenant and agree to maintain absolute confidentiality
                  of all such information during your tenure and perpetually following separation.
                  You shall strictly comply with the Digital Personal Data Protection Act, 2023
                  (DPDPA) and the Information Technology Act, 2000. You shall not divulge, copy,
                  disclose, publish, or transmit any Confidential Information to third parties
                  without prior written authorization.
                </>
              )}
            </p>
          </div>

          {/* Clause 8: Intellectual Property Assignment */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              {language === 'hi'
                ? '8. बौद्धिक संपदा (IP) स्वामित्व, आविष्कार एवं कार्य-अधिकार सौंपना'
                : '8. Intellectual Property (IP) Ownership, Inventions & Work-for-Hire Assignment'}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  आपके द्वारा रोजगार के संबंध में (अकेले या संयुक्त रूप से) विकसित, परिकल्पित या
                  तैयार की गई सभी बौद्धिक संपदा, जिसमें कॉपीराइट, डिजाइन ब्लूप्रिंट, ब्रांडिंग
                  सामग्री, सॉफ्टवेयर कोड, मार्केटिंग कंटेंट, प्रक्रियाएं और नवाचार शामिल हैं,
                  &ldquo;work made for hire&rdquo; मानी जाएगी तथा यह पूर्णतः और सार्वभौमिक रूप से{' '}
                  <span className="font-bold text-gray-900">{companyInfo.company_name}</span> की
                  अनन्य संपत्ति होगी। आप इसके समस्त अधिकार बिना किसी शर्त के कंपनी को सौंपते हैं।
                </>
              ) : (
                <>
                  All intellectual property, including without limitation copyrights, design
                  blueprints, branding assets, software code, marketing materials, analytical
                  frameworks, operational processes, patents, and inventions developed, conceived,
                  or authored by you (solely or jointly) in connection with your employment shall
                  constitute &ldquo;work made for hire&rdquo; and shall be the exclusive, perpetual,
                  and worldwide property of{' '}
                  <span className="font-bold text-gray-900">{companyInfo.company_name}</span>. You
                  hereby unconditionally assign, transfer, and convey all rights, titles, and moral
                  rights in such assets to the Company and agree to execute all necessary formal
                  documentation required to vest absolute legal title in the Company.
                </>
              )}
            </p>
          </div>

          {/* Clause 9: Restrictive Covenants & Non-Solicitation */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              {language === 'hi'
                ? '9. प्रतिबंधात्मक शर्तें: गैर-याचना, लीड सुरक्षा एवं रिश्वत-रोधी नियम'
                : '9. Restrictive Covenants: Non-Solicitation, Lead Protection & Anti-Kickback'}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  <span className="font-bold text-gray-900">9.1 रोजगार की अनन्यता:</span> आप अपना
                  पूरा समय, ध्यान और क्षमताएं केवल कंपनी के व्यवसाय को समर्पित करेंगे। निदेशक मंडल
                  की पूर्व लिखित अनुमति के बिना किसी अन्य रोजगार, वाणिज्यिक परामर्श, प्रत्यक्ष
                  भागीदारी या प्रतिस्पर्धी व्यवसाय में संलग्न होना (&ldquo;moonlighting&rdquo;)
                  पूर्णतः प्रतिबंधित है।
                </>
              ) : (
                <>
                  <span className="font-bold text-gray-900">9.1 Exclusivity of Employment:</span>{' '}
                  You shall devote your whole time, attention, and energies exclusively to the
                  business of the Company. You are strictly prohibited from engaging in dual
                  employment (&ldquo;moonlighting&rdquo;), commercial advisory, directorships,
                  freelance consultancy, or any competing business enterprise, whether remunerated
                  or honorary, without express prior written consent from the Board of Directors.
                </>
              )}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  <span className="font-bold text-gray-900">
                    9.2 गैर-याचना अनुबंध (Non-Solicitation):
                  </span>{' '}
                  रोजगार समाप्ति के बाद बारह (12) माह की अवधि तक, आप प्रत्यक्ष या अप्रत्यक्ष रूप से
                  कंपनी के किसी भी ग्राहक, निवेशक, विक्रेता या कर्मचारी को कंपनी से संबंध समाप्त
                  करने या तोड़ने के लिए प्रेरित नहीं करेंगे और न ही भर्ती करेंगे।
                </>
              ) : (
                <>
                  <span className="font-bold text-gray-900">9.2 Non-Solicitation Covenant:</span>{' '}
                  For a period of twelve (12) months following the termination of your employment
                  (for any reason whatsoever), you shall not directly or indirectly: (a) solicit,
                  induce, or entice any client, customer, investor, vendor, or contractor of the
                  Company to terminate or diminish their commercial relationship with the Company;
                  or (b) solicit, recruit, or hire any employee, executive, or consultant of the
                  Company.
                </>
              )}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  <span className="font-bold text-gray-900">
                    9.3 कंपनी लीड सुरक्षा, गैर-डायवर्जन एवं रिश्वत-रोधी नियम:
                  </span>{' '}
                  संभावित खरीदारों की सभी पूछताछ, साइट विजिट लॉग और ग्राहक डेटाबेस कंपनी के
                  व्यापारिक रहस्य हैं। कंपनी की लीड किसी बाहरी डेवलपर या ब्रोकर को बेचना/डायवर्ट
                  करना, कंपनी के बाहर निजी लाभ हेतु सौदे कराना, अथवा अनुचित कमीशन/रिश्वत स्वीकार
                  करना पूर्णतः प्रतिबंधित है। इसका उल्लंघन भारतीय न्याय संहिता (BNS / IPC) के तहत
                  आपराधिक विश्वासघात माना जाएगा, जिसके परिणामस्वरूप तत्काल बर्खास्तगी, कमीशन जब्ती
                  एवं आपराधिक मुकदमा दर्ज होगा।
                </>
              ) : (
                <>
                  <span className="font-bold text-gray-900">
                    9.3 Company Lead Protection, Non-Diversion &amp; Anti-Kickback:
                  </span>{' '}
                  All prospective buyer enquiries, investor rosters, site visit logs, and client
                  databases constitute strictly confidential trade secrets of the Company. You are
                  expressly prohibited from: (a) diverting, transmitting, or selling Company leads
                  or prospects to external real estate developers, brokers, or channel partners; (b)
                  brokering or closing property transactions outside the Company for private gain;
                  or (c) demanding or accepting personal kickbacks or unauthorized brokerage fees.
                  Any breach constitutes criminal breach of trust (under BNS / IPC), resulting in
                  immediate summary dismissal, full forfeiture of pending commissions, and criminal
                  prosecution.
                </>
              )}
            </p>
          </div>

          {/* Clause 10: Performance Management & PIP */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              {language === 'hi'
                ? '10. कार्य निष्पादन प्रबंधन एवं प्रदर्शन सुधार योजना (PIP Framework)'
                : '10. Performance Management Governance & Performance Improvement Plan (PIP)'}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  कंपनी कठोर कार्य-प्रदर्शन मानकों का पालन करती है। यदि आपका प्रदर्शन, बिक्री
                  रूपांतरण दर या उपस्थिति निर्धारित KPI मानकों को पूरा करने में विफल रहती है, तो
                  कंपनी आपको एक संरचित अवधि (30 से 60 दिन) के लिए प्रदर्शन सुधार योजना (PIP) में
                  रखने का अधिकार सुरक्षित रखती है। PIP अवधि समाप्त होने तक निर्धारित लक्ष्य प्राप्त
                  न करने पर बिना किसी सेवा क्षतिपूर्ति के तत्काल निष्कासन का वैध आधार बनेगा।
                </>
              ) : (
                <>
                  The Company maintains rigorous performance assessment standards. If your
                  performance, sales conversion rate, attendance, or operational deliverable fails
                  to achieve established Key Performance Indicators (KPIs), the Company reserves the
                  prerogative to place you on a formal Performance Improvement Plan (PIP) for a
                  structured period (typically 30 to 60 days). Under the PIP, you will receive
                  designated objectives and milestone reviews. Failure to meet the requisite
                  performance thresholds by the expiration of the PIP period shall constitute
                  legitimate cause for immediate separation without severance.
                </>
              )}
            </p>
          </div>

          {/* Clause 11: Relocation of Reporting Location */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              {language === 'hi'
                ? '11. स्थानांतरण, व्यावसायिक अनिवार्यता एवं परिचालन अधिकार'
                : '11. Relocation of Reporting Location & Operational Discretion'}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  कंपनी अपने व्यावसायिक विवेक से अपने मुख्यालय, शाखा कार्यालयों या प्रोजेक्ट साइट्स
                  का स्थानांतरण या विस्तार कर सकती है। आप कंपनी द्वारा समय-समय पर निर्धारित किसी भी
                  नए कॉर्पोरेट या प्रोजेक्ट साइट कार्यालय में कार्यभार ग्रहण करने हेतु स्पष्ट रूप से
                  सहमत हैं।
                </>
              ) : (
                <>
                  The Company may, at its sole operational discretion, relocate, expand, or adjust
                  its principal headquarters, branch network, or project site offices. You
                  explicitly agree to report to any updated corporate or project site location
                  designated by the Company from time to time without claiming adjustment allowances
                  unless formally sanctioned.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <RunningFooter
        pageNum={2}
        docReferenceNumber={docReferenceNumber}
        companyName={companyInfo.company_name}
        language={language}
      />
    </div>
  );
}
