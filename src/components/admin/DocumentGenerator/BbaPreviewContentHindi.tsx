import React from 'react';
import BbaLegalPagesHindi from '../../../../app/admin/bba/BbaLegalPagesHindi';
import { BbaPageFooter } from '../bba/legal/BbaPageFooter';

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
    <div className="bg-white p-8 font-sans text-[13px] leading-relaxed text-black">
      {/* Cover Page */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '257mm',
        }}
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold tracking-wide text-[#1e3a8a] uppercase">
              {companyInfo?.company_name}
            </h1>
            <p className="text-gray-700">
              Cell: {companyInfo?.company_phone} | Email: {companyInfo?.company_email}
            </p>
            <p className="text-gray-700">Website: {companyInfo?.company_website}</p>
            <p className="text-gray-700">Office Address : {companyInfo?.company_address}</p>
          </div>
          <div className="w-48">
            <img
              src="/logo.png"
              alt={companyInfo?.company_name}
              className="h-auto w-full object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        </div>

        {/* Date & To */}
        <div className="mb-6">
          <p className="mb-4 font-bold">
            दिनांक:{' '}
            {formData?.bookingDate ||
              new Date().toISOString().split('T')[0].split('-').reverse().join('-')}
          </p>
          <p className="font-bold">सेवा में,</p>
          <p className="font-bold">{formData?.clientName || '[ग्राहक का नाम]'}</p>
          {formData?.addressLine1 && <p className="font-bold">{formData?.addressLine1}</p>}
          {formData?.addressLine2 && <p className="font-bold">{formData?.addressLine2}</p>}
          {(formData?.city || formData?.state || formData?.pincode) && (
            <p className="font-bold">
              {[formData?.city, formData?.state, formData?.pincode].filter(Boolean).join(', ')}
            </p>
          )}
          {!formData?.addressLine1 && <p className="font-bold">[पता]</p>}
        </div>

        {/* Body */}
        <div className="mb-6">
          <p className="mb-2">
            आदरणीय {formData?.salutation || 'श्री/श्रीमती/सुश्री'}{' '}
            <span className="font-bold">{formData?.clientName || '[ग्राहक का नाम]'}</span>
          </p>
          <p className="mb-1 text-justify">
            {formData?.projectName} {projectLocation} में आपके नए निवेश पर{' '}
            {companyInfo?.company_name} की ओर से हार्दिक बधाई। यह एक उत्तम विकल्प है और आप उन कुछ
            भाग्यशाली लोगों में से एक हैं जिन्हें इतनी उचित दरों पर यूनिट मिली है।
          </p>
          <p className="mb-4 text-justify">
            हम {companyInfo?.company_name} में आपके महान निवेश का हिस्सा बनकर सौभाग्यशाली अनुभव करते
            हैं। हम आपको इस निवेश में सहायता करने का अवसर देने के लिए आपका धन्यवाद करते हैं। हम
            हार्दिक आशा करते हैं कि आप हमारी सेवाओं से संतुष्ट हैं और हमें अपने परिचितों में
            संदर्भित करेंगे।
          </p>

          <p className="mb-2 font-bold">आपका आवंटन निम्नानुसार है:</p>
          <p>
            टिकट आईडी : <span className="font-bold">{formData?.ticketId}</span>
          </p>
          <p>
            परियोजना का नाम : <span className="font-bold">{formData?.projectName}</span>
          </p>
          <p>
            यूनिट संख्या : <span className="font-bold">{formData?.unitNumber}</span>
          </p>

          <p className="mt-4 mb-2">
            यूनिट की कुल लागत और भुगतान योजना के बारे में संक्षिप्त विवरण निम्नानुसार है:
          </p>
        </div>

        {/* Details Table */}
        <div className="mb-6 overflow-hidden border border-gray-400">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#00b0f0] text-black">
                <th className="border border-gray-400 p-2 font-bold">ग्राहक का नाम</th>
                <th className="border border-gray-400 p-2 font-bold">आवंटित यूनिट</th>
                <th className="border border-gray-400 p-2 font-bold">क्षेत्रफल (वर्ग गज)</th>
                <th className="border border-gray-400 p-2 font-bold">भुगतान योजना</th>
                <th className="border border-gray-400 p-2 font-bold">बीएसपी (प्रति वर्ग गज)</th>
                <th className="border border-gray-400 p-2 font-bold">पीएलसी (%)</th>
                <th className="border border-gray-400 p-2 font-bold">कुल लागत</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-bold">{formData?.clientName}</td>
                <td className="border border-gray-400 p-2 font-bold">{formData?.unitNumber}</td>
                <td className="border border-gray-400 p-2 font-bold">{formData?.area}</td>
                <td className="border border-gray-400 p-2 font-bold">
                  {formData?.paymentPlan} माह
                </td>
                <td className="border border-gray-400 p-2 font-bold">
                  {`\u20b9${parseFloat(formData?.bsp || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </td>
                <td className="border border-gray-400 p-2 font-bold">{formData?.plc || ''}</td>
                <td className="border border-gray-400 p-2 font-bold">{fmtInr(totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <BbaPageFooter companyInfo={companyInfo} />
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
