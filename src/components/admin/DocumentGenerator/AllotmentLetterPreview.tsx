import React from 'react';
import { getProjectCoverLocation } from '@/src/lib/utils/projectLocations';

export const DEFAULT_CORPORATE_ADDRESS =
  'Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309';

export interface AllotmentLetterFormData {
  clientName?: string;
  address?: string;
  mobileNo?: string;
  salutation?: string;
  projectName?: string;
  plotNo?: string;
  area?: string | number;
  bsp?: string | number;
  plc?: string | number;
  edc?: string | number;
  edcInEmi?: string | boolean;
  bookingPaymentPercent?: string | number;
  bookingPaymentAmount?: string | number;
  initialPayment?: string | number;
  bookingAmount?: string | number;
  showSecondInstalment?: string | boolean;
  zeroPercentEmi?: string | boolean;
  emiCount?: string | number;
  planType?: string;
  paymentPlan?: string;
  bookingDate?: string;
  remainingDueDate?: string;
  emiStartDate?: string;
  chequeNo?: string;
  bankName?: string;
  transactionId?: string;
  paymentMode?: string;

  // Additional fields for complete system compatibility
  ticketId?: string;
  unitNumber?: string;
  nomineeName?: string;
  clientPhone?: string;
  clientEmail?: string;
  fatherName?: string;
  aadharNumber?: string;
  panNumber?: string;
  secondPaymentDays?: string | number;
  emiPercentage?: string | number;
  remainingPaymentLabel?: string;
  specialClause?: string;
  customTermsText?: string;
  onBookingPaymentRef?: string;
  within15DaysPaymentRef?: string;
  advisorName?: string;
  advisorNumber?: string;
  advisorEmail?: string;
  chequeNumber?: string;
  chequeDate?: string;
  chequeBank?: string;
  chequeBranch?: string;
  chequeDrawer?: string;
}

export interface CompanyInfo {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_website: string;
  bank_account_name?: string;
  bank_account_no?: string;
  bank_name?: string;
  bank_ifsc?: string;
}

export interface AllotmentLetterPreviewProps {
  formData: AllotmentLetterFormData;
  companyInfo: CompanyInfo;
  id?: string;
  className?: string;
}

const parseDate = (dateStr?: string): Date => {
  if (!dateStr) return new Date();
  if (dateStr.includes('T')) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    if (parts[2].length === 4) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
};

const formatDate = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export function AllotmentLetterPreview({
  formData,
  companyInfo,
  id,
  className,
}: AllotmentLetterPreviewProps) {
  const projectLocation = formData?.projectName
    ? getProjectCoverLocation(formData.projectName, 'en')
    : '';

  const calculateTotalCost = () => {
    const area =
      typeof formData.area === 'number'
        ? formData.area
        : parseFloat(String(formData.area || '0')) || 0;
    const bsp =
      typeof formData.bsp === 'number'
        ? formData.bsp
        : parseFloat(String(formData.bsp || '0')) || 0;
    const plc =
      typeof formData.plc === 'number'
        ? formData.plc
        : parseFloat(String(formData.plc || '0')) || 0;
    const edc =
      typeof formData.edc === 'number'
        ? formData.edc
        : parseFloat(String(formData.edc || '0')) || 0;
    const base = area * bsp;
    const plcAmount = base * (plc / 100);
    return base + plcAmount + edc;
  };

  const totalCost = calculateTotalCost();
  const edcAmount =
    typeof formData.edc === 'number' ? formData.edc : parseFloat(String(formData.edc || '0')) || 0;
  const edcInEmi =
    typeof formData.edcInEmi === 'boolean'
      ? formData.edcInEmi
      : String(formData.edcInEmi).toLowerCase() === 'true';
  const baseCost = totalCost - edcAmount;
  const bookingPercent =
    typeof formData.bookingPaymentPercent === 'number'
      ? formData.bookingPaymentPercent
      : parseFloat(String(formData.bookingPaymentPercent || '10')) || 10;
  const bookingPaymentExplicit =
    formData.bookingPaymentAmount || formData.initialPayment || formData.bookingAmount;
  const initialPayment = bookingPaymentExplicit
    ? typeof bookingPaymentExplicit === 'number'
      ? bookingPaymentExplicit
      : parseFloat(String(bookingPaymentExplicit)) || 0
    : (edcInEmi ? baseCost : totalCost) * (bookingPercent / 100);
  const secondPercent = 20;
  const secondPayment = (edcInEmi ? baseCost : totalCost) * (secondPercent / 100);
  const showSecondInstalment =
    typeof formData.showSecondInstalment === 'boolean'
      ? formData.showSecondInstalment
      : String(formData.showSecondInstalment).toLowerCase() === 'true';
  const zeroCost =
    typeof formData.zeroPercentEmi === 'boolean'
      ? formData.zeroPercentEmi
      : String(formData.zeroPercentEmi).toLowerCase() === 'true';
  const remainingPercent = showSecondInstalment
    ? 100 - bookingPercent - secondPercent
    : 100 - bookingPercent;
  const rawEmiCount = formData.emiCount === 'custom' ? formData.paymentPlan : formData.emiCount;
  const emiCount =
    typeof rawEmiCount === 'number'
      ? rawEmiCount
      : parseInt(String(rawEmiCount || formData.paymentPlan || '12'), 10) || 1;
  const isOneTime =
    formData.planType === 'one_time' ||
    String(formData.paymentPlan || '')
      .toLowerCase()
      .includes('one-time') ||
    formData.paymentPlan === '1';
  const remainingPercentInTerms = Number(remainingPercent.toFixed(2));
  const bookingPercentFormatted = Number(bookingPercent.toFixed(2));
  const remainingDueDateFormatted = formData.remainingDueDate
    ? formatDate(parseDate(formData.remainingDueDate))
    : formData.emiStartDate
      ? formatDate(parseDate(formData.emiStartDate))
      : '-';

  const secondPaymentDays =
    typeof formData.secondPaymentDays === 'number'
      ? formData.secondPaymentDays
      : parseInt(String(formData.secondPaymentDays || '15'), 10) || 15;

  const officeAddress = companyInfo.company_address?.trim() || DEFAULT_CORPORATE_ADDRESS;
  const allottedUnitDisplay = formData.plotNo || formData.unitNumber || '-';
  const clientPhoneDisplay = formData.mobileNo || formData.clientPhone || '';

  const defaultContainerClass =
    'relative min-h-[297mm] w-full max-w-[210mm] mx-auto bg-white shadow-2xl p-[18mm] sm:p-[20mm] text-[13px] leading-relaxed text-slate-900 print:shadow-none print:m-0 print:p-[15mm]';

  return (
    <div id={id} className={className || defaultContainerClass} style={{ boxSizing: 'border-box' }}>
      {/* Security Background Watermark */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none">
        <img
          src="/logo.png"
          alt="Watermark"
          className="w-[80%] max-w-2xl object-contain opacity-[0.04] grayscale"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between border-b-2 border-[#1e3a8a] pb-4">
          <div>
            <h1 className="mb-2 text-2xl font-bold tracking-wide text-[#1e3a8a] uppercase">
              {companyInfo.company_name || 'SVI INFRA SOLUTIONS PVT. LTD.'}
            </h1>
            <p className="text-gray-700">
              Cell: {companyInfo.company_phone || '+91 99999 99999'} | Email:{' '}
              {companyInfo.company_email || 'info@sviinfrasolutions.com'}
            </p>
            <p className="text-gray-700">
              Website: {companyInfo.company_website || 'www.sviinfrasolutions.com'}
            </p>
            <p className="text-gray-700">Office Address : {officeAddress}</p>
          </div>
          <div className="w-48 flex-shrink-0">
            <img
              src="/logo.png"
              alt={companyInfo.company_name || 'Company Logo'}
              className="h-auto w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Date & To */}
        <div className="mb-6">
          <p className="mb-4 font-bold">
            Dated:{' '}
            {formData.bookingDate
              ? formatDate(parseDate(formData.bookingDate))
              : formatDate(new Date())}
          </p>
          <p className="font-bold">To,</p>
          <p className="font-bold">{formData.clientName || '[Client Name]'}</p>
          <p className="font-bold whitespace-pre-wrap">{formData.address || '[Address]'}</p>
          {clientPhoneDisplay && (
            <p className="font-bold text-gray-800">Mobile: {clientPhoneDisplay}</p>
          )}
        </div>

        {/* Body */}
        <div className="mb-6">
          <p className="mb-2">
            Dear {formData.salutation || 'Sir / Madam'}{' '}
            <span className="font-bold">{formData.clientName || '[Client Name]'}</span>
          </p>
          <p className="mb-1 text-justify">
            Congratulations from {companyInfo.company_name || 'SVI Infra Solutions Pvt. Ltd.'} on
            your new investment in {formData.projectName || '[Project Name]'} {projectLocation}. It
            is a perfect choice and you are one of the few lucky ones to get unit at such reasonable
            rates.
          </p>
          <p className="mb-4 text-justify">
            We at {companyInfo.company_name || 'SVI Infra Solutions Pvt. Ltd.'} feel privileged to
            be part of your great investment. We thank you for giving us an opportunity to assist
            you in making this very investment. We sincerely hope that you are satisfied with our
            services and will refer us in your circle.
          </p>

          <p className="mb-2 font-bold">Your Allotment is as Follows:</p>
          <p>
            Ticket Id : <span className="font-bold">{formData.ticketId || '-'}</span>
          </p>
          <p>
            Project Name : <span className="font-bold">{formData.projectName || '-'}</span>
          </p>
          <p>
            Unit Number : <span className="font-bold">{allottedUnitDisplay}</span>
          </p>
          {formData.nomineeName && (
            <p>
              Nominee Name : <span className="font-bold">{formData.nomineeName}</span>
            </p>
          )}

          <p className="mt-4 mb-2">
            Brief details about the total cost of the unit and payment plan are as follows:
          </p>
        </div>

        {/* Details Table */}
        <div className="mb-6 overflow-hidden border border-gray-400">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="break-inside-avoid bg-[#00b0f0] text-xs text-black">
                <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                  Client Name
                </th>
                <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                  Allotted Unit
                </th>
                <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                  Area (Sq. Yds.)
                </th>
                <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                  Payment Plan
                </th>
                <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                  BSP (PSq.Yd)
                </th>
                <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                  PLC (in %)
                </th>
                <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">EDC (₹)</th>
                <th className="border border-gray-400 p-2 font-bold whitespace-nowrap">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr className="break-inside-avoid">
                <td className="border border-gray-400 p-2 font-bold">
                  {formData.clientName || '-'}
                </td>
                <td className="border border-gray-400 p-2 font-bold">{allottedUnitDisplay}</td>
                <td className="border border-gray-400 p-2 font-bold">{formData.area ?? '-'}</td>
                <td className="border border-gray-400 p-2 font-bold">
                  {isOneTime
                    ? 'One-Time Payment Plan'
                    : formData.paymentPlan
                      ? String(formData.paymentPlan).toLowerCase().includes('plan') ||
                        isNaN(Number(formData.paymentPlan))
                        ? formData.paymentPlan
                        : `${formData.paymentPlan} Months`
                      : '12 Months'}
                </td>
                <td className="border border-gray-400 p-2 font-bold">{formData.bsp ?? '-'}</td>
                <td className="border border-gray-400 p-2 font-bold">{formData.plc ?? '0'}</td>
                <td className="border border-gray-400 p-2 font-bold">
                  {formData.edc ? parseFloat(String(formData.edc)).toFixed(2) : '0.00'}
                </td>
                <td className="border border-gray-400 p-2 font-bold">{totalCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Schedule Table */}
        <h3 className="mb-2 text-lg font-bold text-gray-800">Payment Schedule</h3>
        <div className="mb-6 overflow-hidden border border-gray-400">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="break-inside-avoid bg-[#00b0f0] text-xs text-black">
                <th className="border border-gray-400 p-2 font-bold">SNO</th>
                <th className="border border-gray-400 p-2 font-bold">Date</th>
                <th className="border border-gray-400 p-2 font-bold">Particulars</th>
                <th className="border border-gray-400 p-2 font-bold">%</th>
                <th className="border border-gray-400 p-2 font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {/* First Instalment */}
              <tr className="break-inside-avoid">
                <td className="border border-gray-400 p-2 font-bold">1</td>
                <td className="border border-gray-400 p-2 font-bold">
                  {formData.bookingDate ? formatDate(parseDate(formData.bookingDate)) : '-'}
                </td>
                <td className="border border-gray-400 p-2 font-bold">
                  <div>{isOneTime ? 'Booking Advance' : 'On Booking (First 3 Days)'}</div>
                  {(formData.onBookingPaymentRef ||
                    formData.chequeNumber ||
                    formData.chequeNo ||
                    formData.transactionId) && (
                    <div className="mt-0.5 text-[10px] font-normal text-gray-600">
                      Ref:{' '}
                      {formData.chequeNo || formData.chequeNumber
                        ? `Cheque No. ${formData.chequeNo || formData.chequeNumber}${
                            formData.bankName || formData.chequeBank
                              ? ` (${formData.bankName || formData.chequeBank})`
                              : ''
                          }${formData.chequeDate ? ` dtd ${formData.chequeDate}` : ''} - Subject to realization`
                        : formData.transactionId
                          ? `Txn: ${formData.transactionId}${formData.paymentMode ? ` (${formData.paymentMode})` : ''}`
                          : formData.onBookingPaymentRef}
                    </div>
                  )}
                </td>
                <td className="border border-gray-400 p-2">{bookingPercentFormatted}%</td>
                <td className="border border-gray-400 p-2 font-bold">
                  Rs. {initialPayment.toFixed(2)}
                </td>
              </tr>
              {/* Second Instalment */}
              {!isOneTime && showSecondInstalment && (
                <tr className="break-inside-avoid">
                  <td className="border border-gray-400 p-2 font-bold">2</td>
                  <td className="border border-gray-400 p-2 font-bold">
                    {(() => {
                      if (!formData.bookingDate) return '-';
                      const d = parseDate(formData.bookingDate);
                      d.setDate(d.getDate() + secondPaymentDays);
                      return formatDate(d);
                    })()}
                  </td>
                  <td className="border border-gray-400 p-2 font-bold">
                    Second Instalment ({secondPaymentDays} Days)
                  </td>
                  <td className="border border-gray-400 p-2">{secondPercent}%</td>
                  <td className="border border-gray-400 p-2 font-bold">
                    Rs. {secondPayment.toFixed(2)}
                  </td>
                </tr>
              )}
              {/* Remaining Payment (One-Time Mode) OR EMIs (Installment Mode) */}
              {isOneTime ? (
                <tr className="break-inside-avoid">
                  <td className="border border-gray-400 p-2 font-bold">2</td>
                  <td className="border border-gray-400 p-2 font-bold">
                    {remainingDueDateFormatted}
                  </td>
                  <td className="border border-gray-400 p-2 font-bold">
                    {formData.remainingPaymentLabel || 'Remaining Payment'}
                  </td>
                  <td className="border border-gray-400 p-2">{remainingPercentInTerms}%</td>
                  <td className="border border-gray-400 p-2 font-bold">
                    Rs. {(totalCost - initialPayment).toFixed(2)}
                  </td>
                </tr>
              ) : (
                (() => {
                  const emiPercentPerInstallment = formData.emiPercentage
                    ? typeof formData.emiPercentage === 'number'
                      ? formData.emiPercentage
                      : parseFloat(String(formData.emiPercentage)) || remainingPercent / emiCount
                    : remainingPercent / emiCount;
                  const emiStartIndex = showSecondInstalment ? 3 : 2;

                  const totalEmiAmount = edcInEmi
                    ? (baseCost * remainingPercent) / 100 + edcAmount
                    : totalCost * (emiPercentPerInstallment / 100);
                  const emiAmount = edcInEmi
                    ? totalEmiAmount / emiCount
                    : totalCost * (emiPercentPerInstallment / 100);

                  return Array.from({ length: emiCount }).map((_, i) => {
                    let emiDate = '-';
                    if (formData.emiStartDate) {
                      const d = parseDate(formData.emiStartDate);
                      d.setMonth(d.getMonth() + i);
                      emiDate = formatDate(d);
                    } else if (formData.bookingDate) {
                      const d = parseDate(formData.bookingDate);
                      d.setMonth(d.getMonth() + i + 2);
                      emiDate = formatDate(d);
                    }

                    return (
                      <tr key={i} className="break-inside-avoid">
                        <td className="border border-gray-400 p-2 font-bold">
                          {i + emiStartIndex}
                        </td>
                        <td className="border border-gray-400 p-2 font-bold">{emiDate}</td>
                        <td className="border border-gray-400 p-2 font-bold">
                          {zeroCost
                            ? `${i + 1} Installment (0% Interest)`
                            : edcInEmi
                              ? `${i + 1} Installment (incl. EDC)`
                              : `${i + 1} EMI`}
                        </td>
                        <td className="border border-gray-400 p-2">
                          {emiPercentPerInstallment.toFixed(2)}%
                        </td>
                        <td className="border border-gray-400 p-2 font-bold">
                          Rs. {emiAmount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Terms Box */}
        <div className="mb-8 rounded-lg border-l-4 border-[#00b0f0] bg-[#f0f8ff] p-4 text-xs text-gray-800 italic">
          {formData.customTermsText ? (
            <div className="whitespace-pre-line text-gray-800 not-italic">
              {formData.customTermsText}
            </div>
          ) : isOneTime ? (
            <>
              <p className="mb-2">
                Please transfer the initial amount of {bookingPercentFormatted}% (Rs.{' '}
                {initialPayment.toFixed(2)}) to confirm provisional allotment under{' '}
                {formData.projectName || '[Project Name]'}.
              </p>
              <p className="mb-2">
                The remaining {remainingPercentInTerms}% (Rs.{' '}
                {(totalCost - initialPayment).toFixed(2)}) must be paid in full on or before{' '}
                {remainingDueDateFormatted} under the One-Time Payment Plan prior to execution of
                Registry / Agreement.
              </p>
              <p className="mb-2">
                Note: Allotment under {formData.projectName || '[Project Name]'} will only be
                confirmed upon receipt of the initial {bookingPercentFormatted}% (Rs.{' '}
                {initialPayment.toFixed(2)}) by the due date.
              </p>
              {formData.specialClause && (
                <p className="mb-2 font-semibold text-red-600 not-italic">
                  Special Condition: {formData.specialClause}
                </p>
              )}
              <p>
                In the event you fail to make the payments as per the payment plan chosen by you,
                the allotment of these plots will be automatically cancelled.
              </p>
            </>
          ) : (
            <>
              <p className="mb-2">
                Please transfer the initial amount of {bookingPercentFormatted}% (Rs.{' '}
                {initialPayment.toFixed(2)}) within the first 3 days (by{' '}
                {(() => {
                  if (!formData.bookingDate) return '[Date]';
                  const d = parseDate(formData.bookingDate);
                  d.setDate(d.getDate() + 3);
                  return formatDate(d);
                })()}
                ) to confirm allotment under {formData.projectName || '[Project Name]'}.
              </p>
              {showSecondInstalment && (
                <p className="mb-2">
                  The second instalment of {secondPercent}% (Rs. {secondPayment.toFixed(2)}) must be
                  paid within {secondPaymentDays} days (by{' '}
                  {(() => {
                    if (!formData.bookingDate) return '[Date]';
                    const d = parseDate(formData.bookingDate);
                    d.setDate(d.getDate() + secondPaymentDays);
                    return formatDate(d);
                  })()}
                  ).
                </p>
              )}
              <p className="mb-2">
                The remaining {remainingPercentInTerms}%
                {zeroCost && emiCount > 1 ? ' (0% Interest — equal instalments)' : ''}
                {edcInEmi && !zeroCost ? ' (incl. EDC)' : ''} will be paid as per the selected
                payment plan EMIs and is scheduled to complete accordingly.
              </p>
              <p className="mb-2">
                Note: Allotment under {formData.projectName || '[Project Name]'} will only be
                confirmed upon receipt of the initial {bookingPercentFormatted}% (Rs.{' '}
                {initialPayment.toFixed(2)}) by the due date.
              </p>
              {formData.specialClause && (
                <p className="mb-2 font-semibold text-red-600 not-italic">
                  Special Condition: {formData.specialClause}
                </p>
              )}
              <p>
                In the event you fail to make the payments as per the payment plan chosen by you,
                the allotment of these plots will be automatically cancelled.
              </p>
            </>
          )}
        </div>

        {/* Footer details & Signature Block */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 items-end gap-6 pb-6 md:grid-cols-2">
            <div>
              <p className="mb-2 font-bold text-gray-900">
                Payment can be transferred online using the following details:
              </p>
              <div className="space-y-0.5 text-xs text-gray-700">
                <p>
                  <span className="font-bold text-gray-900">Account Name:</span>{' '}
                  {companyInfo.bank_account_name || 'Svi Infra Solutions Pvt. Ltd'}
                </p>
                <p>
                  <span className="font-bold text-gray-900">Account Number:</span>{' '}
                  {companyInfo.bank_account_no || '0894102000013837'}
                </p>
                <p>
                  <span className="font-bold text-gray-900">Bank:</span>{' '}
                  {companyInfo.bank_name || 'IDBI BANK'}
                </p>
                <p>
                  <span className="font-bold text-gray-900">IFSC CODE:</span>{' '}
                  {companyInfo.bank_ifsc || 'IBKL0000894'}
                </p>
              </div>

              {(formData.advisorName || formData.advisorNumber) && (
                <p className="mt-4 text-xs text-gray-700">
                  Your account manager is{' '}
                  <span className="font-bold text-gray-900">{formData.advisorName || '-'}</span>
                  {formData.advisorNumber ? (
                    <>
                      {' '}
                      and will be reachable on{' '}
                      <span className="font-bold text-gray-900">{formData.advisorNumber}</span>
                    </>
                  ) : null}
                  {formData.advisorEmail ? (
                    <>
                      {' '}
                      (Email:{' '}
                      <span className="font-bold text-gray-900">{formData.advisorEmail}</span>)
                    </>
                  ) : null}{' '}
                  for any queries.
                </p>
              )}
            </div>

            {/* Signature & Seal Block */}
            <div className="flex flex-col items-end text-right">
              <p className="mb-1 text-xs font-bold tracking-wider text-gray-700 uppercase">
                For {companyInfo.company_name || 'SVI INFRA SOLUTIONS PVT. LTD.'}
              </p>
              <div className="my-2 flex items-center justify-end gap-4">
                {/* Official Stamp / Seal Space */}
                <div
                  data-testid="seal-space"
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-gray-400 p-1 text-center text-[9px] font-semibold tracking-wider text-gray-400 uppercase"
                >
                  Official Seal
                </div>
                {/* Signature image */}
                <img
                  src="/signature.png"
                  alt="Authorized Signatory"
                  className="h-16 w-auto max-w-[180px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-xs font-bold text-gray-900">Authorized Signatory</p>
              <p className="text-[11px] text-gray-500">Official Signatory & Seal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
