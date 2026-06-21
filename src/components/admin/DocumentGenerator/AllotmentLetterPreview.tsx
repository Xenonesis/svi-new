import React from 'react';

const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d));
};

const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return dd + '-' + mm + '-' + yyyy;
};

export function AllotmentLetterPreview({ formData, companyInfo, id, className }: any) {
  const calculateTotalCost = () => {
    const area = parseFloat(formData.area) || 0;
    const bsp = parseFloat(formData.bsp) || 0;
    const plc = parseFloat(formData.plc) || 0;
    const edc = parseFloat(formData.edc) || 0;
    const base = area * bsp;
    const plcAmount = base * (plc / 100);
    return base + plcAmount + edc;
  };
  const totalCost = calculateTotalCost();
  const edcAmount = parseFloat(formData.edc) || 0;
  const edcInEmi = String(formData.edcInEmi) === 'true';
  const baseCost = totalCost - edcAmount;
  const bookingPercent = parseFloat(formData.bookingPaymentPercent) || 10;
  const initialPayment = (edcInEmi ? baseCost : totalCost) * (bookingPercent / 100);
  const secondPercent = 20;
  const secondPayment = (edcInEmi ? baseCost : totalCost) * (secondPercent / 100);
  const showSecondInstalment = String(formData.showSecondInstalment) === 'true';
  const zeroCost = String(formData.zeroPercentEmi) === 'true';
  const remainingPercentInTerms = zeroCost
    ? 0
    : showSecondInstalment
      ? 100 - bookingPercent - secondPercent
      : 100 - bookingPercent;
  return (
    <div
      id={id}
      className={
        className || 'relative bg-white p-8 font-sans text-[13px] leading-relaxed text-black'
      }
    >
      {/* Watermark */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-5">
        <img
          src="/logo.png"
          alt="Watermark"
          className="w-[80%] max-w-3xl object-contain grayscale"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between border-b-2 border-[#1e3a8a] pb-4">
          <div>
            <h1 className="mb-2 text-2xl font-bold tracking-wide text-[#1e3a8a] uppercase">
              {companyInfo.company_name}
            </h1>
            <p className="text-gray-700">
              Cell: {companyInfo.company_phone} | Email: {companyInfo.company_email}
            </p>
            <p className="text-gray-700">Website: {companyInfo.company_website}</p>
            <p className="text-gray-700">Office Address : {companyInfo.company_address}</p>
          </div>
          <div className="w-48">
            <img
              src="/logo.png"
              alt={companyInfo.company_name}
              className="h-auto w-full object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
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
        </div>

        {/* Body */}
        <div className="mb-6">
          <p className="mb-2">
            Dear {formData.salutation}{' '}
            <span className="font-bold">{formData.clientName || '[Client Name]'}</span>
          </p>
          <p className="mb-1 text-justify">
            Congratulations from {companyInfo.company_name} on your new investment in{' '}
            {formData.projectName} (Kishan Garh Renwal, Jaipur, Rajasthan). It is a perfect choice
            and you are one of the few lucky ones to get unit at such reasonable rates.
          </p>
          <p className="mb-4 text-justify">
            We at {companyInfo.company_name} feel privileged to be part of your great investment. We
            thank you for giving us an opportunity to assist you in making this very investment. We
            sincerely hope that you are satisfied with our services and will refer us in your
            circle.
          </p>

          <p className="mb-2 font-bold">Your Allotment is as Follows:</p>
          <p>
            Ticket Id : <span className="font-bold">{formData.ticketId}</span>
          </p>
          <p>
            Project Name : <span className="font-bold">{formData.projectName}</span>
          </p>
          <p>
            Unit Number : <span className="font-bold">{formData.unitNumber}</span>
          </p>

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
                <td className="border border-gray-400 p-2 font-bold">{formData.clientName}</td>
                <td className="border border-gray-400 p-2 font-bold">{formData.unitNumber}</td>
                <td className="border border-gray-400 p-2 font-bold">{formData.area}</td>
                <td className="border border-gray-400 p-2 font-bold">
                  {formData.paymentPlan} Months
                </td>
                <td className="border border-gray-400 p-2 font-bold">{formData.bsp}</td>
                <td className="border border-gray-400 p-2 font-bold">{formData.plc || '0'}</td>
                <td className="border border-gray-400 p-2 font-bold">
                  {formData.edc ? parseFloat(formData.edc).toFixed(2) : '0.00'}
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
              {/* First Instalment (Custom %) */}
              <tr className="break-inside-avoid">
                <td className="border border-gray-400 p-2 font-bold">1</td>
                <td className="border border-gray-400 p-2 font-bold">
                  {(() => {
                    if (!formData.bookingDate) return '-';
                    const d = parseDate(formData.bookingDate);
                    return formatDate(d);
                  })()}
                </td>
                <td className="border border-gray-400 p-2 font-bold">On Booking (First 3 Days)</td>
                <td className="border border-gray-400 p-2">{bookingPercent}%</td>
                <td className="border border-gray-400 p-2 font-bold">
                  Rs. {initialPayment.toFixed(2)}
                </td>
              </tr>
              {/* Second Instalment (20%) — only shown if enabled */}
              {showSecondInstalment && (
                <tr className="break-inside-avoid">
                  <td className="border border-gray-400 p-2 font-bold">2</td>
                  <td className="border border-gray-400 p-2 font-bold">
                    {(() => {
                      if (!formData.bookingDate) return '-';
                      const d = parseDate(formData.bookingDate);
                      d.setDate(d.getDate() + parseInt(formData.secondPaymentDays));
                      return formatDate(d);
                    })()}
                  </td>
                  <td className="border border-gray-400 p-2 font-bold">
                    Second Instalment ({formData.secondPaymentDays} Days)
                  </td>
                  <td className="border border-gray-400 p-2">{secondPercent}%</td>
                  <td className="border border-gray-400 p-2 font-bold">
                    Rs. {secondPayment.toFixed(2)}
                  </td>
                </tr>
              )}
              {/* EMIs (Remaining %) */}
              {(() => {
                const remainingPercent = showSecondInstalment
                  ? 100 - bookingPercent - secondPercent
                  : 100 - bookingPercent;
                const emiCount =
                  formData.emiCount === 'custom'
                    ? parseInt(formData.paymentPlan || '12')
                    : parseInt(formData.emiCount || '12');
                const emiPercentPerInstallment = formData.emiPercentage
                  ? parseFloat(formData.emiPercentage)
                  : remainingPercent / emiCount;
                const emiStartIndex = showSecondInstalment ? 3 : 2;

                // When EDC is in EMI-only mode, the EMI amount = base remaining portion + full EDC, divided equally
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
                      <td className="border border-gray-400 p-2 font-bold">{i + emiStartIndex}</td>
                      <td className="border border-gray-400 p-2 font-bold">{emiDate}</td>
                      <td className="border border-gray-400 p-2 font-bold">
                        {zeroCost
                          ? `${i + 1} EMI (0% Interest)`
                          : edcInEmi
                            ? `${i + 1} EMI (incl. EDC)`
                            : `${i + 1} EMI`}
                      </td>
                      <td className="border border-gray-400 p-2">
                        {emiPercentPerInstallment.toFixed(1)}%
                      </td>
                      <td className="border border-gray-400 p-2 font-bold">
                        Rs. {emiAmount.toFixed(2)}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Terms Box */}
        <div className="mb-8 rounded-lg border-l-4 border-[#00b0f0] bg-[#f0f8ff] p-4 text-xs text-gray-800 italic">
          <p className="mb-2">
            Please transfer the initial amount of {bookingPercent}% (Rs. {initialPayment.toFixed(2)}
            ) within the first 3 days (by{' '}
            {(() => {
              if (!formData.bookingDate) return '[Date]';
              const d = parseDate(formData.bookingDate);
              d.setDate(d.getDate() + 3);
              return formatDate(d);
            })()}
            ) to confirm allotment under {formData.projectName}.
          </p>
          {showSecondInstalment && (
            <p className="mb-2">
              The second instalment of {secondPercent}% (Rs. {secondPayment.toFixed(2)}) must be
              paid within {formData.secondPaymentDays} days (by{' '}
              {(() => {
                if (!formData.bookingDate) return '[Date]';
                const d = parseDate(formData.bookingDate);
                d.setDate(d.getDate() + parseInt(formData.secondPaymentDays));
                return formatDate(d);
              })()}
              ).
            </p>
          )}
          <p className="mb-2">
            The remaining {remainingPercentInTerms}%
            {zeroCost ? ' (0% Interest — equal instalments)' : ''}
            {edcInEmi && !zeroCost ? ' (incl. EDC)' : ''} will be paid as per the selected payment
            plan EMIs and is scheduled to complete accordingly.
          </p>
          <p className="mb-2">
            Note: Allotment under {formData.projectName} will only be confirmed upon receipt of the
            initial {bookingPercent}% (Rs. {initialPayment.toFixed(2)}) by the due date.
          </p>
          <p>
            In the event you fail to make the payments as per the payment plan chosen by you, the
            allotment of these plots will be automatically cancelled.
          </p>
        </div>

        {/* Footer details */}
        <div className="flex items-end justify-between pb-8">
          <div>
            <p className="mb-2 font-bold">
              Payment can be transferred online using the following details:
            </p>
            <p>
              <span className="font-bold">Account Name:</span>{' '}
              {companyInfo.bank_account_name || 'Svi Infra Solutions Pvt. Ltd'}
            </p>
            <p>
              <span className="font-bold">Account Number:</span>{' '}
              {companyInfo.bank_account_no || '0894102000013837'}
            </p>
            <p>
              <span className="font-bold">Bank:</span> {companyInfo.bank_name || 'IDBI BANK'}
            </p>
            <p>
              <span className="font-bold">IFSC CODE:</span> {companyInfo.bank_ifsc || 'IBKL0000894'}
            </p>
            <p className="mt-4">
              Your account manager is <span className="font-bold">{formData.advisorName}</span> and
              will be reachable on <span className="font-bold">{formData.advisorNumber}</span>
              {formData.advisorEmail ? (
                <>
                  {' '}
                  (Email: <span className="font-bold">{formData.advisorEmail}</span>)
                </>
              ) : (
                ''
              )}{' '}
              for any queries.
            </p>
          </div>
          <div className="flex flex-col items-end text-right">
            <img
              src="/signature.png"
              alt="Signature"
              className="w-56 object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
