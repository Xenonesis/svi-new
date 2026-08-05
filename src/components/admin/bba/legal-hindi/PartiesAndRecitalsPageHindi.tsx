import type { BBALegalContext } from './types';
import { BbaPageFooterHindi } from './BbaPageFooterHindi';

const getProjectLocation = (projectName: string) => {
  if (projectName?.toLowerCase().includes('shivani vatika')) {
    return 'ग्राम हरसोली, तहसील रेनवाल, जिला जयपुर, राज्य – राजस्थान';
  }
  return 'ग्राम बसादी तहसील किशन गढ़ रेनवाल, जिला जयपुर, राज्य – राजस्थान';
};

const getProjectCity = (_projectName: string) => {
  return 'जयपुर, राजस्थान';
};

/**
 * Second page block of the BBA legal preview (Hindi): title + party identification
 */
export function PartiesAndRecitalsPageHindi({ formData, companyInfo }: BBALegalContext) {
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
        <p className="mb-2 text-left text-[13px] font-bold underline">
          नोट: कृपया बीबीए फॉर्म को पूरी तरह से बड़े अक्षरों (CAPITAL LETTERS) में भरें।
        </p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          आवंटी(यां) एतद्द्वारा सहमत होते हैं और पुष्टि करते हैं कि उन्होंने इस करार के सभी नियमों
          और शर्तों को, जिसमें इससे जुड़े अनुबंध भी शामिल हैं, पढ़, समझ और स्वीकार कर लिया है, और
          आवंटी(यां) एतद्द्वारा सहमत होते हैं और पुष्टि करते हैं कि आवंटी(यों) ने पूर्ण ज्ञान और
          सहमति से फर्म के साथ यह करार किया है।
        </p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          आवंटी(यां) स्वीकार करते हैं कि इस करार को आवंटी(यों) द्वारा समझी जाने वाली भाषा में समझाया
          गया है और आवंटी(यों) ने इस करार की विषयवस्तु को पूरी तरह से समझ लिया है।
        </p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          आवंटी(यां) एतद्द्वारा सहमत होते हैं और पुष्टि करते हैं कि आवंटी(यों) ने उक्त भूमि और उक्त
          परिसर के संबंध में फर्म के स्वामित्व की जाँच कर ली है और वे इससे संतुष्ट हैं।
        </p>
        <p className="mb-2 text-center text-lg font-bold uppercase">
          &quot;{formData?.projectName?.toUpperCase() || 'SHYAM AANGAN'}&quot;
        </p>
        <p className="mb-2 text-center text-sm font-bold uppercase">
          {getProjectCity(formData?.projectName)}
        </p>
        <p className="mb-2 text-center text-xl font-bold underline">बिल्डर-बायर करार</p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
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
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          <strong>मे./SVI INFRA SOLUTIONS PVT LTD,</strong> फर्म, जिसका पंजीकृत कार्यालय वर्तमान में{' '}
          <strong>{companyInfo.company_address}</strong> पर है तथा कॉर्पोरेट कार्यालय भी{' '}
          <strong>{companyInfo.company_address}</strong> पर है, जिसका प्रतिनिधित्व इसके अधिकृत
          हस्ताक्षरकर्ता श्री विनीत नारनावत, निदेशक, आयु लगभग 43 वर्ष, पुत्र श्री रमेश चंद नारनावत,
          निवासी मकान नं. 162, वीपीओ-बढाल, थाना-चोमू, जिला जयपुर, राजस्थान द्वारा किया जा रहा है
          (जिसे आगे &apos;<strong>फर्म / बिल्डर / प्रथम पक्ष</strong>&apos; के रूप में संदर्भित किया
          जाएगा, जिस अभिव्यक्ति में जब तक संदर्भ के प्रतिकूल न हो, इसके उत्तराधिकारियों, निष्पादकों,
          प्रशासकों, प्रतिनिधियों, नामांकितों, समनुदेशितियों, वारिसों, विधिक प्रतिनिधियों आदि को
          शामिल माना जाएगा) <strong>प्रथम भाग</strong> का;
        </p>
        <p className="my-3 text-center text-[13px] font-bold">तथा</p>
        <p className="mb-0 text-[13px]">(व्यक्तियों के लिए)</p>
        <p className="mb-2 text-[13px]">प्रथम आवंटी</p>
        <p className="mb-1 text-[13px]">
          <strong>नाम:</strong> {formData.salutation ? `${formData.salutation}. ` : ''}
          {formData.clientName}
        </p>
        <p className="mb-1 text-[13px]">
          <strong>पुत्र/पुत्री/पत्नी:</strong> {formData.fatherName || '______________________'}
        </p>
        <p className="mb-1 text-[13px]">
          <strong>आयु:</strong> {formData.age ? `${formData.age} वर्ष` : '_______ वर्ष'}
        </p>
        <p className="mb-1 text-[13px] font-bold">स्थायी पता:</p>
        <p className="mb-1 text-[13px]">
          {formData.addressLine1 || formData.address}
          {formData.addressLine2 ? `, ${formData.addressLine2}` : ''}
        </p>
        <p className="mb-1 text-[13px] font-bold">
          {[formData.city, formData.state, formData.pincode].filter(Boolean).join(', ')}
        </p>
        <p className="my-3 text-center text-[13px] font-bold">तथा</p>

        <p className="mb-1 text-[13px] font-bold">द्वितीय आवंटी</p>
        <p className="mb-1 text-[13px]">
          <strong>नाम:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>पुत्र/पुत्री/पत्नी:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>आयु:</strong> _______ वर्ष
        </p>
        <p className="mb-2 text-[13px]">
          <strong>पता:</strong> ______________________
        </p>
        <p className="my-3 text-center text-[13px] font-bold">तथा</p>
        <p className="mb-1 text-[13px] font-bold">तृतीय आवंटी</p>
        <p className="mb-1 text-[13px]">
          <strong>नाम:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>पुत्र/पुत्री/पत्नी:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>आयु:</strong> _______ वर्ष
        </p>
        <p className="mb-2 text-[13px] font-bold">अथवा</p>
        <p className="mb-1 text-[13px] font-bold">(फर्मों के लिए)</p>
        <p className="mb-1 text-[13px]">
          <strong>मे.:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>प्रोपराइटर/पार्टनर के माध्यम से:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>पता:</strong> ______________________
        </p>
        <p className="mb-2 text-[13px] font-bold">अथवा</p>
        <p className="mb-1 text-[13px] font-bold">(कंपनियों के लिए)</p>
        <p className="mb-1 text-[13px]">
          <strong>मे.:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>निदेशक/अधिकृत हस्ताक्षरकर्ता के माध्यम से:</strong> ______________________
        </p>
        <p className="mb-1 text-[13px]">
          <strong>पता:</strong> ______________________
        </p>
        <p className="mb-2 text-[13px]">
          (जिसे आगे &apos;आवंटी(यां)&apos; के रूप में संदर्भित किया जाएगा)
        </p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          प्रथम भाग का पक्ष और द्वितीय भाग का पक्ष को व्यक्तिगत रूप से &apos;
          <strong>पक्ष</strong>&apos; और सामूहिक रूप से &apos;<strong>पक्षगण</strong>&apos; कहा
          जाएगा।
        </p>
        <p className="mb-2 text-[13px] font-bold">फर्म का प्रतिनिधित्व</p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          <strong>चूँकि</strong> फर्म &quot;
          {formData?.projectName?.toUpperCase() || 'SHYAM AANGAN'}&quot;,{' '}
          {getProjectLocation(formData?.projectName)} नामक भूमि की वास्तविक क्रेता है (जिसे आगे
          &apos;<strong>उक्त भूमि</strong>&apos; के रूप में संदर्भित किया जाएगा)।
        </p>
        <p className="mb-2 text-justify text-[13px] leading-relaxed">
          <strong>और चूँकि</strong> यह स्पष्ट किया जाता है कि फर्म का उक्त भवन/उक्त परिसर/उक्त भूमि
          के बाहर पड़ने वाली किसी भी भूमि में कोई अधिकार या हित हस्तांतरित करने का इरादा नहीं है और
          उक्त भूमि के बाहर की भूमि पर होने वाले निर्माण के संबंध में किसी भी प्रकार का कोई प्रभाव
          नहीं दिया गया है।
        </p>
        <BbaPageFooterHindi companyInfo={companyInfo} />
      </div>
    </>
  );
}
