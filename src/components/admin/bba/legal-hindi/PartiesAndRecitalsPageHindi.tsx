import type { BBALegalContext } from './types';
import { BbaPageFooterHindi } from './BbaPageFooterHindi';
import { BBA_A4_PAGE_STYLE, BBA_A4_PAGE_CLASS } from '../legal/bbaA4Styles';
import {
  getProjectLegalLocation,
  getProjectCity as getProjectCityUtil,
} from '@/src/lib/utils/projectLocations';

const getProjectLocation = (projectName: string) => getProjectLegalLocation(projectName, 'hi');
const getProjectCity = (projectName: string) => getProjectCityUtil(projectName, 'hi');

/**
 * Second page block of the BBA legal preview (Hindi): title + party identification
 */
export function PartiesAndRecitalsPageHindi({ formData, companyInfo }: BBALegalContext) {
  return (
    <>
      <div data-pdf-page="true" className={BBA_A4_PAGE_CLASS} style={BBA_A4_PAGE_STYLE}>
        <p className="mb-2 text-left text-[15px] font-bold underline">
          नोट: कृपया बीबीए फॉर्म को पूरी तरह से बड़े अक्षरों (CAPITAL LETTERS) में भरें।
        </p>
        <p className="mb-2 text-justify text-[15px] leading-relaxed">
          आवंटी(यां) एतद्द्वारा सहमत होते हैं और पुष्टि करते हैं कि उन्होंने इस करार के सभी नियमों
          और शर्तों को, जिसमें इससे जुड़े अनुबंध भी शामिल हैं, पढ़, समझ और स्वीकार कर लिया है, और
          आवंटी(यां) एतद्द्वारा सहमत होते हैं और पुष्टि करते हैं कि आवंटी(यों) ने पूर्ण ज्ञान और
          सहमति से फर्म के साथ यह करार किया है।
        </p>
        <p className="mb-2 text-justify text-[15px] leading-relaxed">
          आवंटी(यां) स्वीकार करते हैं कि इस करार को आवंटी(यों) द्वारा समझी जाने वाली भाषा में समझाया
          गया है और आवंटी(यों) ने इस करार की विषयवस्तु को पूरी तरह से समझ लिया है।
        </p>
        <p className="mb-2 text-justify text-[15px] leading-relaxed">
          आवंटी(यां) एतद्द्वारा सहमत होते हैं और पुष्टि करते हैं कि आवंटी(यों) ने उक्त भूमि और उक्त
          परिसर के संबंध में फर्म के स्वामित्व की जाँच कर ली है और वे इससे संतुष्ट हैं।
        </p>
        <p className="mb-2 text-center text-lg font-bold uppercase">
          &quot;{formData?.projectName?.toUpperCase() || ''}&quot;
        </p>
        <p className="mb-2 text-center text-sm font-bold uppercase">
          {getProjectCity(formData?.projectName)}
        </p>
        <p className="mb-2 text-center text-xl font-bold underline">बिल्डर-बायर करार</p>
        <p className="mb-2 text-justify text-[15px] leading-relaxed">
          यह बिल्डर-बायर करार (जिसे आगे &apos;<strong>करार</strong>&apos; के रूप में संदर्भित किया
          जाएगा) इस{' '}
          <strong>
            {new Date(formData.bookingDate || Date.now()).toLocaleDateString('hi-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </strong>{' '}
          को निष्पादित किया गया है।
        </p>
        <p className="my-2 text-center text-lg font-bold">पक्षों के बीच</p>
        <p className="mb-2 text-justify text-[15px] leading-relaxed">
          <strong>मैसर्स SVI INFRA SOLUTIONS PVT. LTD.,</strong> एक कंपनी जिसका पंजीकृत एवं
          कॉर्पोरेट कार्यालय वर्तमान में <strong>{companyInfo.company_address}</strong> पर स्थित है,
          जिसका प्रतिनिधित्व इसके अधिकृत हस्ताक्षरकर्ता श्री विनीत नारनावत, निदेशक, आयु लगभग 43
          वर्ष, पुत्र श्री रमेश चंद नारनावत, निवासी मकान नं. 162, वीपीओ-बढाल, थाना-चोमू, जिला जयपुर,
          राजस्थान द्वारा किया जा रहा है (जिसे आगे &apos;
          <strong>कंपनी / फर्म / बिल्डर / प्रथम पक्ष</strong>&apos; के रूप में संदर्भित किया जाएगा,
          जिस अभिव्यक्ति में जब तक संदर्भ के प्रतिकूल न हो, इसके उत्तराधिकारियों, निष्पादकों,
          प्रशासकों, प्रतिनिधियों, नामांकितों, समनुदेशितियों, वारिसों, विधिक प्रतिनिधियों आदि को
          शामिल माना जाएगा) <strong>प्रथम पक्षकार;</strong>
        </p>
        <p className="my-3 text-center text-[15px] font-bold">तथा</p>
        <p className="mb-0 text-[15px]">(व्यक्तियों के लिए)</p>
        <p className="mb-2 text-[15px]">प्रथम आवंटी</p>
        <p className="mb-1 text-[15px]">
          <strong>नाम:</strong> {formData.salutation ? `${formData.salutation}. ` : ''}
          {formData.clientName}
        </p>
        <p className="mb-1 text-[15px]">
          <strong>पुत्र/पुत्री/पत्नी:</strong> {formData.fatherName || '______________________'}
        </p>
        <p className="mb-1 text-[15px]">
          <strong>आयु:</strong> {formData.age ? `${formData.age} वर्ष` : '_______ वर्ष'}
        </p>
        <p className="mb-1 text-[15px]">
          <strong>पैन (PAN):</strong> {formData.panNumber || '______________________'}
        </p>
        <p className="mb-1 text-[15px]">
          <strong>संपर्क सूत्र:</strong> {formData.mobileNumber || '______________________'}
          {formData.email ? ` | ईमेल: ${formData.email}` : ' | ईमेल: ______________________'}
        </p>
        <p className="mb-1 text-[15px] font-bold">स्थायी पता:</p>
        <p className="mb-1 text-[15px]">
          {formData.addressLine1 || formData.address}
          {formData.addressLine2 ? `, ${formData.addressLine2}` : ''}
        </p>
        <p className="mb-2 text-[15px] font-bold">
          {[formData.city, formData.state, formData.pincode].filter(Boolean).join(', ')}
        </p>
        <div className="mt-3 mb-2 rounded-lg border border-l-4 border-slate-200 border-l-[#0f2942] bg-slate-50/70 p-3">
          <p className="mb-2 text-[13.5px] font-bold tracking-wider text-[#0f2942] uppercase">
            नामांकित व्यक्ति (नॉमिनी) विवरण{' '}
            <span className="text-[12px] font-normal text-slate-600">
              (आवंटी के देहांत की स्थिति में)
            </span>
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[14px]">
            <div>
              <span className="font-medium text-slate-600">नॉमिनी का नाम:</span>{' '}
              <strong className="text-slate-900">
                {formData.nomineeName || '______________________'}
              </strong>
            </div>
            <div>
              <span className="font-medium text-slate-600">आवंटी से संबंध:</span>{' '}
              <strong className="text-slate-900">
                {formData.nomineeRelation || '______________________'}
              </strong>
            </div>
            <div>
              <span className="font-medium text-slate-600">आयु:</span>{' '}
              <strong className="text-slate-900">
                {formData.nomineeAge ? `${formData.nomineeAge} वर्ष` : '_______ वर्ष'}
              </strong>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-slate-600">नॉमिनी का पता:</span>{' '}
              <strong className="text-slate-900">
                {formData.nomineeAddress || '____________________________________________'}
              </strong>
            </div>
          </div>
        </div>
        <BbaPageFooterHindi companyInfo={companyInfo} pageNumber={3} />
      </div>
      <div data-pdf-page="true" className={BBA_A4_PAGE_CLASS} style={BBA_A4_PAGE_STYLE}>
        <p className="mb-3 text-center text-[15px] font-bold">तथा</p>
        <p className="mb-1 text-[15px] font-bold">द्वितीय आवंटी</p>
        <p className="mb-1 text-[15px]">
          <strong>नाम:</strong> ______________________
        </p>
        <p className="mb-1 text-[15px]">
          <strong>पुत्र/पुत्री/पत्नी:</strong> ______________________
        </p>
        <p className="mb-1 text-[15px]">
          <strong>आयु:</strong> _______ वर्ष
        </p>
        <p className="mb-2 text-[15px]">
          <strong>पता:</strong> ______________________
        </p>
        <p className="my-3 text-center text-[15px] font-bold">तथा</p>
        <p className="mb-1 text-[15px] font-bold">तृतीय आवंटी</p>
        <p className="mb-1 text-[15px]">
          <strong>नाम:</strong> ______________________
        </p>
        <p className="mb-1 text-[15px]">
          <strong>पुत्र/पुत्री/पत्नी:</strong> ______________________
        </p>
        <p className="mb-1 text-[15px]">
          <strong>आयु:</strong> _______ वर्ष
        </p>
        <p className="mb-2 text-[15px] font-bold">अथवा</p>
        <p className="mb-1 text-[15px] font-bold">(फर्मों के लिए)</p>
        <p className="mb-1 text-[15px]">
          <strong>मैसर्स:</strong> ______________________
        </p>
        <p className="mb-1 text-[15px]">
          <strong>प्रोपराइटर/पार्टनर के माध्यम से:</strong> ______________________
        </p>
        <p className="mb-1 text-[15px]">
          <strong>पता:</strong> ______________________
        </p>
        <p className="mb-2 text-[15px] font-bold">अथवा</p>
        <p className="mb-1 text-[15px] font-bold">(कंपनियों के लिए)</p>
        <p className="mb-1 text-[15px]">
          <strong>मैसर्स:</strong> ______________________
        </p>
        <p className="mb-1 text-[15px]">
          <strong>निदेशक/अधिकृत हस्ताक्षरकर्ता के माध्यम से:</strong> ______________________
        </p>
        <p className="mb-1 text-[15px]">
          <strong>पता:</strong> ______________________
        </p>
        <p className="mb-2 text-[15px]">
          (जिसे आगे &apos;आवंटी(यां)&apos; के रूप में संदर्भित किया जाएगा)
        </p>
        <p className="mb-2 text-justify text-[15px] leading-relaxed">
          प्रथम भाग का पक्ष और द्वितीय भाग का पक्ष को व्यक्तिगत रूप से &apos;
          <strong>पक्ष</strong>&apos; और सामूहिक रूप से &apos;<strong>पक्षगण</strong>&apos; कहा
          जाएगा।
        </p>
        <p className="mb-2 text-[15px] font-bold">फर्म का प्रतिनिधित्व</p>
        <p className="mb-2 text-justify text-[15px] leading-relaxed">
          <strong>चूँकि</strong> फर्म, परियोजना &quot;
          {formData?.projectName?.toUpperCase() || ''}&quot;
          {getProjectLocation(formData?.projectName)
            ? `, ${getProjectLocation(formData?.projectName)} स्थित भूमि (जिसे आगे `
            : ` स्थित भूमि (जिसे आगे `}
          &apos;<strong>उक्त भूमि</strong>&apos; के रूप में संदर्भित किया जाएगा) की वास्तविक क्रेता
          है।
        </p>
        <p className="mb-2 text-justify text-[15px] leading-relaxed">
          <strong>और चूँकि</strong> यह स्पष्ट किया जाता है कि फर्म का उक्त भवन/उक्त परिसर/उक्त भूमि
          के बाहर पड़ने वाली किसी भी भूमि में कोई अधिकार या हित हस्तांतरित करने का इरादा नहीं है और
          उक्त भूमि के बाहर की भूमि पर होने वाले निर्माण के संबंध में किसी भी प्रकार का कोई प्रभाव
          नहीं दिया गया है।
        </p>
        <BbaPageFooterHindi companyInfo={companyInfo} pageNumber={4} />
      </div>
    </>
  );
}
