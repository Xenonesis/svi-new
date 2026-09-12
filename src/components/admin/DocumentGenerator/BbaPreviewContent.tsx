import React from 'react';
import BbaLegalPages from '../../../../app/admin/bba/BbaLegalPages';
import { BbaPageFooter } from '../bba/legal/BbaPageFooter';
import { getProjectCoverLocation } from '@/src/lib/utils/projectLocations';
import { BBA_A4_PAGE_STYLE, BBA_A4_COVER_STYLE, BBA_A4_PAGE_CLASS } from '../bba/legal/bbaA4Styles';

function BbaPreviewContent({ formData, companyInfo }: any) {
  const getProjectLocation = (projectName: string) => getProjectCoverLocation(projectName, 'en');

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
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const toTitleCase = (str?: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const cleanSalutation = (s?: string) => {
    if (!s) return 'Mr.';
    const trimmed = s.trim();
    if (['mr', 'mrs', 'ms', 'dr'].includes(trimmed.toLowerCase())) {
      return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
    }
    return trimmed;
  };

  return (
    <div className="bba-preview-pages flex flex-col items-center gap-8 px-2 py-6 font-sans text-[14.5px] leading-relaxed text-black print:gap-0 print:bg-white print:p-0">
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
            Dated:{' '}
            <span className="font-semibold text-slate-900">
              {fmtFormalDate(formData?.bookingDate)}
            </span>
          </p>
          <p className="font-bold text-slate-700">To,</p>
          <p className="text-[14.5px] font-bold text-[#1e3a8a]">
            {formData?.clientName || '[Client Name]'}
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
          {!formData?.addressLine1 && <p className="font-medium text-gray-800">[Address]</p>}
        </div>

        {/* Body */}
        <div className="mb-4 text-[13px] leading-relaxed">
          <p className="mb-2">
            Dear {cleanSalutation(formData?.salutation)}{' '}
            <span className="font-bold text-black">
              {toTitleCase(formData?.clientName) || '[Client Name]'}
            </span>
            ,
          </p>
          <p className="mb-2 text-justify">
            Congratulations from{' '}
            <strong>{companyInfo?.company_name || 'SVI Infra Solutions Pvt. Ltd.'}</strong> on the
            provisional allotment of your residential plot in {formData?.projectName}{' '}
            {projectLocation}. We feel privileged to partner with you in your property investment
            journey and sincerely thank you for placing your trust in us.
          </p>
          <p className="mb-2 text-justify">
            This letter confirms the provisional allotment of your selected unit in accordance with
            your application. Our team is committed to delivering high development standards,
            statutory transparency, and timely possession. Summary of your allotted unit and cost
            schedule is detailed below:
          </p>

          {/* Allotment Summary Card (2x3 Grid with Executive Accent) */}
          <div className="mt-3 mb-4 rounded-xl border border-l-4 border-slate-200 border-l-[#0f2942] bg-slate-50/90 p-3.5 shadow-xs">
            <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-[12px] font-bold tracking-wider text-[#0f2942] uppercase">
                Allotment Summary
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10.5px] font-bold text-amber-900">
                CONFIRMED ALLOTMENT
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px] leading-normal">
              <div>
                <span className="text-slate-500">Ticket / Ref ID:</span>{' '}
                <strong className="font-semibold text-slate-900">
                  {formData?.ticketId || '—'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Project Name:</span>{' '}
                <strong className="font-semibold text-slate-900">
                  {formData?.projectName || '—'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Unit No.:</span>{' '}
                <strong className="font-bold whitespace-nowrap text-[#0f2942]">
                  {formData?.unitNumber || '—'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Plot Area:</span>{' '}
                <strong className="font-bold whitespace-nowrap text-slate-900">
                  {formData?.area ? `${formData.area} Sq. Yds.` : '—'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Allotment Date:</span>{' '}
                <strong className="font-semibold text-slate-900">
                  {fmtFormalDate(formData?.bookingDate)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Payment Plan:</span>{' '}
                <strong className="font-semibold text-slate-900">
                  {formData?.paymentPlan ? `${formData.paymentPlan} Months Installment Plan` : '—'}
                </strong>
              </div>
            </div>
          </div>
          <p className="mt-3 mb-2 text-[12px] font-bold tracking-wide text-slate-700 uppercase">
            Cost &amp; Payment Plan Summary:
          </p>
        </div>

        {/* Executive Table with Deep Navy & Clean Borders */}
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-300 text-[11.5px] shadow-xs">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#0f2942] text-white">
                <th className="border border-[#1b3d60] px-3 py-2 text-[10.5px] font-bold tracking-wider uppercase">
                  Client Name
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-[10.5px] font-bold tracking-wider uppercase">
                  Allotted Unit
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-[10.5px] font-bold tracking-wider uppercase">
                  Area (Sq. Yds.)
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-[10.5px] font-bold tracking-wider uppercase">
                  Payment Plan
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-right text-[10.5px] font-bold tracking-wider uppercase">
                  BSP (Per Sq. Yd.)
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-right text-[10.5px] font-bold tracking-wider uppercase">
                  PLC (%)
                </th>
                <th className="border border-[#1b3d60] px-3 py-2 text-right text-[10.5px] font-bold tracking-wider uppercase">
                  Total Cost
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
                  {formData?.paymentPlan} Months
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

        {/* Important Notes & Instructions Box (4 Points) */}
        <div className="mb-4 rounded-xl border border-l-4 border-slate-200 border-l-amber-500 bg-slate-50/90 p-3.5 text-[11.5px] leading-relaxed">
          <p className="mb-1.5 text-[11.5px] font-bold tracking-wider text-[#0f2942] uppercase">
            Important Instructions &amp; Allotment Terms:
          </p>
          <ul className="list-disc space-y-1 pl-4 text-slate-700">
            <li>
              This provisional allotment is subject to all terms and conditions stipulated in the
              Builder-Buyer Agreement (BBA).
            </li>
            <li>
              Timely payment of installments as per the agreed schedule of payments (Annexure-A) is
              the essence of this contract.
            </li>
            <li>
              Please retain one copy of this Agreement and return the second copy duly signed within
              7 working days.
            </li>
            <li>
              Stamp duty, registration charges, electricity/water meter connections, and maintenance
              charges shall be payable extra at registry.
            </li>
          </ul>
        </div>

        {/* Dual Signatures Section */}
        <div className="mt-3 mb-4 flex items-end justify-between border-t border-gray-300 pt-3 pb-2 text-[12px] select-none">
          <div className="flex flex-col">
            <span className="font-semibold text-gray-700">Allottee Signature(s):</span>
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
              Authorized Signatory / Director
            </span>
          </div>
        </div>

        {/* Customer Helpdesk Grounding Banner & Footer (Bottom of Page) */}
        <div className="mt-auto pt-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-center text-[11.5px] text-slate-600">
            <span className="font-semibold text-[#0f2942]">Customer Support Helpdesk: </span>
            <span>
              {companyInfo?.company_email} | Helpline: {companyInfo?.company_phone}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 select-none">
            <span />
            <span className="rounded-full bg-slate-100 px-3 py-0.5 font-semibold text-slate-600">
              Page 1 of 16
            </span>
            <span className="font-mono text-[9.5px] tracking-wider">OFFICIAL COPY</span>
          </div>
        </div>
      </div>
      {/* Legal Pages (2-14) */}
      <BbaLegalPages formData={formData} companyInfo={companyInfo} totalCost={totalCost} />

      {/* Payment Schedule Table (Page 15 of 16) */}
      <div data-pdf-page="true" className={BBA_A4_PAGE_CLASS} style={BBA_A4_PAGE_STYLE}>
        <h3 className="mb-2 text-lg font-bold text-gray-800">Payment Schedule</h3>
        <div className="mb-6 overflow-hidden border border-gray-400">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#0f2942] text-white">
                <th className="border border-[#1b3d60] p-2 text-[10px] font-bold tracking-wider uppercase">
                  SNO
                </th>
                <th className="border border-[#1b3d60] p-2 text-[10px] font-bold tracking-wider uppercase">
                  Date
                </th>
                <th className="border border-[#1b3d60] p-2 text-[10px] font-bold tracking-wider uppercase">
                  Particulars
                </th>
                <th className="border border-[#1b3d60] p-2 text-right text-[10px] font-bold tracking-wider uppercase">
                  %
                </th>
                <th className="border border-[#1b3d60] p-2 text-right text-[10px] font-bold tracking-wider uppercase">
                  Amount
                </th>
                <th className="border border-[#1b3d60] p-2 text-[10px] font-bold tracking-wider uppercase">
                  Payment Ref. No.
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
                    <td className="border border-gray-400 p-2 font-bold">On Booking</td>
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
                        Within {secondPaymentDays} days
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
                    ? `${i + 1} Installment (0% Interest)`
                    : edcInEmi
                      ? `${i + 1} Installment (incl. EDC)`
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
        <BbaPageFooter companyInfo={companyInfo} pageNumber={15} />
      </div>

      {/* Payment Terms & Bank Details Page (Page 16 of 16) */}
      <div data-pdf-page="true" className={BBA_A4_PAGE_CLASS} style={BBA_A4_PAGE_STYLE}>
        <h3 className="mb-4 text-lg font-bold text-gray-800">Payment Terms & Details</h3>
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
                  Please transfer the initial amount of {bookingPercent}% (Rs.{' '}
                  {initialPayment.toFixed(2)}) within the first 3 days (by{' '}
                  {(() => {
                    if (!formData?.bookingDate) return '[Date]';
                    const d = new Date(formData.bookingDate);
                    d.setDate(d.getDate() + 3);
                    return d.toISOString().split('T')[0];
                  })()}
                  ) to confirm allotment under {formData?.projectName || 'the project'}.
                </p>
                {String(formData?.showSecondInstalment) === 'true' && (
                  <p className="mb-2">
                    The second instalment of 20% (Rs.{' '}
                    {((edcInEmi ? baseCost : totalCost) * 0.2).toFixed(2)}) must be paid within{' '}
                    {formData?.secondPaymentDays || '15'} days (by{' '}
                    {(() => {
                      if (!formData?.bookingDate) return '[Date]';
                      const d = new Date(formData.bookingDate);
                      d.setDate(d.getDate() + parseInt(formData?.secondPaymentDays || '15'));
                      return d.toISOString().split('T')[0];
                    })()}
                    ).
                  </p>
                )}
                <p className="mb-2">
                  Note: Allotment under {formData?.projectName || 'the project'} will only be
                  confirmed upon receipt of the initial {bookingPercent}% (Rs.{' '}
                  {initialPayment.toFixed(2)}) by the due date.
                </p>
                <p>
                  In the event you fail to make the payments as per the payment plan chosen by you,
                  the allotment of these plots will be automatically cancelled.
                </p>
              </>
            );
          })()}
        </div>

        {/* Footer details */}
        <div className="mt-auto flex items-end justify-between pb-8">
          <div>
            <p className="mb-2 font-bold">
              Payment can be transferred online using the following details:
            </p>
            <p>
              <span className="font-bold">Account Name:</span>{' '}
              {companyInfo?.bank_account_name || 'Svi Infra Solutions Pvt. Ltd'}
            </p>
            <p>
              <span className="font-bold">Account Number:</span>{' '}
              {companyInfo?.bank_account_no || '0894102000013837'}
            </p>
            <p>
              <span className="font-bold">Bank:</span> {companyInfo?.bank_name || 'IDBI BANK'}
            </p>
            <p>
              <span className="font-bold">IFSC CODE:</span>{' '}
              {companyInfo?.bank_ifsc || 'IBKL0000894'}
            </p>
            <p className="mt-4">
              Your account manager is <span className="font-bold">{formData?.advisorName}</span> and
              will be reachable on <span className="font-bold">{formData?.advisorNumber}</span>
              {formData?.advisorEmail ? (
                <>
                  {' '}
                  (Email: <span className="font-bold">{formData?.advisorEmail}</span>)
                </>
              ) : (
                ''
              )}{' '}
              for any queries.
            </p>
          </div>
          <div className="flex flex-col items-end text-right">
            <p className="mb-2">With Best Regards</p>
            <p className="mb-1">For {companyInfo?.company_name}</p>
            <div className="my-1 h-8 w-24">
              <img
                src="/signature.png"
                alt="Director Signature"
                className="ml-auto h-full w-full object-contain"
              />
            </div>
            <div className="w-48 border-t border-black pt-2 text-center">
              <p>Director</p>
            </div>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-300 pt-3 text-[10.5px] text-slate-400 select-none">
          <span />
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-600">
            Page 16 of 16
          </span>
          <span className="font-mono text-[9px] tracking-wider">PAYMENT SCHEDULE</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(BbaPreviewContent);
