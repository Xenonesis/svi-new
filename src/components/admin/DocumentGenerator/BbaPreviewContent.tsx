import React from 'react';
import BbaLegalPages from '../../../../app/admin/bba/BbaLegalPages';

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
          We at {companyInfo?.company_name} feel privileged to be part of your great investment. We
          thank you for giving us an opportunity to assist you in making this very investment. We
          sincerely hope that you are satisfied with our services and will refer us in your circle.
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

      {/* Legal Pages (2-17) */}
      <BbaLegalPages formData={formData} companyInfo={companyInfo} totalCost={totalCost} />

      {/* Payment Schedule Table (Page 18-19) */}
      <div style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
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
              </tr>
            </thead>
            <tbody>
              {isShyamAangan ? (
                <>
                  {/* Row 1 – 10% On Booking */}
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">1</td>
                    <td className="border border-gray-400 p-2 font-bold">
                      {fmtDate(formData?.bookingDate, 3)}
                    </td>
                    <td className="border border-gray-400 p-2 font-bold">On Booking</td>
                    <td className="border border-gray-400 p-2">10%</td>
                    <td className="border border-gray-400 p-2 font-bold">
                      {fmtInr(totalCost * 0.1)}
                    </td>
                  </tr>
                  {/* Row 2 – 20% Within 28 days */}
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">2</td>
                    <td className="border border-gray-400 p-2 font-bold">
                      {fmtDate(
                        formData?.bookingDate,
                        parseInt(formData?.secondPaymentDays || '28')
                      )}
                    </td>
                    <td className="border border-gray-400 p-2 font-bold">
                      Within {formData?.secondPaymentDays || '28'} days
                    </td>
                    <td className="border border-gray-400 p-2">20%</td>
                    <td className="border border-gray-400 p-2 font-bold">
                      {fmtInr(totalCost * 0.2)}
                    </td>
                  </tr>
                  {/* EMI rows – 70% over N months, 2.9% each */}
                  {(() => {
                    const months = parseInt(formData?.paymentPlan || '24');
                    const emiAmount = (totalCost * 0.7) / months;
                    return Array.from({ length: months }).map((_, i) => (
                      <tr key={i}>
                        <td className="border border-gray-400 p-2 font-bold">{i + 3}</td>
                        <td className="border border-gray-400 p-2 font-bold">
                          {fmtDate(formData?.bookingDate, 0, i + 1)}
                        </td>
                        <td className="border border-gray-400 p-2 font-bold">{i + 1} Emi</td>
                        <td className="border border-gray-400 p-2">2.9%</td>
                        <td className="border border-gray-400 p-2 font-bold">
                          {fmtInr(emiAmount)}
                        </td>
                      </tr>
                    ));
                  })()}
                </>
              ) : (
                // ── OTHER PROJECTS – original payment structure ──
                // 5% + 5% + 30% + 60% EMIs
                <>
                  {/* First Instalment (5%) */}
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">1</td>
                    <td className="border border-gray-400 p-2 font-bold">
                      {(() => {
                        if (!formData?.bookingDate) return '-';
                        const d = new Date(formData.bookingDate);
                        d.setDate(d.getDate() + 3);
                        return d.toISOString().split('T')[0];
                      })()}
                    </td>
                    <td className="border border-gray-400 p-2 font-bold">
                      On Booking (First 3 Days)
                    </td>
                    <td className="border border-gray-400 p-2">5%</td>
                    <td className="border border-gray-400 p-2 font-bold">
                      Rs. {(totalCost * 0.05).toFixed(2)}
                    </td>
                  </tr>
                  {/* Second Instalment (5%) */}
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">2</td>
                    <td className="border border-gray-400 p-2 font-bold">
                      {(() => {
                        if (!formData?.bookingDate) return '-';
                        const d = new Date(formData.bookingDate);
                        d.setDate(d.getDate() + 10);
                        return d.toISOString().split('T')[0];
                      })()}
                    </td>
                    <td className="border border-gray-400 p-2 font-bold">
                      Second Instalment (Next 7 Days)
                    </td>
                    <td className="border border-gray-400 p-2">5%</td>
                    <td className="border border-gray-400 p-2 font-bold">
                      Rs. {(totalCost * 0.05).toFixed(2)}
                    </td>
                  </tr>
                  {/* Third Instalment (30%) */}
                  <tr>
                    <td className="border border-gray-400 p-2 font-bold">3</td>
                    <td className="border border-gray-400 p-2 font-bold">
                      {(() => {
                        if (!formData?.bookingDate) return '-';
                        const d = new Date(formData.bookingDate);
                        d.setDate(d.getDate() + 25);
                        return d.toISOString().split('T')[0];
                      })()}
                    </td>
                    <td className="border border-gray-400 p-2 font-bold">
                      Third Instalment (Next 15 Days)
                    </td>
                    <td className="border border-gray-400 p-2">30%</td>
                    <td className="border border-gray-400 p-2 font-bold">
                      Rs. {(totalCost * 0.3).toFixed(2)}
                    </td>
                  </tr>
                  {/* EMIs (Remaining 60%) */}
                  {(() => {
                    const remainingCost = totalCost * 0.6;
                    const months = parseInt(formData?.paymentPlan || '12');
                    const emiAmount = remainingCost / months;
                    const emiPercent = 60 / months;
                    return Array.from({ length: months }).map((_, i) => {
                      let emiDate = '-';
                      if (formData?.bookingDate) {
                        const d = new Date(formData.bookingDate);
                        d.setMonth(d.getMonth() + i + 2);
                        emiDate = d.toISOString().split('T')[0];
                      }
                      return (
                        <tr key={i}>
                          <td className="border border-gray-400 p-2 font-bold">{i + 4}</td>
                          <td className="border border-gray-400 p-2 font-bold">{emiDate}</td>
                          <td className="border border-gray-400 p-2 font-bold">{i + 1} EMI</td>
                          <td className="border border-gray-400 p-2">{emiPercent.toFixed(1)}%</td>
                          <td className="border border-gray-400 p-2 font-bold">
                            Rs. {emiAmount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Terms Box */}
        <div className="mb-8 rounded-lg border-l-4 border-[#00b0f0] bg-[#f0f8ff] p-4 text-gray-800 italic">
          {isShyamAangan ? (
            <>
              <p className="mb-2">
                Request you to transfer the initial amount of 10% ({fmtInr(totalCost * 0.1)}) by{' '}
                {fmtDate(formData?.bookingDate, 3)} in order to confirm allotment under{' '}
                {companyInfo?.company_name}. Remaining initial amount need to be paid by{' '}
                {fmtDate(formData?.bookingDate, 0, parseInt(formData?.paymentPlan || '24') + 1)}
              </p>
              <p className="mb-2">
                Note: Allotment under {companyInfo?.company_name} will only be confirmed in case of
                10% ({fmtInr(totalCost * 0.1)}) payment received by{' '}
                {fmtDate(formData?.bookingDate, 3)}
              </p>
              <p>
                In the event you fail to make the payment as per the payment plan chosen by you,
                then allotment of these plots will be automatically cancel.
              </p>
            </>
          ) : (
            // ── OTHER PROJECTS terms ──
            <>
              <p className="mb-2">
                Please transfer the initial amount of 5% (Rs. {(totalCost * 0.05).toFixed(2)})
                within the first 3 days (by{' '}
                {(() => {
                  if (!formData?.bookingDate) return '[Date]';
                  const d = new Date(formData.bookingDate);
                  d.setDate(d.getDate() + 3);
                  return d.toISOString().split('T')[0];
                })()}
                ) to confirm allotment under {formData?.projectName}.
              </p>
              <p className="mb-2">
                The second instalment of 5% (Rs. {(totalCost * 0.05).toFixed(2)}) must be paid in
                the next 7 days (by{' '}
                {(() => {
                  if (!formData?.bookingDate) return '[Date]';
                  const d = new Date(formData.bookingDate);
                  d.setDate(d.getDate() + 10);
                  return d.toISOString().split('T')[0];
                })()}
                ), and the third instalment of 30% (Rs. {(totalCost * 0.3).toFixed(2)}) in the next
                15 days (by{' '}
                {(() => {
                  if (!formData?.bookingDate) return '[Date]';
                  const d = new Date(formData.bookingDate);
                  d.setDate(d.getDate() + 25);
                  return d.toISOString().split('T')[0];
                })()}
                ).
              </p>
              <p className="mb-2">
                The remaining 60% will be paid as per the selected payment plan EMIs and is
                scheduled to complete accordingly.
              </p>
              <p className="mb-2">
                Note: Allotment under {formData?.projectName} will only be confirmed upon receipt of
                the initial 5% (Rs. {(totalCost * 0.05).toFixed(2)}) by the due date.
              </p>
              <p>
                In the event you fail to make the payments as per the payment plan chosen by you,
                the allotment of these plots will be automatically cancelled.
              </p>
            </>
          )}
        </div>

        {/* Footer details */}
        <div className="flex items-end justify-between pb-8">
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
            <p className="mb-16">For {companyInfo?.company_name}</p>
            <div className="w-48 border-t border-black pt-2 text-center">
              <p>Director</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
