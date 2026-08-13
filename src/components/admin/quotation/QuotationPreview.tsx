'use client';

import type { QuotationCalculationResult, QuotationFormData } from '@/src/lib/quotation/types';
import { formatINR } from '@/src/lib/quotation/format';
import { numberToIndianWords } from '@/src/lib/quotation/numberToIndianWords';
import type { CompanyInfo } from '@/src/lib/quotation/types';
import { formatDateDisplay } from '@/src/lib/quotation/format';
import Image from 'next/image';

interface QuotationPreviewProps {
  formData: QuotationFormData;
  calculation: QuotationCalculationResult;
  companyInfo: CompanyInfo;
}

export default function QuotationPreview({
  formData,
  calculation,
  companyInfo,
}: QuotationPreviewProps) {
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

          {/* Amount in Words */}
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
