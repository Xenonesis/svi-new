import React from 'react';
import BbaLegalPagesHindi from '../../../../app/admin/bba/BbaLegalPagesHindi';
import { BbaPageFooterHindi } from '../bba/legal-hindi/BbaPageFooterHindi';

export default function BbaPreviewContentHindi({ formData, companyInfo }: any) {
  const getProjectLocation = (projectName: string) => {
    if (projectName?.toLowerCase().includes('shivani vatika')) {
      return '(Village Harsoli, Tehsil Renwal, District Jaipur, Rajasthan)';
    }
    // Default location for Shyam Aangan and others
    return '(Kishan Garh Renwal, Jaipur, Rajasthan)';
  };

  const projectLocation = getProjectLocation(formData?.projectName);

  const calculateTotalCost = (data: any) => {
    const area = parseFloat(data?.area) || 0;
    const bsp = parseFloat(data?.bsp) || 0;
    const plc = parseFloat(data?.plc) || 0;
    const edc = parseFloat(data?.edc) || 0;
    const base = area * bsp;
    const plcAmount = base * (plc / 100);
    return base + plcAmount + edc;
  };

  const totalCost = calculateTotalCost(formData);

  const fmtInr = (num: number) =>
    `\u20b9${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fmtDate = (dateStr: string, addDays = 0, addMonths = 0) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (addDays) d.setDate(d.getDate() + addDays);
    if (addMonths) d.setMonth(d.getMonth() + addMonths);
    return d.toISOString().split('T')[0].split('-').reverse().join('-');
  };

  return (
    <div className="bg-white p-8 font-sans text-[15px] leading-relaxed text-black">
      {/* Cover Page */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '257mm',
        }}
      >
        <div className="mb-3.5 flex items-start justify-between border-b border-gray-200 pb-3">
          <div>
            <h1 className="mb-1 text-xl font-bold tracking-wide text-[#1e3a8a] uppercase">
              {companyInfo?.company_name}
            </h1>
            <p className="text-[12.5px] text-gray-700">
              Cell: {companyInfo?.company_phone} | Email: {companyInfo?.company_email} | Web:{' '}
              {companyInfo?.company_website}
            </p>
            <p className="text-[12.5px] text-gray-700">Office: {companyInfo?.company_address}</p>
          </div>
          <div className="w-36">
            <img
              src="/logo.png"
              alt={companyInfo?.company_name}
              className="h-auto w-full object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        </div>

        {/* Date & To */}
        <div className="mb-3 text-[14.5px] leading-snug">
          <p className="mb-1 font-bold">
            दिनांक:{' '}
            {formData?.bookingDate ||
              new Date().toISOString().split('T')[0].split('-').reverse().join('-')}
          </p>
          <p className="font-bold">सेवा में,</p>
          <p className="font-bold text-[#1e3a8a]">{formData?.clientName || '[ग्राहक का नाम]'}</p>
          {formData?.addressLine1 && (
            <p className="font-medium text-gray-800">{formData?.addressLine1}</p>
          )}
          {formData?.addressLine2 && (
            <p className="font-medium text-gray-800">{formData?.addressLine2}</p>
          )}
          {(formData?.city || formData?.state || formData?.pincode) && (
            <p className="font-medium text-gray-800">
              {[formData?.city, formData?.state, formData?.pincode].filter(Boolean).join(', ')}
            </p>
          )}
          {!formData?.addressLine1 && <p className="font-medium text-gray-800">[पता]</p>}
        </div>

        {/* Body */}
        <div className="mb-3 text-[14px] leading-relaxed">
          <p className="mb-1.5">
            आदरणीय {formData?.salutation || 'श्री/श्रीमती/सुश्री'}{' '}
            <span className="font-bold text-black">
              {formData?.clientName || '[ग्राहक का नाम]'}
            </span>
            ,
          </p>
          <p className="mb-2 text-justify">
            {formData?.projectName} {projectLocation} में आपके नए निवेश एवं भूखंड/यूनिट आवंटन पर{' '}
            <strong>{companyInfo?.company_name}</strong> परिवार की ओर से हार्दिक बधाई। हम आपके इस
            निवेश का हिस्सा बनकर अत्यंत गौरवान्वित एवं सौभाग्यशाली अनुभव करते हैं तथा हमारे साथ
            जुड़ने के लिए आपका सहृदय धन्यवाद करते हैं।
          </p>
          <p className="text-justify">
            यह पत्र आपकी पसंदीदा आवासीय/व्यावसायिक इकाई के अनंतिम आवंटन की पुष्टि करता है। हमारी
            प्रतिबद्धता आपको पारदर्शी, सुरक्षित एवं गुणवत्तापूर्ण विकास प्रदान करने की है। आपके
            आवंटित भूखंड एवं लागत योजना का विवरण निम्नानुसार है:
          </p>

          {/* Allotment Summary Card (2x3 Grid) */}
          <div className="my-2.5 rounded-lg border border-gray-300 bg-gray-50/90 p-2.5 shadow-xs">
            <p className="mb-1.5 text-[13.5px] font-bold text-[#1e3a8a]">
              आवंटन विवरण संक्षेप (Allotment Summary):
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
              <div>
                <span className="text-gray-600">टिकट / संदर्भ सं.:</span>{' '}
                <strong className="text-black">{formData?.ticketId || '—'}</strong>
              </div>
              <div>
                <span className="text-gray-600">परियोजना का नाम:</span>{' '}
                <strong className="text-black">{formData?.projectName || '—'}</strong>
              </div>
              <div>
                <span className="text-gray-600">आवंटित यूनिट सं.:</span>{' '}
                <strong className="whitespace-nowrap text-black">
                  {formData?.unitNumber || '—'}
                </strong>
              </div>
              <div>
                <span className="text-gray-600">भूखंड क्षेत्रफल:</span>{' '}
                <strong className="whitespace-nowrap text-black">
                  {formData?.area ? `${formData.area} वर्ग गज` : '—'}
                </strong>
              </div>
              <div>
                <span className="text-gray-600">आवंटन / बुकिंग तिथि:</span>{' '}
                <strong className="text-black">
                  {formData?.bookingDate ||
                    new Date().toISOString().split('T')[0].split('-').reverse().join('-')}
                </strong>
              </div>
              <div>
                <span className="text-gray-600">चयनित भुगतान योजना:</span>{' '}
                <strong className="text-black">
                  {formData?.paymentPlan ? `${formData.paymentPlan} माह किश्त योजना` : '—'}
                </strong>
              </div>
            </div>
          </div>

          <p className="mt-2.5 mb-1 text-[13.5px] font-bold">लागत एवं भुगतान योजना विवरण:</p>
        </div>

        {/* Details Table */}
        <div className="mb-3 overflow-hidden rounded-lg border border-gray-400 text-[13px]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#00b0f0] text-black">
                <th className="border border-gray-400 p-1.5 font-bold">ग्राहक का नाम</th>
                <th className="border border-gray-400 p-1.5 font-bold">आवंटित यूनिट</th>
                <th className="border border-gray-400 p-1.5 font-bold">क्षेत्रफल (वर्ग गज)</th>
                <th className="border border-gray-400 p-1.5 font-bold">भुगतान योजना</th>
                <th className="border border-gray-400 p-1.5 font-bold">बीएसपी (प्रति वर्ग गज)</th>
                <th className="border border-gray-400 p-1.5 font-bold">पीएलसी (%)</th>
                <th className="border border-gray-400 p-1.5 font-bold">कुल लागत</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-1.5 font-bold">{formData?.clientName}</td>
                <td className="border border-gray-400 p-1.5 font-bold">{formData?.unitNumber}</td>
                <td className="border border-gray-400 p-1.5 font-bold">{formData?.area}</td>
                <td className="border border-gray-400 p-1.5 font-bold">
                  {formData?.paymentPlan} माह
                </td>
                <td className="border border-gray-400 p-1.5 font-bold">
                  {`\u20b9${parseFloat(formData?.bsp || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </td>
                <td className="border border-gray-400 p-1.5 font-bold">{formData?.plc || ''}</td>
                <td className="border border-gray-400 p-1.5 font-bold">{fmtInr(totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Important Instructions Box (4 Points) */}
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50/60 p-2.5 text-[12.5px] leading-relaxed">
          <p className="mb-1 font-bold text-[#1e3a8a]">महत्वपूर्ण निर्देश एवं आवंटन शर्तें:</p>
          <ul className="list-disc space-y-0.5 pl-5 text-gray-800">
            <li>
              यह आवंटन बिल्डर-बायर्स एग्रीमेंट (BBA) में उल्लेखित सभी नियमों, उप-नियमों एवं शर्तों
              के पूर्णतः अधीन है।
            </li>
            <li>
              संलग्न भुगतान अनुसूची (अनुबंध-ए) के अनुसार निर्धारित समय पर किश्तों का भुगतान अनुबंध
              का अनिवार्य तत्व है।
            </li>
            <li>
              कृपया इस एग्रीमेंट की एक प्रति विधिवत हस्ताक्षरित कर 7 कार्य दिवसों के भीतर कंपनी को
              वापस प्रेषित करें।
            </li>
            <li>
              पंजीकरण शुल्क, स्टाम्प ड्यूटी, विकास शुल्क एवं अन्य सांविधिक कर नियमानुसार
              रजिस्ट्री/कब्जे के समय अतिरिक्त देय होंगे।
            </li>
          </ul>
        </div>

        {/* Customer Helpdesk Banner */}
        <div className="mb-3 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 text-[12px] text-gray-700">
          <div>
            <span className="font-semibold text-gray-900">सहायता डेस्क: </span>
            <span>
              ईमेल: {companyInfo?.company_email} | हेल्पलाइन: {companyInfo?.company_phone}
            </span>
          </div>
          <div className="text-right font-medium text-gray-500">
            समय: 10:00 AM - 6:30 PM (सोमवार - शनिवार)
          </div>
        </div>
        <BbaPageFooterHindi companyInfo={companyInfo} />
      </div>
      {/* Legal Pages (2-17) */}
      <BbaLegalPagesHindi formData={formData} companyInfo={companyInfo} totalCost={totalCost} />

      {/* Payment Schedule Table (Page 18-19) */}
      <div
        style={{
          pageBreakBefore: 'always',
          paddingTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '257mm',
        }}
      >
        <h3 className="mb-2 text-lg font-bold text-gray-800">भुगतान अनुसूची</h3>
        <div className="mb-6 overflow-hidden border border-gray-400">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#00b0f0] text-black">
                <th className="border border-gray-400 p-2 font-bold">क्र.सं.</th>
                <th className="border border-gray-400 p-2 font-bold">तारीख</th>
                <th className="border border-gray-400 p-2 font-bold">विवरण</th>
                <th className="border border-gray-400 p-2 font-bold">%</th>
                <th className="border border-gray-400 p-2 font-bold">राशि</th>
                <th className="border border-gray-400 p-2 font-bold">भुगतान संदर्भ सं.</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const bookingPercent = parseFloat(formData?.bookingPaymentPercent) || 10;
                const showSecondInstalment = String(formData?.showSecondInstalment) === 'true';
                const secondPercent = 20;
                const secondPaymentDays = formData?.secondPaymentDays || '15';
                const emiCount =
                  formData?.emiCount === 'custom'
                    ? parseInt(formData?.paymentPlan || '12')
                    : parseInt(formData?.emiCount || '12');
                const zeroCost = String(formData?.zeroPercentEmi) === 'true';
                const edcInEmi = String(formData?.edcInEmi) === 'true';

                const edcAmount = parseFloat(formData?.edc) || 0;
                const baseCost = totalCost - edcAmount;

                const initialPayment = (edcInEmi ? baseCost : totalCost) * (bookingPercent / 100);
                const secondPayment = (edcInEmi ? baseCost : totalCost) * (secondPercent / 100);

                const remainingPercent = showSecondInstalment
                  ? 100 - bookingPercent - secondPercent
                  : 100 - bookingPercent;

                const emiPercentPerInstallment = formData?.emiPercentage
                  ? parseFloat(formData?.emiPercentage)
                  : remainingPercent / emiCount;

                const totalEmiAmount = edcInEmi
                  ? (baseCost * remainingPercent) / 100 + edcAmount
                  : totalCost * (emiPercentPerInstallment / 100);
                const emiAmount = edcInEmi
                  ? totalEmiAmount / emiCount
                  : totalCost * (emiPercentPerInstallment / 100);

                const formatPercent = (val: number) => {
                  return val % 1 === 0 ? `${val}%` : `${val.toFixed(1)}%`;
                };

                const rows = [];
                let sno = 1;

                // 1. On Booking Row
                let bookingDateStr = '-';
                if (formData?.bookingDate) {
                  const d = new Date(formData.bookingDate);
                  bookingDateStr = d.toISOString().split('T')[0];
                }
                rows.push(
                  <tr key="booking">
                    <td className="border border-gray-400 p-2 font-bold">{sno++}</td>
                    <td className="border border-gray-400 p-2 font-bold">{bookingDateStr}</td>
                    <td className="border border-gray-400 p-2 font-bold">बुकिंग पर</td>
                    <td className="border border-gray-400 p-2">{formatPercent(bookingPercent)}</td>
                    <td className="border border-gray-400 p-2 font-bold">
                      Rs.{' '}
                      {formData?.onBookingAmount
                        ? parseFloat(formData.onBookingAmount).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })
                        : initialPayment.toFixed(2)}
                    </td>
                    <td className="border border-gray-400 p-2">
                      {formData?.onBookingPaymentRef || '-'}
                    </td>
                  </tr>
                );

                // 2. Second Instalment Row (if enabled OR ref is manually entered)
                if (showSecondInstalment || formData?.within15DaysPaymentRef) {
                  let secondDateStr = '-';
                  if (formData?.bookingDate) {
                    const d = new Date(formData.bookingDate);
                    d.setDate(d.getDate() + parseInt(secondPaymentDays));
                    secondDateStr = d.toISOString().split('T')[0];
                  }
                  rows.push(
                    <tr key="second">
                      <td className="border border-gray-400 p-2 font-bold">{sno++}</td>
                      <td className="border border-gray-400 p-2 font-bold">{secondDateStr}</td>
                      <td className="border border-gray-400 p-2 font-bold">
                        {secondPaymentDays} दिनों के भीतर
                      </td>
                      <td className="border border-gray-400 p-2">{formatPercent(secondPercent)}</td>
                      <td className="border border-gray-400 p-2 font-bold">
                        Rs.{' '}
                        {formData?.within15DaysAmount
                          ? parseFloat(formData.within15DaysAmount).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                            })
                          : secondPayment.toFixed(2)}
                      </td>
                      <td className="border border-gray-400 p-2">
                        {formData?.within15DaysPaymentRef || '-'}
                      </td>
                    </tr>
                  );
                }

                // 3. EMI Rows
                for (let i = 0; i < emiCount; i++) {
                  let emiDateStr = '-';
                  if (formData?.emiStartDate) {
                    const d = new Date(formData.emiStartDate);
                    d.setMonth(d.getMonth() + i);
                    emiDateStr = d.toISOString().split('T')[0];
                  } else if (formData?.bookingDate) {
                    const d = new Date(formData.bookingDate);
                    d.setMonth(d.getMonth() + i + 2);
                    emiDateStr = d.toISOString().split('T')[0];
                  }

                  const emiLabel = zeroCost
                    ? `${i + 1} ईएमआई (0% ब्याज)`
                    : edcInEmi
                      ? `${i + 1} ईएमआई (ईडीसी सहित)`
                      : `${i + 1} ईएमआई`;

                  rows.push(
                    <tr key={`emi-${i}`}>
                      <td className="border border-gray-400 p-2 font-bold">{sno++}</td>
                      <td className="border border-gray-400 p-2 font-bold">{emiDateStr}</td>
                      <td className="border border-gray-400 p-2 font-bold">{emiLabel}</td>
                      <td className="border border-gray-400 p-2">
                        {formatPercent(emiPercentPerInstallment)}
                      </td>
                      <td className="border border-gray-400 p-2 font-bold">
                        Rs. {emiAmount.toFixed(2)}
                      </td>
                      <td className="border border-gray-400 p-2">-</td>
                    </tr>
                  );
                }

                return rows;
              })()}
            </tbody>
          </table>
        </div>

        {/* Terms Box */}
        <div className="mb-8 rounded-lg border-l-4 border-[#00b0f0] bg-[#f0f8ff] p-4 text-gray-800 italic">
          {(() => {
            const bookingPercent = parseFloat(formData?.bookingPaymentPercent) || 10;
            const edcInEmi = String(formData?.edcInEmi) === 'true';
            const edcAmount = parseFloat(formData?.edc) || 0;
            const baseCost = totalCost - edcAmount;
            const initialPayment = (edcInEmi ? baseCost : totalCost) * (bookingPercent / 100);

            return (
              <>
                <p className="mb-2">
                  कृपया आवंटन की पुष्टि के लिए {bookingPercent}% की प्रारंभिक राशि (रु.{' '}
                  {initialPayment.toFixed(2)}) पहले 3 दिनों के भीतर (तब तक{' '}
                  {(() => {
                    if (!formData?.bookingDate) return '[तारीख]';
                    const d = new Date(formData.bookingDate);
                    d.setDate(d.getDate() + 3);
                    return d.toISOString().split('T')[0];
                  })()}
                  ) {formData?.projectName || 'परियोजना'} के तहत स्थानांतरित करें।
                </p>
                {String(formData?.showSecondInstalment) === 'true' && (
                  <p className="mb-2">
                    20% की दूसरी किस्त (रु. {((edcInEmi ? baseCost : totalCost) * 0.2).toFixed(2)}){' '}
                    {formData?.secondPaymentDays || '15'} दिनों के भीतर (तब तक{' '}
                    {(() => {
                      if (!formData?.bookingDate) return '[तारीख]';
                      const d = new Date(formData.bookingDate);
                      d.setDate(d.getDate() + parseInt(formData?.secondPaymentDays || '15'));
                      return d.toISOString().split('T')[0];
                    })()}
                    ) तक जमा करनी होगी।
                  </p>
                )}
                <p className="mb-2">
                  नोट: {formData?.projectName || 'परियोजना'} के तहत आवंटन की पुष्टि केवल देय तिथि तक
                  प्रारंभिक {bookingPercent}% (रु. {initialPayment.toFixed(2)}) प्राप्त होने पर ही
                  होगी।
                </p>
                <p>
                  यदि आप अपनी चुनी हुई भुगतान योजना के अनुसार भुगतान करने में विफल रहते हैं, तो इन
                  भूखंडों का आवंटन स्वतः रद्द हो जाएगा।
                </p>
              </>
            );
          })()}
        </div>

        {/* Footer details */}
        <div className="mt-auto flex items-end justify-between pb-8">
          <div>
            <p className="mb-2 font-bold">
              भुगतान निम्नलिखित विवरण का उपयोग करके ऑनलाइन स्थानांतरित किया जा सकता है:
            </p>
            <p>
              <span className="font-bold">खाता नाम:</span>{' '}
              {companyInfo?.bank_account_name || 'Svi Infra Solutions Pvt. Ltd'}
            </p>
            <p>
              <span className="font-bold">खाता संख्या:</span>{' '}
              {companyInfo?.bank_account_no || '0894102000013837'}
            </p>
            <p>
              <span className="font-bold">बैंक:</span> {companyInfo?.bank_name || 'IDBI BANK'}
            </p>
            <p>
              <span className="font-bold">आईएफएससी कोड:</span>{' '}
              {companyInfo?.bank_ifsc || 'IBKL0000894'}
            </p>
            <p className="mt-4">
              आपके अकाउंट मैनेजर <span className="font-bold">{formData?.advisorName}</span> हैं जो
              <span className="font-bold"> {formData?.advisorNumber}</span> पर उपलब्ध रहेंगे
              {formData?.advisorEmail ? (
                <>
                  {' '}
                  (ईमेल: <span className="font-bold">{formData?.advisorEmail}</span>)
                </>
              ) : (
                ''
              )}{' '}
              किसी भी प्रश्न के लिए।
            </p>
          </div>
          <div className="flex flex-col items-end text-right">
            <p className="mb-2">सादर</p>
            <p className="mb-1">{companyInfo?.company_name} की ओर से</p>
            <div className="my-1 h-8 w-24">
              <img
                src="/signature.png"
                alt="Director Signature"
                className="ml-auto h-full w-full object-contain"
              />
            </div>
            <div className="w-48 border-t border-black pt-2 text-center">
              <p>निदेशक</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
