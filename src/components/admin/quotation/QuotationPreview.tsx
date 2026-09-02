'use client';

import type {
  QuotationCalculationResult,
  QuotationFormData,
  PricingTierCalculation,
} from '@/src/lib/quotation/types';
import { formatINR } from '@/src/lib/quotation/format';
import { numberToIndianWords } from '@/src/lib/quotation/numberToIndianWords';
import type { CompanyInfo } from '@/src/lib/quotation/types';
import { formatDateDisplay } from '@/src/lib/quotation/format';
import Image from 'next/image';

interface QuotationPreviewProps {
  formData: QuotationFormData;
  calculation: QuotationCalculationResult;
  tierCalculations?: PricingTierCalculation[];
  companyInfo: CompanyInfo;
}
export default function QuotationPreview({
  formData,
  calculation,
  tierCalculations = [],
  companyInfo,
}: QuotationPreviewProps) {
  const hasMultipleTiers = tierCalculations && tierCalculations.length > 1;
  const amountInWords = numberToIndianWords(calculation.grandTotal);

  return (
    <div
      id="quotationPreview"
      className="bg-white font-sans text-black"
      style={{ minWidth: 600, color: '#111' }}
    >
      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.05,
          pointerEvents: 'none',
          zIndex: 0,
          width: 400,
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          src="/logo.png"
          alt="SVI watermark"
          width={400}
          height={120}
          style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div
          style={{
            background: '#0a1628',
            color: '#fff',
            padding: '28px 32px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Image
              src="/logo.png"
              alt="SVI Infra Solutions"
              width={160}
              height={50}
              style={{
                objectFit: 'contain',
                height: 48,
                width: 'auto',
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>
          <div style={{ textAlign: 'right', fontSize: 11 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#C9A84C', marginBottom: 4 }}>
              {companyInfo.company_name || 'SVI INFRA SOLUTIONS PVT. LTD.'}
            </p>
            {companyInfo.company_address && (
              <p style={{ color: '#ccc', maxWidth: 280, lineHeight: 1.4 }}>
                {companyInfo.company_address}
              </p>
            )}
            {companyInfo.company_phone && (
              <p style={{ color: '#ccc', marginTop: 2 }}>📞 {companyInfo.company_phone}</p>
            )}
            {companyInfo.company_email && (
              <p style={{ color: '#ccc' }}>✉ {companyInfo.company_email}</p>
            )}
            {companyInfo.company_website && (
              <p style={{ color: '#C9A84C' }}>{companyInfo.company_website}</p>
            )}
          </div>
        </div>

        {/* Gold bar */}
        <div
          style={{ height: 4, background: 'linear-gradient(90deg, #C9A84C, #F5D68A, #C9A84C)' }}
        />

        <div style={{ padding: '24px 32px' }}>
          {/* QUOTATION label + meta */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 24,
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: 20,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#0a1628',
                  margin: 0,
                  letterSpacing: '0.04em',
                }}
              >
                QUOTATION
              </h1>
              {formData.propertyType && (
                <p style={{ color: '#C9A84C', fontWeight: 600, marginTop: 4, fontSize: 12 }}>
                  {formData.propertyType}
                </p>
              )}
            </div>
            <div style={{ textAlign: 'right', fontSize: 12 }}>
              <div style={{ marginBottom: 4 }}>
                <span
                  style={{
                    color: '#6b7280',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                  }}
                >
                  Quotation No.
                </span>
                <br />
                <span style={{ fontWeight: 700, color: '#0a1628' }}>{formData.quotationNo}</span>
              </div>
              <div style={{ marginBottom: 4 }}>
                <span
                  style={{
                    color: '#6b7280',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                  }}
                >
                  Date
                </span>
                <br />
                <span style={{ fontWeight: 600, color: '#374151' }}>
                  {formatDateDisplay(formData.quotationDate)}
                </span>
              </div>
              <div>
                <span
                  style={{
                    color: '#6b7280',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                  }}
                >
                  Valid Until
                </span>
                <br />
                <span style={{ fontWeight: 600, color: '#374151' }}>
                  {formatDateDisplay(formData.validUntil)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Property — 2 columns */}
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}
          >
            {/* Quotation For */}
            <div
              style={{
                background: '#f9fafb',
                borderRadius: 8,
                padding: '16px 20px',
                border: '1px solid #e5e7eb',
              }}
            >
              <h3
                style={{
                  margin: '0 0 12px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                }}
              >
                Quotation For
              </h3>
              <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 6px', color: '#111827' }}>
                {formData.customerName}
              </p>
              {formData.customerPhone && (
                <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 3px' }}>
                  📞 {formData.customerPhone}
                </p>
              )}
              {formData.customerEmail && (
                <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 3px' }}>
                  ✉ {formData.customerEmail}
                </p>
              )}
              {formData.customerAddress && (
                <p style={{ color: '#6b7280', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
                  {formData.customerAddress}
                </p>
              )}
            </div>

            {/* Property Details */}
            <div
              style={{
                background: '#f9fafb',
                borderRadius: 8,
                padding: '16px 20px',
                border: '1px solid #e5e7eb',
              }}
            >
              <h3
                style={{
                  margin: '0 0 12px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                }}
              >
                Property Details
              </h3>
              {formData.projectName && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12, minWidth: 80 }}>Project</span>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{formData.projectName}</span>
                </div>
              )}
              {formData.plotNo && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12, minWidth: 80 }}>Plot / Unit</span>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{formData.plotNo}</span>
                </div>
              )}
              {formData.propertyType && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: '#9ca3af', fontSize: 12, minWidth: 80 }}>Type</span>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{formData.propertyType}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#9ca3af', fontSize: 12, minWidth: 80 }}>Plot Area</span>
                <span style={{ fontWeight: 700, fontSize: 12, color: '#0a1628' }}>
                  {Number(formData.area).toLocaleString('en-IN')} Sq. Yds.
                </span>
              </div>
            </div>
          </div>

          {/* Price Breakdown Table */}
          {hasMultipleTiers ? (
            /* ── Comparative Multiple Pricing Table ────────────────────────── */
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#6b7280',
                  }}
                >
                  Comparative Price Breakdown ({tierCalculations.length} Options)
                </h3>
                <span
                  style={{
                    fontSize: 10,
                    color: '#C9A84C',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Plot Area: {Number(formData.area).toLocaleString('en-IN')} Sq. Yds.
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#0a1628', color: '#fff' }}>
                    <th
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Particulars
                    </th>
                    {tierCalculations.map((t, idx) => (
                      <th
                        key={t.id || idx}
                        style={{
                          padding: '10px 14px',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontSize: 11,
                          color: idx === 0 ? '#F5D68A' : '#fff',
                          textTransform: 'uppercase',
                          borderLeft: '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        {t.label || `Option ${idx + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Basic Rate */}
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '9px 14px', fontWeight: 600 }}>Basic Rate / Sq. Yd.</td>
                    {tierCalculations.map((t, idx) => (
                      <td
                        key={t.id || idx}
                        style={{
                          padding: '9px 14px',
                          textAlign: 'right',
                          fontWeight: 600,
                          borderLeft: '1px solid #e5e7eb',
                        }}
                      >
                        {formatINR(t.basicRate)}
                      </td>
                    ))}
                  </tr>
                  {/* Basic Price */}
                  <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <td style={{ padding: '9px 14px', fontWeight: 600 }}>
                      Basic Cost (Plot Area × Rate)
                    </td>
                    {tierCalculations.map((t, idx) => (
                      <td
                        key={t.id || idx}
                        style={{
                          padding: '9px 14px',
                          textAlign: 'right',
                          fontWeight: 600,
                          borderLeft: '1px solid #e5e7eb',
                        }}
                      >
                        {formatINR(t.basicPrice)}
                      </td>
                    ))}
                  </tr>
                  {/* EDC */}
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '9px 14px', fontWeight: 600 }}>EDC Amount</td>
                    {tierCalculations.map((t, idx) => (
                      <td
                        key={t.id || idx}
                        style={{
                          padding: '9px 14px',
                          textAlign: 'right',
                          color: '#4b5563',
                          borderLeft: '1px solid #e5e7eb',
                        }}
                      >
                        {formatINR(t.edcAmount)}{' '}
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>
                          ({formatINR(t.edcRate)}/yd)
                        </span>
                      </td>
                    ))}
                  </tr>
                  {/* PLC */}
                  <tr style={{ borderBottom: '2px solid #0a1628', background: '#f9fafb' }}>
                    <td style={{ padding: '9px 14px', fontWeight: 600 }}>PLC Amount</td>
                    {tierCalculations.map((t, idx) => (
                      <td
                        key={t.id || idx}
                        style={{
                          padding: '9px 14px',
                          textAlign: 'right',
                          color: '#4b5563',
                          borderLeft: '1px solid #e5e7eb',
                        }}
                      >
                        {formatINR(t.plcAmount)}{' '}
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>({t.plcPercent}%)</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
                <tfoot>
                  {/* Grand Total */}
                  <tr style={{ background: '#0a1628', color: '#fff' }}>
                    <td
                      style={{
                        padding: '12px 14px',
                        fontWeight: 800,
                        fontSize: 13,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Grand Total
                    </td>
                    {tierCalculations.map((t, idx) => (
                      <td
                        key={t.id || idx}
                        style={{
                          padding: '12px 14px',
                          textAlign: 'right',
                          fontWeight: 800,
                          fontSize: 15,
                          color: '#C9A84C',
                          borderLeft: '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        {formatINR(t.grandTotal)}
                      </td>
                    ))}
                  </tr>
                  {/* Effective Rate */}
                  <tr style={{ background: '#fefce8', color: '#92400e' }}>
                    <td style={{ padding: '8px 14px', fontWeight: 700, fontSize: 11 }}>
                      Effective Rate / Sq. Yd.
                    </td>
                    {tierCalculations.map((t, idx) => (
                      <td
                        key={t.id || idx}
                        style={{
                          padding: '8px 14px',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontSize: 12,
                          color: '#92400e',
                          borderLeft: '1px solid #fde68a',
                        }}
                      >
                        {formatINR(t.effectiveRate)} / yd
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>

              {/* Comparative Amount in Words Cards */}
              <div
                style={{
                  marginTop: 14,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${tierCalculations.length}, 1fr)`,
                  gap: 12,
                }}
              >
                {tierCalculations.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 6,
                      padding: '10px 12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#166534',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {t.label || `Option ${idx + 1}`}
                      </span>
                      <strong style={{ fontSize: 12, color: '#166534' }}>
                        {formatINR(t.grandTotal)}
                      </strong>
                    </div>
                    <p
                      style={{ margin: '4px 0 0', color: '#15803d', fontSize: 10, lineHeight: 1.4 }}
                    >
                      {numberToIndianWords(t.grandTotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Single Pricing Breakdown Table ────────────────────────────── */
            <div style={{ marginBottom: 20 }}>
              <h3
                style={{
                  margin: '0 0 12px',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#6b7280',
                }}
              >
                Price Breakdown
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#0a1628', color: '#fff' }}>
                    <th
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Particular
                    </th>
                    <th
                      style={{
                        padding: '10px 16px',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Calculation
                    </th>
                    <th
                      style={{
                        padding: '10px 16px',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Basic Price */}
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>Basic Price</td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: 12,
                      }}
                    >
                      {Number(formData.area).toLocaleString('en-IN')} Sq. Yds. ×{' '}
                      {formatINR(calculation.basicRate)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                      {formatINR(calculation.basicPrice)}
                    </td>
                  </tr>
                  {/* EDC */}
                  <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>EDC</td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: 12,
                      }}
                    >
                      {Number(formData.area).toLocaleString('en-IN')} Sq. Yds. ×{' '}
                      {formatINR(calculation.edcRate)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                      {formatINR(calculation.edcAmount)}
                    </td>
                  </tr>
                  {/* PLC */}
                  <tr style={{ borderBottom: '2px solid #0a1628' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                      PLC @ {calculation.plcPercent}%
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: 12,
                      }}
                    >
                      {calculation.plcPercent}% of {formatINR(calculation.basicPrice)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                      {formatINR(calculation.plcAmount)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  {/* Grand Total */}
                  <tr style={{ background: '#0a1628', color: '#fff' }}>
                    <td
                      colSpan={2}
                      style={{
                        padding: '16px 16px',
                        fontWeight: 800,
                        fontSize: 16,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Grand Total
                    </td>
                    <td
                      style={{
                        padding: '16px 16px',
                        textAlign: 'right',
                        fontWeight: 800,
                        fontSize: 20,
                        color: '#C9A84C',
                      }}
                    >
                      {formatINR(calculation.grandTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Effective Rate row */}
              <div
                style={{
                  background: '#fefce8',
                  border: '1px solid #fde68a',
                  borderTop: 'none',
                  padding: '10px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '0 0 8px 8px',
                }}
              >
                <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                  Effective Rate
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>
                  {formatINR(calculation.effectiveRate)} / Sq. Yd.
                </span>
              </div>
            </div>
          )}

          {/* Amount in Words (for single pricing) */}
          {!hasMultipleTiers && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#166534',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Amount in Words
              </span>
              <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#166534', fontSize: 13 }}>
                {amountInWords}
              </p>
            </div>
          )}
          {/* Notes */}
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                margin: '0 0 10px',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#6b7280',
              }}
            >
              Notes &amp; Terms
            </h3>
            {formData.notes && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 6,
                  padding: '10px 14px',
                  marginBottom: 10,
                  fontSize: 12,
                  color: '#374151',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {formData.notes}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 4px' }}>
                • This quotation is based on the rates and charges entered at the time of
                generation.
              </p>
              <p style={{ margin: '0 0 4px' }}>
                • Final pricing is subject to confirmation and applicable agreement terms.
              </p>
              <p style={{ margin: 0 }}>
                • Additional statutory or government charges, if applicable, are not included unless
                explicitly mentioned in this quotation.
              </p>
            </div>
          </div>

          {/* Signature */}
          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ fontSize: 11, color: '#9ca3af' }}>
              <p style={{ margin: 0 }}>This is a computer-generated quotation.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #374151', width: 180, marginBottom: 6 }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: '#0a1628', margin: 0 }}>
                For {companyInfo.company_name || 'SVI Infra Solutions Pvt. Ltd.'}
              </p>
              <p style={{ fontSize: 10, color: '#6b7280', margin: '2px 0 0' }}>
                Authorized Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
