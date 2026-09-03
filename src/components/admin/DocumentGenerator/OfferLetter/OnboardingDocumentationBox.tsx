import { CompanyInfo, OfferLetterFormData } from './types';

interface OnboardingDocumentationBoxProps {
  formData: OfferLetterFormData;
  companyInfo: CompanyInfo;
  language?: 'en' | 'hi';
}

export default function OnboardingDocumentationBox({
  formData,
  companyInfo,
  language = 'en',
}: OnboardingDocumentationBoxProps) {
  if (formData.includeDocumentationBox === false) {
    return null;
  }

  return (
    <div className="mt-2 rounded border border-[#1e3a8a] bg-gray-50/90 p-2 shadow-xs">
      <div className="mb-1 flex items-center justify-between border-b border-[#1e3a8a]/30 pb-0.5">
        <p className="text-[11.5px] font-bold tracking-wide text-[#1e3a8a] uppercase">
          {language === 'hi'
            ? '4. अनिवार्य पूर्व-रोजगार दस्तावेज एवं सत्यापन प्रक्रिया'
            : '4. Mandatory Pre-Employment Onboarding Documentation & Verification Protocols'}
        </p>
        <span className="text-[10px] font-bold tracking-wider text-[#1e3a8a] uppercase">
          {language === 'hi' ? 'अनिवार्य दस्तावेज अनुसूची' : 'Mandatory Submission Schedule'}
        </span>
      </div>
      <p className="mb-1 text-[10.5px] font-medium text-gray-900">
        {language === 'hi' ? (
          <>
            कॉर्पोरेट प्रशासनिक मानकों के अनुपालन में, आपकी औपचारिक नियुक्ति{' '}
            <span className="font-bold text-[#1e3a8a]">SVI HR Onboarding Desk</span> (
            <span className="font-semibold text-[#1e3a8a]">
              {companyInfo.company_email || 'hr@sviinfrasolutions.com'}
            </span>
            ) पर निम्नलिखित अभिलेखों को प्रस्तुत करने के अधीन है:
          </>
        ) : (
          <>
            In compliance with corporate governance standards, formal appointment is conditional
            upon submission of records via the{' '}
            <span className="font-bold text-[#1e3a8a]">SVI HR Onboarding Desk</span> (
            <span className="font-semibold text-[#1e3a8a]">
              {companyInfo.company_email || 'hr@sviinfrasolutions.com'}
            </span>
            ):
          </>
        )}
      </p>

      <div className="grid grid-cols-2 gap-1 text-[10.5px]">
        <div className="rounded border border-gray-300 bg-white p-1.5">
          <span className="font-bold text-[#1e3a8a]">
            {language === 'hi' ? '1. शैक्षणिक दस्तावेज:' : '1. Academic Credentials:'}
          </span>{' '}
          {language === 'hi'
            ? '10वीं, 12वीं, स्नातक एवं परास्नातक/डिप्लोमा अंकतालिकाएं व प्रमाण पत्र।'
            : 'Copies of marksheets & degree certificates (10th, 12th, Bachelor’s, Post-Graduate / Diplomas).'}
        </div>
        <div className="rounded border border-gray-300 bg-white p-1.5">
          <span className="font-bold text-[#1e3a8a]">
            {language === 'hi' ? '2. रंगीन पासपोर्ट फोटो:' : '2. Photographic Records:'}
          </span>{' '}
          {language === 'hi'
            ? 'सफेद पृष्ठभूमि वाले 3 पासपोर्ट आकार के नवीनतम रंगीन फोटो।'
            : 'Two (2) colored passport-sized photos against white background.'}
        </div>
        <div className="rounded border border-gray-300 bg-white p-1.5">
          <span className="font-bold text-[#1e3a8a]">
            {language === 'hi'
              ? '3. पहचान एवं निवास प्रमाण:'
              : '3. Identity Verification (Aadhaar):'}
          </span>{' '}
          {language === 'hi'
            ? 'वैध भारत सरकार द्वारा जारी आधार कार्ड की प्रति (आगे व पीछे)।'
            : 'Valid Government-issued Aadhaar Card copy (front & reverse).'}
        </div>
        <div className="rounded border border-gray-300 bg-white p-1.5">
          <span className="font-bold text-[#1e3a8a]">
            {language === 'hi' ? '4. पैन कार्ड (PAN Card):' : '4. Tax Registration (PAN Card):'}
          </span>{' '}
          {language === 'hi'
            ? 'आयकर विभाग द्वारा जारी वैध स्थायी खाता संख्या (PAN) कार्ड की प्रति।'
            : 'Valid PAN Card copy issued by Income Tax Department.'}
        </div>
        <div className="col-span-2 rounded border border-gray-300 bg-white p-1.5">
          <span className="font-bold text-[#1e3a8a]">
            {language === 'hi'
              ? '5. पूर्व रोजगार अनुभव एवं अनापत्ति पत्र:'
              : '5. Prior Employment Experience & Relieving Credentials:'}
          </span>{' '}
          {language === 'hi'
            ? 'पूर्व नियोक्ता का कार्यमुक्ति पत्र (Relieving Letter), त्यागपत्र स्वीकृति एवं पिछले 3 माह की वेतन पर्चियां।'
            : 'Relieving letter from previous employer, resignation acceptance & pay slips for 3 consecutive months.'}
        </div>
      </div>
      <div className="mt-1 border-t border-gray-300 pt-0.5 text-[9.5px] font-medium text-gray-800">
        <p>
          {language === 'hi' ? (
            <>
              प्रस्ताव स्वीकार करने के <span className="font-bold">तीन (3) कार्य दिवसों</span> के
              भीतर स्पष्ट{' '}
              <span className="font-bold">
                PDF, JPEG, or PNG formats (maximum file size 5MB per document)
              </span>{' '}
              में अपलोड करें। सभी दस्तावेज स्वतंत्र{' '}
              <span className="font-bold">Background Verification (BGV)</span> के अधीन हैं।
            </>
          ) : (
            <>
              Upload in clear{' '}
              <span className="font-bold">
                PDF, JPEG, or PNG formats (maximum file size 5MB per document)
              </span>{' '}
              within <span className="font-bold">three (3) business days</span> of acceptance.
              Subject to independent{' '}
              <span className="font-bold">Background Verification (BGV)</span>.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
