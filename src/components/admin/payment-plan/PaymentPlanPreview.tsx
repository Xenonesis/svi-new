import React from 'react';
import { PaymentPlanPreviewProps } from './types';

export function PaymentPlanPreview({
  formData,
  totals,
  schedule,
  className = '',
}: PaymentPlanPreviewProps) {
  const formattedStartDate = formData.startDate
    ? new Date(formData.startDate).toLocaleDateString('en-GB')
    : '-';

  return (
    <div className={`bg-white p-8 font-sans text-black ${className}`}>
      <div className="border-brand-gold mb-8 border-b-2 pb-6 text-center">
        <h1 className="text-brand-navy font-serif text-3xl font-bold">
          Payment Plan ({formData.emis} Months)
        </h1>
        <p className="mt-2 font-sans text-lg font-semibold tracking-wider text-gray-600 uppercase">
          {formData.propertyType}
        </p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-6 rounded-xl border border-gray-200 bg-gray-50 p-6 md:grid-cols-3">
        <div>
          <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
            Unit Number
          </span>
          <span className="text-lg font-semibold">{formData.unitNo || '-'}</span>
        </div>
        <div>
          <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
            Plot Size
          </span>
          <span className="text-lg font-semibold">{formData.plotSize || '0'} Sq. Yds.</span>
        </div>
        <div>
          <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
            Cost/Sq.Yd
          </span>
          <span className="text-lg font-semibold">
            ₹ {parseFloat(formData.costPerSqYd || '0').toLocaleString('en-IN')}
          </span>
        </div>
        <div>
          <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
            Total Cost
          </span>
          <span className="text-brand-navy text-lg font-semibold">
            ₹ {totals.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div>
          <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
            Booking Amount
          </span>
          <span className="text-lg font-semibold text-green-600">
            ₹{' '}
            {parseFloat(formData.bookingAmount || '0').toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
        <div>
          <span className="mb-1 block text-xs font-bold tracking-wider text-gray-500 uppercase">
            Balance Amount
          </span>
          <span className="text-lg font-semibold text-orange-600">
            ₹ {totals.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <h3 className="mb-6 border-b pb-2 text-xl font-bold text-gray-800">Installment Schedule</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* Initial Payment Card */}
        <div className="relative overflow-hidden rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <div className="absolute top-0 left-0 h-full w-1 bg-green-500"></div>
          <h4 className="mb-1 text-sm font-bold tracking-wide text-green-800 uppercase">
            Initial Payment
          </h4>
          <p className="mb-3 text-xs text-green-600">{formattedStartDate}</p>
          <p className="text-xl font-bold text-gray-900">
            ₹{' '}
            {parseFloat(formData.bookingAmount || '0').toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Installment Cards */}
        {schedule.map((row) => (
          <div
            key={row.month}
            className="group hover:border-brand-gold/50 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors"
          >
            <div className="absolute top-0 left-0 h-full w-1 bg-blue-400"></div>
            <div className="mb-1 flex items-start justify-between">
              <h4 className="text-sm font-bold tracking-wide text-gray-700 uppercase">
                Installment {row.month}
              </h4>
            </div>
            <p className="mb-3 text-xs text-gray-500">{row.date}</p>
            <p className="text-xl font-bold text-gray-900">
              ₹ {parseFloat(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t pt-8 text-center font-sans text-xs text-gray-500">
        Disclaimer: This is a computer generated document and does not require physical signature.
        Dates are approximate and subject to realization.
      </div>
    </div>
  );
}
