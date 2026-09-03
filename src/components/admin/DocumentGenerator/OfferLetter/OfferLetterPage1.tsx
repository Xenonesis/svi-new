import { OfferLetterCommonProps } from './types';
import SecurityWatermark from './SecurityWatermark';
import RunningFooter from './RunningFooter';
import CorporateHeader from './CorporateHeader';
import CandidateParticularsCard from './CandidateParticularsCard';
import SalesCompensationTermsBox from './SalesCompensationTermsBox';
import OnboardingDocumentationBox from './OnboardingDocumentationBox';
import { getPageFontStyles, getTranslation } from './utils';

export default function OfferLetterPage1({
  formData,
  companyInfo,
  matchedSlab,
  docReferenceNumber,
  currentDateFormatted,
  appointmentDateFormatted,
  targetUnit,
  isSalesDepartment,
  formatINR,
  annualCTC,
  language = 'en',
}: OfferLetterCommonProps) {
  const fontStyles = getPageFontStyles(language);
  const t = getTranslation(language);

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
        {/* Corporate Header / Letterhead */}
        <CorporateHeader companyInfo={companyInfo} language={language} />

        {/* Classification & Metadata Bar */}
        <div className="mb-2 flex items-center justify-between rounded border border-gray-300 bg-gray-50 px-3.5 py-1 text-[11.5px]">
          <div>
            <span className="font-bold text-gray-700">{t.refLabel}:</span>{' '}
            <span className="font-mono font-bold text-[#1e3a8a]">{docReferenceNumber}</span>
          </div>
          <div>
            <span className="font-bold text-gray-700">{t.dateLabel}:</span>{' '}
            <span className="font-bold text-gray-900">{currentDateFormatted}</span>
          </div>
          <div className="text-[10px] font-bold tracking-wider text-gray-800 uppercase">
            {t.docClassification}
          </div>
        </div>

        {/* Balanced Candidate Particulars Card */}
        <CandidateParticularsCard formData={formData} language={language} />

        {/* Subject Line */}
        <div className="mb-2 border-y border-gray-400 bg-gray-100/80 py-1 text-center">
          <h3 className="text-[12px] font-bold tracking-wide text-[#1e3a8a] uppercase">
            {language === 'hi'
              ? t.subject(formData.designation || 'अभ्यर्थी', companyInfo.company_name)
              : 'Subject: Formal Offer of Employment & Preliminary Contract of Appointment'}
          </h3>
        </div>

        {/* Preamble / Recitals */}
        <div className="mb-2 space-y-0.5 text-left text-[11.5px] leading-[1.5] font-medium text-gray-800">
          <p>
            {language === 'hi' ? (
              <>
                प्रिय{' '}
                <span className="font-bold text-[#1e3a8a]">{formData.name || 'अभ्यर्थी'}</span>,
              </>
            ) : (
              <>
                Dear{' '}
                <span className="font-bold text-[#1e3a8a]">
                  {formData.name || '[Candidate Name]'}
                </span>
                ,
              </>
            )}
          </p>
          <p>
            {language === 'hi' ? (
              <>
                <span className="font-bold text-gray-900">{companyInfo.company_name}</span> (“कंपनी”
                अथवा “प्रबंधन”) की ओर से, हमें आपको औपचारिक नियुक्ति प्रस्ताव प्रस्तुत करते हुए
                अत्यंत हर्ष हो रहा है। साक्षात्कार एवं मूल्यांकन प्रक्रिया में प्रदर्शित आपकी
                योग्यता व दक्षताओं के आधार पर यह पदभार सौंपा जा रहा है। कंपनी में आपकी नियुक्ति
                निम्नलिखित नियमों, शर्तों एवं दायित्वों के पूर्णतः अधीन होगी:
              </>
            ) : (
              <>
                On behalf of{' '}
                <span className="font-bold text-gray-900">{companyInfo.company_name}</span>{' '}
                (&ldquo;Company&rdquo; or &ldquo;Organization&rdquo;), we are pleased to extend this
                formal offer of employment to you. Following our comprehensive evaluation of your
                credentials, professional background, and domain proficiencies, we believe your
                capabilities align with our corporate growth objectives. This document sets forth
                the comprehensive terms, conditions, mutual covenants, and governance frameworks
                governing your appointment.
              </>
            )}
          </p>
        </div>

        {/* Core Clauses 1 to 4 */}
        <div className="space-y-1.5 text-left text-[11.5px] leading-[1.5]">
          {/* Clause 1: Position & Department */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">{t.clauses.c1Title}</p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  आपकी नियुक्ति{' '}
                  <span className="font-bold text-gray-900">
                    {formData.department || 'परिचालन'}
                  </span>{' '}
                  विभाग में{' '}
                  <span className="font-bold text-gray-900">
                    {formData.designation || 'कार्यकारी'}
                  </span>{' '}
                  के पद पर की जा रही है। इस पद पर रहते हुए आप सीधे{' '}
                  <span className="font-bold text-gray-900">
                    {formData.reportingTo || 'विभागीय प्रमुख'}
                  </span>{' '}
                  अथवा प्रबंधन द्वारा नामित अन्य अधिकारी को रिपोर्ट करेंगे। आप अपने कर्तव्यों का
                  निष्ठापूर्वक निर्वहन करेंगे तथा कंपनी के सभी विधिक व प्रशासनिक दिशा-निर्देशों का
                  पालन करेंगे।
                </>
              ) : (
                <>
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
                  You shall faithfully and diligently perform all duties incidental to your office
                  and comply with all lawful corporate directives.
                </>
              )}
            </p>
          </div>

          {/* Clause 2: Location & Mobility */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">{t.clauses.c2Title}</p>
            <p className="mt-0.5 text-gray-800">
              {language === 'hi' ? (
                <>
                  आपकी नियुक्ति की प्रभावी तिथि{' '}
                  <span className="font-bold text-gray-900">{appointmentDateFormatted}</span> होगी।
                  आपका प्राथमिक पदस्थापन स्थल{' '}
                  <span className="font-bold text-gray-900">
                    {formData.location || 'कंपनी मुख्यालय'}
                  </span>{' '}
                  स्थित कार्यालय में रहेगा। कंपनी की परिचालन आवश्यकताओं के तहत आपको प्रोजेक्ट
                  साइट्स, टाउनशिप्स अथवा क्षेत्रीय कार्यालयों में भी कार्य करना पड़ सकता है।
                </>
              ) : (
                <>
                  Your appointment shall take effect on your formal joining date of{' '}
                  <span className="font-bold text-gray-900">{appointmentDateFormatted}</span>{' '}
                  (&ldquo;Effective Date&rdquo;). Your principal place of employment shall be
                  situated at{' '}
                  <span className="font-bold text-gray-900">
                    {formData.location || '[Primary Office Location]'}
                  </span>
                  . However, the Company operates across multi-regional jurisdictions; you may be
                  transferred, second-assigned, or deputed to any branch office, project site,
                  subsidiary, or affiliate of the Company within India or abroad at the sole
                  discretion of the Management based on operational imperatives.
                </>
              )}
            </p>
          </div>

          {/* Clause 3: Compensation & Benefits */}
          <div>
            <p className="text-[12px] font-bold text-[#1e3a8a] uppercase">{t.clauses.c3Title}</p>
            <p className="mt-0.5 text-gray-800">
              {(() => {
                const isInHand =
                  formData.salaryType === 'in_hand' || formData.salaryType === 'In-Hand';

                if (language === 'hi') {
                  if (isInHand) {
                    return (
                      <>
                        संतोषजनक कार्य प्रदर्शन एवं कंपनी नीतियों के पालन के अधीन, आप प्रतिमाह कुल{' '}
                        <span className="font-bold text-[#1e3a8a]">
                          ₹ {formData.salaryCtc ? formatINR(formData.salaryCtc) : '0.00'}/-
                        </span>{' '}
                        नियत इन-हैंड (Net In-Hand) वेतन के पात्र होंगे। वेतन का भुगतान प्रत्येक
                        आगामी अंग्रेजी कैलेंडर माह की 7 तारीख तक सीधे बैंक खाते में किया जाएगा,
                        जिसमें लागू वैधानिक कटौतियां शामिल होंगी।
                      </>
                    );
                  }
                  return (
                    <>
                      संतोषजनक कार्य प्रदर्शन एवं कंपनी नीतियों के पालन के अधीन, आप प्रतिमाह कुल{' '}
                      <span className="font-bold text-[#1e3a8a]">
                        ₹ {formData.salaryCtc ? formatINR(formData.salaryCtc) : '0.00'}/-
                      </span>{' '}
                      सकल पारिश्रमिक (Gross CTC) के पात्र होंगे
                      {formData.salaryCtc && (
                        <span className="font-bold text-gray-800">
                          {' '}
                          (वार्षिक सीटीसी ₹ {formatINR(annualCTC)}/- के समतुल्य)
                        </span>
                      )}
                      । वेतन का भुगतान प्रत्येक आगामी अंग्रेजी कैलेंडर माह की 7 तारीख तक सीधे बैंक
                      खाते में किया जाएगा, जिसमें टीडीएस (TDS) एवं अन्य आवश्यक वैधानिक कटौतियां
                      शामिल होंगी।
                    </>
                  );
                }

                if (isInHand) {
                  return (
                    <>
                      The Company shall compensate you with a fixed Net In-Hand Salary of{' '}
                      <span className="font-bold text-[#1e3a8a]">
                        ₹ {formData.salaryCtc ? formatINR(formData.salaryCtc) : '[Amount]'} per
                        month
                      </span>
                      , payable monthly in arrears directly into your designated bank account,
                      subject to applicable statutory compliances and regulatory withholdings under
                      prevailing tax and labor statutes.
                    </>
                  );
                }

                return (
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
                );
              })()}
            </p>
            {/* Master Sales Compensation & Terms Box */}
            <SalesCompensationTermsBox
              formData={formData}
              matchedSlab={matchedSlab}
              targetUnit={targetUnit}
              isSalesDepartment={isSalesDepartment}
              formatINR={formatINR}
              language={language}
            />
          </div>

          {/* Clause 4: Mandatory Onboarding Documentation */}
          <OnboardingDocumentationBox
            formData={formData}
            companyInfo={companyInfo}
            language={language}
          />
        </div>
      </div>

      <RunningFooter
        pageNum={1}
        docReferenceNumber={docReferenceNumber}
        companyName={companyInfo.company_name}
        language={language}
      />
    </div>
  );
}
