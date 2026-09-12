import React from 'react';
import BbaLegalPagesHindi from '../../../../app/admin/bba/BbaLegalPagesHindi';
import { BbaPageFooterHindi } from '../bba/legal-hindi/BbaPageFooterHindi';
import { getProjectCoverLocation } from '@/src/lib/utils/projectLocations';
import { BBA_A4_PAGE_STYLE, BBA_A4_COVER_STYLE, BBA_A4_PAGE_CLASS } from '../bba/legal/bbaA4Styles';

export default function BbaPreviewContentHindi({ formData, companyInfo }: any) {
  const getProjectLocation = (projectName: string) => getProjectCoverLocation(projectName, 'hi');

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

  const fmtFormalDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="bba-preview-pages flex flex-col items-center gap-8 px-2 py-6 font-sans text-[15px] leading-relaxed text-black print:gap-0 print:bg-white print:p-0">
      {/* Cover Page */}
      <div data-pdf-page="true" className={BBA_A4_PAGE_CLASS} style={BBA_A4_COVER_STYLE}>
        {/* Executive Letterhead Header */}
        <div className="mb-4 flex items-start justify-between border-b-2 border-[#0f2942] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-5 w-1.5 rounded-full bg-amber-500"></span>
              <h1 className="text-xl font-black tracking-wide text-[#0f2942] uppercase">
                {companyInfo?.company_name || 'SVI INFRA SOLUTIONS PVT. LTD.'}
              </h1>
            </div>
            <p className="mt-1 text-[11.5px] leading-tight text-slate-600">
              Cell: {companyInfo?.company_phone} | Email: {companyInfo?.company_email} | Web:{' '}
              {companyInfo?.company_website}
            </p>
            <p className="text-[11.5px] leading-tight text-slate-600">
              Office: {companyInfo?.company_address}
            </p>
          </div>
          <div className="w-32 shrink-0">
            <img
              src="/logo.png"
              alt={companyInfo?.company_name || 'SVI Infra Solutions'}
              className="h-auto max-h-14 w-full object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        </div>

        {/* Date & To */}
        <div className="mb-4 text-[13px] leading-relaxed">
          <p className="mb-1 font-bold text-slate-800">
            दिनांक:{' '}
            <span className="font-semibold text-slate-900">
              {fmtFormalDate(formData?.bookingDate)}
            </span>
          </p>
          <p className="font-bold text-slate-700">सेवा में,</p>
          <p className="text-[14.5px] font-bold text-[#1e3a8a]">
            {formData?.clientName || '[ग्राहक का नाम]'}
          </p>
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
        <div className="mb-4 text-[13px] leading-relaxed">
          <p className="mb-2">
            आदरणीय {formData?.salutation || 'श्री/श्रीमती/सुश्री'}{' '}
            <span className="font-bold text-black">
              {formData?.clientName || '[ग्राहक का नाम]'}
            </span>
            ,
          </p>
          <p className="mb-2 text-justify">
            {formData?.projectName} {projectLocation} में आपके नए निवेश एवं भूखंड आवंटन पर{' '}
            <strong>{companyInfo?.company_name || 'SVI Infra Solutions Pvt. Ltd.'}</strong> परिवार
            की ओर से हार्दिक बधाई। हम आपके इस निवेश का हिस्सा बनकर अत्यंत गौरवान्वित एवं सौभाग्यशाली
            अनुभव करते हैं तथा हमारे साथ जुड़ने के लिए आपका सहृदय धन्यवाद करते हैं।
          </p>
          <p className="mb-2 text-justify">
            यह पत्र आपकी पसंदीदा आवासीय इकाई के अनंतिम आवंटन की पुष्टि करता है। हमारी प्रतिबद्धता
            आपको पारदर्शी, सुरक्षित एवं गुणवत्तापूर्ण विकास प्रदान करने की है। आपके आवंटित भूखंड एवं
            लागत योजना का विवरण निम्नानुसार है:
          </p>

          {/* Allotment Summary Card (2x3 Grid with Executive Accent) */}
          <div className="mt-3 mb-4 rounded-xl border border-l-4 border-slate-200 border-l-[#0f2942] bg-slate-50/90 p-3.5 shadow-xs">
            <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-[12px] font-bold tracking-wider text-[#0f2942] uppercase">
                आवंटन विवरण संक्षेप (Allotment Summary)
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-900">
                पुष्टीकृत आवंटन / CONFIRMED
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px] leading-normal">
              <div>
                <span className="text-slate-500">टिकट / संदर्भ सं.:</span>{' '}
                <strong className="font-semibold text-slate-900">
                  {formData?.ticketId || '—'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">परियोजना का नाम:</span>{' '}
                <strong className="font-semibold text-slate-900">
                  {formData?.projectName || '—'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">आवंटित यूनिट सं.:</span>{' '}
                <strong className="font-bold whitespace-nowrap text-[#0f2942]">
                  {formData?.unitNumber || '—'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">भूखंड क्षेत्रफल:</span>{' '}
                <strong className="font-bold whitespace-nowrap text-slate-900">
                  {formData?.area ? `${formData.area} वर्ग गज` : '—'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">आवंटन / बुकिंग तिथि:</span>{' '}
                <strong className="font-semibold text-slate-900">
                  {fmtFormalDate(formData?.bookingDate)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">चयनित भुगतान योजना:</span>{' '}
                <strong className="font-semibold text-slate-900">
                  {formData?.paymentPlan ? `${formData.paymentPlan} माह किश्त योजना` : '—'}
                </strong>
              </div>
            </div>
          </div>
          <p className="mt-3 mb-2 text-[12px] font-bold tracking-wide text-slate-700 uppercase">
            लागत एवं भुगतान योजना विवरण:
          </p>
        </div>

        {/* Details Table with Executive Navy Header */}
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-300 text-[11.5px] shadow-xs">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#0f2942] text-white">
                <th className="border border-[#1b3d60] px-3 py-2 text-[10.5px] font-bold tracking-wider uppercase">
                  ग्राहक का नाम
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-[10.5px] font-bold tracking-wider uppercase">
                  आवंटित यूनिट
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-[10.5px] font-bold tracking-wider uppercase">
                  क्षेत्रफल (वर्ग गज)
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-[10.5px] font-bold tracking-wider uppercase">
                  भुगतान योजना
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-right text-[10.5px] font-bold tracking-wider uppercase">
                  बीएसपी (प्रति वर्ग गज)
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-right text-[10.5px] font-bold tracking-wider uppercase">
                  पीएलसी (%)
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-right text-[10.5px] font-bold tracking-wider uppercase">
                  कुल लागत
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-white hover:bg-slate-50">
                <td className="border border-slate-200 px-3 py-2.5 font-semibold text-slate-900">
                  {formData?.clientName}
                </td>
                <td className="border border-slate-200 px-3 py-2.5 font-bold text-[#0f2942]">
                  {formData?.unitNumber}
                </td>
                <td className="border border-slate-200 px-3 py-2.5 font-semibold text-slate-800">
                  {formData?.area}
                </td>
                <td className="border border-slate-200 px-3 py-2.5 font-semibold text-slate-800">
                  {formData?.paymentPlan} माह
                </td>
                <td className="border border-slate-200 px-3 py-2.5 text-right font-bold text-slate-900">
                  {`\u20b9${parseFloat(formData?.bsp || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </td>
                <td className="border border-slate-200 px-3 py-2.5 text-right font-bold text-slate-900">
                  {formData?.plc ? `${formData.plc}%` : '0%'}
                </td>
                <td className="border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-right text-[12px] font-bold text-[#0f2942]">
                  {fmtInr(totalCost)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Important Instructions Box (4 Points) */}
        <div className="mb-4 rounded-xl border border-l-4 border-slate-200 border-l-amber-500 bg-slate-50/90 p-3.5 text-[11.5px] leading-relaxed">
          <p className="mb-1.5 text-[11.5px] font-bold tracking-wider text-[#0f2942] uppercase">
            महत्वपूर्ण निर्देश एवं आवंटन शर्तें:
          </p>
          <ul className="list-disc space-y-1 pl-4 text-slate-700">
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

        {/* Dual Signatures Section */}
        <div className="mt-3 mb-4 flex items-end justify-between border-t border-gray-300 pt-3 pb-2 text-[12px] select-none">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-700">
              आवंटी के हस्ताक्षर (Allottee Signature):
            </span>
            <span className="mt-8 w-44 border-b border-dashed border-gray-500"></span>
            <span className="mt-1 text-[11px] font-medium text-gray-600">
              {formData?.clientName || 'Allottee'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-right text-[11.5px] font-bold tracking-wide text-[#0f2942]">
              {companyInfo?.company_name || 'SVI INFRA SOLUTIONS PVT LTD'}
            </span>
            <div className="my-1.5 h-9 w-28">
              <img
                src="/signature.png"
                alt="Director Signature"
                className="h-full w-full object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
            <span className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
              अधिकृत हस्ताक्षरकर्ता / Authorized Signatory
            </span>
          </div>
        </div>

        {/* Customer Helpdesk Grounding Banner & Footer (Bottom of Page) */}
        <div className="mt-auto pt-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-center text-[11.5px] text-slate-600">
            <span className="font-semibold text-[#0f2942]">ग्राहक सहायता डेस्क: </span>
            <span>
              {companyInfo?.company_email} | फोन: {companyInfo?.company_phone}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 select-none">
            <span className="font-mono text-[9.5px] tracking-wider">DOC: SVI-BBA-ALLOTMENT-HI</span>
            <span className="rounded-full bg-slate-100 px-3 py-0.5 font-semibold text-slate-600">
              Page 1 of 16
            </span>
            <span className="font-mono text-[9.5px] tracking-wider">OFFICIAL COPY</span>
          </div>
        </div>
      </div>
      {/* Legal Pages (2-14) */}
      <BbaLegalPagesHindi formData={formData} companyInfo={companyInfo} totalCost={totalCost} />

      {/* Payment Schedule Table (Page 15 of 16) */}
      <div data-pdf-page="true" className={BBA_A4_PAGE_CLASS} style={BBA_A4_PAGE_STYLE}>
        <h3 className="mb-2 text-lg font-bold text-gray-800">भुगतान अनुसूची</h3>
        <div className="mb-6 overflow-hidden border border-gray-400">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#0f2942] text-white">
                <th className="border border-[#1b3d60] p-2 text-[10px] font-bold tracking-wider uppercase">
                  क्र.सं.
                </th>
                <th className="border border-[#1b3d60] p-2 text-[10px] font-bold tracking-wider uppercase">
                  तारीख
                </th>
                <th className="border border-[#1b3d60] p-2 text-[10px] font-bold tracking-wider uppercase">
                  विवरण
                </th>
                <th className="border border-[#1b3d60] p-2 text-right text-[10px] font-bold tracking-wider uppercase">
                  %
                </th>
                <th className="border border-[#1b3d60] p-2 text-right text-[10px] font-bold tracking-wider uppercase">
                  राशि
                </th>
                <th className="border border-[#1b3d60] p-2 text-[10px] font-bold tracking-wider uppercase">
                  भुगतान संदर्भ सं.
                </th>
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
                    ? `${i + 1} EMI (0% ब्याज)`
                    : edcInEmi
                      ? `${i + 1} EMI (ईडीसी सहित)`
                      : `${i + 1} EMI`;

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
        <BbaPageFooterHindi companyInfo={companyInfo} pageNumber={15} />
      </div>

      {/* Payment Terms & Bank Details Page (Page 16 of 16) */}
      <div data-pdf-page="true" className={BBA_A4_PAGE_CLASS} style={BBA_A4_PAGE_STYLE}>
        <h3 className="mb-4 text-lg font-bold text-gray-800">भुगतान नियम एवं विवरण</h3>
        {/* Terms Box */}
        <div className="mb-6 rounded-lg border-l-4 border-amber-500 bg-slate-50 p-4 text-[12px] leading-relaxed text-slate-700">
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
        <div className="mt-auto flex items-center justify-between border-t border-slate-300 pt-3 text-[10.5px] text-slate-400 select-none">
          <span className="font-mono text-[9px] tracking-wider">DOC: SVI-BBA-ANNEXURE-A-HI</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-600">
            Page 16 of 16
          </span>
          <span className="font-mono text-[9px] tracking-wider">PAYMENT SCHEDULE</span>
        </div>
      </div>
    </div>
  );
}
