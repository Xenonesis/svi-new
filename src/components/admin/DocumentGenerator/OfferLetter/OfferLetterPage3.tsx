import { OfferLetterCommonProps } from './types';
import SecurityWatermark from './SecurityWatermark';
import RunningHeader from './RunningHeader';
import RunningFooter from './RunningFooter';
import DualSignaturesBlock from './DualSignaturesBlock';
import { getPageFontStyles } from './utils';

export default function OfferLetterPage3({
  formData,
  companyInfo,
  docReferenceNumber,
  currentDateFormatted,
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

        {/* Section III Banner */}
        <div className="mb-2.5 border-y border-gray-400 bg-gray-100/80 py-1 text-center">
          <h3 className="text-[12px] font-bold tracking-wider text-[#1e3a8a] uppercase">
            {language === 'hi'
              ? 'खंड ३: सेवा समाप्ति, विधिक नियम एवं औपचारिक स्वीकृति'
              : 'Section III: Terms of Separation, Legal Governance & Formal Acceptance'}
          </h3>
        </div>

        <div className="space-y-2 text-left text-[11.5px] leading-[1.52]">
          {/* Clause 12: Termination of Employment */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              {language === 'hi'
                ? '12. सेवा समाप्ति, नकद लेन-देन नियम एवं त्वरित बर्खास्तगी (Termination Rules)'
                : '12. Termination of Employment, Cash Handling Rules & Summary Dismissal'}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  <span className="font-bold text-gray-900">12.1 नोटिस अवधि (Notice Period):</span>{' '}
                  परिवीक्षा अवधि के दौरान, कोई भी पक्ष पंद्रह (15) कैलेंडर दिनों की लिखित सूचना या
                  उसके बदले मूल वेतन देकर रोजगार समाप्त कर सकता है। सेवा पुष्टि के उपरांत, नोटिस
                  अवधि तीस (30) कैलेंडर दिन अथवा उसके बदले वेतन होगी, जो कार्यभार के पूर्ण हस्तांतरण
                  (Handover Clearance) के अधीन होगी।
                </>
              ) : (
                <>
                  <span className="font-bold text-gray-900">12.1 Notice Periods:</span> During
                  probation, either party may terminate the employment by serving fifteen (15)
                  calendar days&rsquo; written notice or basic salary in lieu thereof.
                  Post-confirmation, notice period shall be thirty (30) calendar days or salary in
                  lieu, subject to full handover clearance.
                </>
              )}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  <span className="font-bold text-gray-900">
                    12.2 प्रत्यक्ष नकद लेन-देन पर शून्य-सहनशीलता (Zero-Tolerance Cash Policy):
                  </span>{' '}
                  ग्राहकों से प्राप्त सभी बुकिंग टोकन, अग्रिम राशि एवं किस्तों का भुगतान सीधे कंपनी
                  के आधिकारिक बैंक खाते में अधिकृत मुद्रित रसीदों के विरुद्ध ही जमा किया जाना चाहिए।
                  किसी भी परिस्थिति में ग्राहकों से प्रत्यक्ष नकद स्वीकार करना या अपने व्यक्तिगत
                  बैंक खाते / UPI में राशि मांगना पूर्णतः वर्जित है। इसका उल्लंघन वित्तीय धोखाधड़ी
                  और गबन माना जाएगा, जिसके परिणामस्वरूप बिना किसी बकाये के तत्काल सेवा समाप्ति एवं
                  पुलिस प्राथमिकी (FIR) दर्ज की जाएगी।
                </>
              ) : (
                <>
                  <span className="font-bold text-gray-900">
                    12.2 Zero-Tolerance Direct Cash Handling &amp; Unauthorized Collections:
                  </span>{' '}
                  All customer booking tokens, earnest money, and installment payments must strictly
                  be deposited directly into the Company&rsquo;s official bank accounts against
                  authorized printed SVI receipts. You are strictly barred from accepting direct
                  cash payments from clients or soliciting funds into your personal bank account /
                  UPI ID under any circumstances. Any violation constitutes financial fraud and
                  embezzlement, triggering immediate summary dismissal without dues and the lodging
                  of a Police FIR.
                </>
              )}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  <span className="font-bold text-gray-900">
                    12.3 गंभीर कारणों पर त्वरित बर्खास्तगी (Summary Dismissal):
                  </span>{' '}
                  कंपनी निम्नलिखित कारणों पर बिना किसी पूर्व सूचना या परिलाभों के तत्काल रोजगार
                  समाप्त करने का अधिकार रखती है: (क) गोपनीयता का उल्लंघन, बौद्धिक संपदा चोरी, या लीड
                  डायवर्जन; (ख) वित्तीय धोखाधड़ी, अनधिकृत नकद संग्रह, या आपराधिक आचरण; (ग) फर्जी
                  ऑनबोर्डिंग दस्तावेज प्रस्तुत करना; (घ) गंभीर अवज्ञा; अथवा (ङ) बिना अनुमति के
                  लगातार तीन (3) कार्य दिवसों से अधिक अनुपस्थिति।
                </>
              ) : (
                <>
                  <span className="font-bold text-gray-900">12.3 Summary Dismissal for Cause:</span>{' '}
                  The Company reserves the right to immediately terminate employment without notice
                  or terminal benefits for: (a) breach of confidentiality, IP theft, or lead
                  diversion; (b) financial fraud, unauthorized cash collection, or criminal conduct;
                  (c) submission of forged onboarding credentials; (d) gross insubordination; or (e)
                  continuous unauthorized absence exceeding three (3) business days.
                </>
              )}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  <span className="font-bold text-gray-900">
                    12.4 परिसंपत्ति हस्तांतरण एवं अनापत्ति (Asset Handover &amp; NOC):
                  </span>{' '}
                  सेवा समाप्ति पर, अंतिम हिसाब-किताब से पूर्व कंपनी के सभी लैपटॉप, पहचान पत्र,
                  फाइलें, ग्राहक सूचियां और डिजिटल क्रेडेंशियल तुरंत वापस सौंपना अनिवार्य होगा।
                </>
              ) : (
                <>
                  <span className="font-bold text-gray-900">12.4 Asset Handover &amp; NOC:</span>{' '}
                  Upon separation, all Company laptops, keycards, records, client lists, and digital
                  credentials must be surrendered immediately prior to final dues settlement.
                </>
              )}
            </p>
          </div>

          {/* Clause 13: Indemnification */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              {language === 'hi'
                ? '13. क्षतिपूर्ति एवं दायित्व (Indemnification)'
                : '13. Indemnification'}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  आप अपने जानबूझकर किए गए कदाचार, घोर लापरवाही, कपटपूर्ण आचरण, या वैधानिक दायित्वों
                  के उल्लंघन से उत्पन्न सभी देनदारियों, दावों, हानियों, और कानूनी खर्चों से कंपनी,
                  उसके निदेशकों और अधिकारियों को क्षतिमुक्त, सुरक्षित और सुरक्षित रखने के लिए सहमत
                  हैं।
                </>
              ) : (
                <>
                  You agree to indemnify, defend, and hold harmless the Company, its Directors, and
                  officers against all liabilities, claims, damages, losses, and legal costs arising
                  from your willful misconduct, gross negligence, fraudulent representations, or
                  breach of statutory duties.
                </>
              )}
            </p>
          </div>

          {/* Clause 14: Governing Law & Dispute Resolution */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              {language === 'hi'
                ? '14. शासी कानून एवं विवाद समाधान (Governing Law & Dispute Resolution)'
                : '14. Governing Law & Dispute Resolution'}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  यह अनुबंध भारत के कानूनों द्वारा शासित है। इसके तहत उत्पन्न होने वाले किसी भी
                  विवाद को मध्यस्थता और सुलह अधिनियम, 1996 के अनुसार गौतम बुद्ध नगर (नोएडा) में एकल
                  बाध्यकारी मध्यस्थता को भेजा जाएगा, और गौतम बुद्ध नगर, उत्तर प्रदेश की सक्षम
                  अदालतों का अनन्य क्षेत्राधिकार होगा।
                </>
              ) : (
                <>
                  This contract is governed by the laws of India. Any disputes arising hereunder
                  shall be referred to sole binding arbitration pursuant to the Arbitration and
                  Conciliation Act, 1996 in Gautam Buddha Nagar (Noida), with exclusive jurisdiction
                  vested in the competent courts of Gautam Buddha Nagar, Uttar Pradesh.
                </>
              )}
            </p>
          </div>

          {/* Clause 15: Entire Agreement & Validity */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">
              {language === 'hi'
                ? '15. संपूर्ण समझौता, पृथक्करणीयता एवं प्रस्ताव की वैधता अवधि'
                : '15. Entire Agreement, Severability & Offer Expiration'}
            </p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  यह दस्तावेज दोनों पक्षों के बीच संपूर्ण समझौते का गठन करता है और पूर्व के सभी
                  संचारों का अधिक्रमण करता है। यह प्रस्ताव जारी होने की तिथि से{' '}
                  <span className="font-bold text-gray-900">पांच (5) कार्य दिवसों</span> के भीतर
                  स्वतः समाप्त हो जाएगा, जब तक कि इस पर विधिवत हस्ताक्षर करके अनिवार्य ऑनबोर्डिंग
                  दस्तावेजों के साथ वापस न भेजा जाए।
                </>
              ) : (
                <>
                  This document constitutes the entire agreement between the parties and supersedes
                  all prior communications. This offer shall automatically lapse within{' '}
                  <span className="font-bold text-gray-900">five (5) business days</span> from
                  issuance unless countersigned and returned alongside the mandatory onboarding
                  records.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Balanced Dual Signatures & Execution Section */}
        <DualSignaturesBlock
          companyInfo={companyInfo}
          formData={formData}
          currentDateFormatted={currentDateFormatted}
          language={language}
        />
      </div>

      <RunningFooter
        pageNum={3}
        docReferenceNumber={docReferenceNumber}
        companyName={companyInfo.company_name}
        language={language}
      />
    </div>
  );
}
