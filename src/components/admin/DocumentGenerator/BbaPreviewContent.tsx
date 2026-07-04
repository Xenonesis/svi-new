import React from 'react';
import BbaLegalPages from '../../../../app/admin/bba/BbaLegalPages';
import { BbaPageFooter } from '../bba/legal/BbaPageFooter';

export default function BbaPreviewContent({ formData, companyInfo }: any) {
  const isShyamAangan = formData?.projectName?.includes('Shyam Aangan');

  const calculateTotalCost = (data: any) => {
    const area = parseFloat(data?.area) || 0;
    const bsp = parseFloat(data?.bsp) || 0;
    const plc = parseFloat(data?.plc) || 0;
    const base = area * bsp;
    const plcAmount = base * (plc / 100);
    return base + plcAmount;
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
            Dated:{' '}
            {formData?.bookingDate ||
              new Date().toISOString().split('T')[0].split('-').reverse().join('-')}
          </p>
          <p className="font-bold">To,</p>
          <p className="font-bold">{formData?.clientName || '[Client Name]'}</p>
          {formData?.addressLine1 && <p className="font-bold">{formData?.addressLine1}</p>}
          {formData?.addressLine2 && <p className="font-bold">{formData?.addressLine2}</p>}
          {(formData?.city || formData?.state || formData?.pincode) && (
            <p className="font-bold">
              {[formData?.city, formData?.state, formData?.pincode].filter(Boolean).join(', ')}
            </p>
          )}
          {!formData?.addressLine1 && <p className="font-bold">[Address]</p>}
        </div>

        {/* Body */}
        <div className="mb-6">
          <p className="mb-2">
            Dear {formData?.salutation || 'Mr./Mrs./Ms.'}{' '}
            <span className="font-bold">{formData?.clientName || '[Client Name]'}</span>
          </p>
          <p className="mb-1 text-justify">
            Congratulations from {companyInfo?.company_name} on your new investment in{' '}
            {formData?.projectName} (Kishan Garh Renwal, Jaipur, Rajasthan). It is a perfect choice
            and you are one of the few lucky ones to get unit at such reasonable rates.
          </p>
          <p className="mb-4 text-justify">
            We at {companyInfo?.company_name} feel privileged to be part of your great investment.
            We thank you for giving us an opportunity to assist you in making this very investment.
            We sincerely hope that you are satisfied with our services and will refer us in your
            circle.
          </p>

          <p className="mb-2 font-bold">Your Allotment is as Follows:</p>
          <p>
            Ticket Id : <span className="font-bold">{formData?.ticketId}</span>
          </p>
          <p>
            Project Name : <span className="font-bold">{formData?.projectName}</span>
          </p>
          <p>
            Unit Number : <span className="font-bold">{formData?.unitNumber}</span>
          </p>

          <p className="mt-4 mb-2">
            Brief details about the total cost of the unit and payment plan are as follows:
          </p>
        </div>

        {/* Details Table */}
        <div className="mb-6 overflow-hidden border border-gray-400">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#00b0f0] text-black">
                <th className="border border-gray-400 p-2 font-bold">Client Name</th>
                <th className="border border-gray-400 p-2 font-bold">Alloted Unit</th>
                <th className="border border-gray-400 p-2 font-bold">Area (Sq-Yds.)</th>
                <th className="border border-gray-400 p-2 font-bold">Payment Plan</th>
                <th className="border border-gray-400 p-2 font-bold">BSP(PSq.Yd)</th>
                <th className="border border-gray-400 p-2 font-bold">PLC(in%)</th>
                <th className="border border-gray-400 p-2 font-bold">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-bold">{formData?.clientName}</td>
                <td className="border border-gray-400 p-2 font-bold">{formData?.unitNumber}</td>
                <td className="border border-gray-400 p-2 font-bold">{formData?.area}</td>
                <td className="border border-gray-400 p-2 font-bold">
                  {formData?.paymentPlan} Months
                </td>
                <td className="border border-gray-400 p-2 font-bold">
                  {isShyamAangan
                    ? `\u20b9${parseFloat(formData?.bsp || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : formData?.bsp}
                </td>
                <td className="border border-gray-400 p-2 font-bold">{formData?.plc || ''}</td>
                <td className="border border-gray-400 p-2 font-bold">
                  {isShyamAangan ? fmtInr(totalCost) : totalCost.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <BbaPageFooter companyInfo={companyInfo} />
      </div>
      {/* Legal Pages (2-17) */}
      <BbaLegalPages formData={formData} companyInfo={companyInfo} totalCost={totalCost} />

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
        <h3 className="mb-2 text-lg font-bold text-gray-800">Payment Schedule</h3>
        <div className="mb-6 overflow-hidden border border-gray-400">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#00b0f0] text-black">
                <th className="border border-gray-400 p-2 font-bold">SNO</th>
                <th className="border border-gray-400 p-2 font-bold">Date</th>
                <th className="border border-gray-400 p-2 font-bold">Particulars</th>
                <th className="border border-gray-400 p-2 font-bold">%</th>
                <th className="border border-gray-400 p-2 font-bold">Amount</th>
                <th className="border border-gray-400 p-2 font-bold">Payment Ref. No.</th>
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
                    ? `${i + 1} EMI (0% Interest)`
                    : edcInEmi
                      ? `${i + 1} EMI (incl. EDC)`
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
      </div>
    </div>
  );
}
