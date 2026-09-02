'use client';

import type {
  QuotationCalculationResult,
  QuotationFormData,
  PricingTierCalculation,
  CompanyInfo,
} from '@/src/lib/quotation/types';
import { formatINR, formatDateDisplay } from '@/src/lib/quotation/format';
import { numberToIndianWords } from '@/src/lib/quotation/numberToIndianWords';
import Image from 'next/image';

interface QuotationPreviewProps {
  formData: QuotationFormData;
  calculation: QuotationCalculationResult;
  tierCalculations?: PricingTierCalculation[];
  companyInfo: CompanyInfo;
}

/** Check if notes has meaningful content (not just //, whitespace, or empty) */
function hasValidNotes(notes?: string): boolean {
  if (!notes) return false;
  const cleaned = notes.trim().replace(/^[\/\-\s]+$/, '');
  return cleaned.length > 0;
}

/** Calculate approx monthly installment for standard plans */
function getMonthlyEstimate(grandTotal: number, months: number): string {
  if (months <= 1) return 'Full Upfront (Zero Interest)';
  const emi = Math.round(grandTotal / months);
  return `≈ ${formatINR(emi)} / month`;
}

export default function QuotationPreview({
  formData,
  calculation,
  tierCalculations = [],
  companyInfo,
}: QuotationPreviewProps) {
  const hasMultipleTiers = tierCalculations && tierCalculations.length > 1;
  const amountInWords = numberToIndianWords(calculation.grandTotal);
  const areaSqYds = Number(formData.area) || 0;
  const areaSqFt = Math.round(areaSqYds * 9);
  const showCustomNotes = hasValidNotes(formData.notes);

  return (
    <div
      id="quotationPreview"
      className="bg-white font-sans text-slate-900"
      style={{
        minWidth: 720,
        maxWidth: 900,
        margin: '0 auto',
        color: '#0f172a',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        fontSize: '12px',
        lineHeight: '1.5',
      }}
    >
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#0a1628',
          color: '#ffffff',
          padding: '14px 28px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Brand Logo from official asset & Company Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              padding: '4px',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              flexShrink: 0,
            }}
          >
            <img
              src="/logo-icon.png"
              alt="SVI Infra Solutions Pvt. Ltd."
              width={46}
              height={46}
              style={{
                width: 46,
                height: 46,
                objectFit: 'contain',
                borderRadius: '5px',
                display: 'block',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '17px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.03em',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              SVI INFRA SOLUTIONS PVT. LTD.
            </h2>
            <span
              style={{
                fontSize: '10.5px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                fontWeight: 700,
                marginTop: '3px',
              }}
            >
              Real Estate &amp; Infrastructure
            </span>
          </div>
        </div>

        {/* Company Contact Details */}
        <div style={{ textAlign: 'right', fontSize: '11.5px' }}>
          {companyInfo.company_address && (
            <p
              style={{
                color: '#cbd5e1',
                maxWidth: 340,
                margin: '0 0 3px',
                fontSize: '11px',
                lineHeight: '1.3',
              }}
            >
              {companyInfo.company_address}
            </p>
          )}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              gap: '12px',
              color: '#94a3b8',
              fontSize: '11px',
              marginTop: '3px',
            }}
          >
            {companyInfo.company_phone && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {companyInfo.company_phone}
              </span>
            )}
            {companyInfo.company_email && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                {companyInfo.company_email}
              </span>
            )}
            {companyInfo.company_website && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#C9A84C',
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" x2="22" y1="12" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                {companyInfo.company_website}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Gold Metallic Accent Line */}
      <div
        style={{
          height: 3,
          background:
            'linear-gradient(90deg, #997B2C 0%, #C9A84C 25%, #F5D68A 50%, #C9A84C 75%, #997B2C 100%)',
        }}
      />

      {/* ── BODY CONTAINER ─────────────────────────────────────────────── */}
      <div style={{ padding: '14px 26px 14px' }}>
        {/* Title & Document Meta Badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            paddingBottom: 8,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 21,
                  fontWeight: 700,
                  color: '#0a1628',
                  margin: 0,
                  letterSpacing: '0.02em',
                }}
              >
                PROPERTY QUOTATION
              </h1>
              {formData.propertyType && (
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    backgroundColor: '#fbf7ec',
                    border: '1px solid #eddca8',
                    color: '#854d0e',
                    padding: '2px 7px',
                    borderRadius: '4px',
                  }}
                >
                  {formData.propertyType}
                </span>
              )}
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748b' }}>
              Official price proposal &amp; payment schedule for customer reference
            </p>
          </div>

          {/* Quotation Meta Badge */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 12px',
              textAlign: 'right',
              display: 'flex',
              gap: '14px',
            }}
          >
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.08em',
                }}
              >
                Quotation No.
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#0a1628',
                  fontFamily: 'monospace',
                }}
              >
                {formData.quotationNo || 'SVI-QTN-DRAFT'}
              </span>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.08em',
                }}
              >
                Issue Date
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                {formatDateDisplay(formData.quotationDate)}
              </span>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#b45309',
                  letterSpacing: '0.08em',
                }}
              >
                Valid Until
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#b45309' }}>
                {formatDateDisplay(formData.validUntil)}
              </span>
            </div>
          </div>
        </div>

        {/* ── CUSTOMER & PROPERTY CARDS ─────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {/* Card 1: Quotation Issued To */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '6px',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #C9A84C',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C9A84C"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h3
                style={{
                  margin: 0,
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#0a1628',
                }}
              >
                Quotation Issued To
              </h3>
            </div>
            <p style={{ fontWeight: 800, fontSize: '13.5px', margin: '0 0 3px', color: '#0f172a' }}>
              {formData.customerName || 'Valued Customer'}
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                fontSize: '11.5px',
                color: '#475569',
              }}
            >
              {formData.customerPhone && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {formData.customerPhone}
                </span>
              )}
              {formData.customerEmail && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  {formData.customerEmail}
                </span>
              )}
              {formData.customerAddress && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'flex-start',
                    gap: '6px',
                    marginTop: '2px',
                    lineHeight: '1.4',
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {formData.customerAddress}
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Property Specifications */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '6px',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderLeft: '4px solid #0a1628',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0a1628"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <h3
                style={{
                  margin: 0,
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#0a1628',
                }}
              >
                Property Specifications
              </h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px 10px',
                fontSize: '11.5px',
              }}
            >
              <div>
                <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block' }}>
                  Project Name
                </span>
                <strong style={{ color: '#0f172a', fontSize: '12.5px' }}>
                  {formData.projectName || '—'}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block' }}>
                  Plot / Unit No.
                </span>
                <strong
                  style={{
                    color: '#0a1628',
                    fontSize: '12.5px',
                    background: '#e2e8f0',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {formData.plotNo || 'TBD'}
                </strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block' }}>
                  Property Type
                </span>
                <span style={{ color: '#334155', fontWeight: 600 }}>
                  {formData.propertyType || 'Residential Plot'}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '10.5px', display: 'block' }}>
                  Plot Area
                </span>
                <span style={{ color: '#0a1628', fontWeight: 800 }}>
                  {areaSqYds.toLocaleString('en-IN')} Sq. Yds.
                  {areaSqFt > 0 && (
                    <span style={{ color: '#64748b', fontWeight: 400, fontSize: '10.5px' }}>
                      {' '}
                      ({areaSqFt.toLocaleString('en-IN')} sq.ft)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PRICE BREAKDOWN TABLE ─────────────────────────────────────── */}
        {hasMultipleTiers ? (
          /* Multi-Tier Comparative Pricing Table */
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '11.5px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#0a1628',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#C9A84C',
                    display: 'inline-block',
                  }}
                />
                Comparative Payment Options ({tierCalculations.length} Plans)
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                Calculated on Area: <strong>{areaSqYds.toLocaleString('en-IN')} Sq. Yds.</strong>
              </span>
            </div>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <thead>
                <tr style={{ background: '#0a1628', color: '#ffffff' }}>
                  <th
                    style={{
                      padding: '7px 12px',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      width: '32%',
                    }}
                  >
                    Particulars
                  </th>
                  {tierCalculations.map((t, idx) => {
                    const isBestValue = idx === 0;
                    return (
                      <th
                        key={t.id || idx}
                        style={{
                          padding: '7px 12px',
                          textAlign: 'right',
                          fontWeight: 700,
                          fontSize: '11.5px',
                          color: isBestValue ? '#F5D68A' : '#ffffff',
                          textTransform: 'uppercase',
                          borderLeft: '1px solid rgba(255,255,255,0.12)',
                        }}
                      >
                        {t.label || `Option ${idx + 1}`}
                        {(() => {
                          const months = t.paymentMonths ? parseInt(t.paymentMonths, 10) : 0;
                          return months > 1 ? (
                            <span
                              style={{
                                display: 'block',
                                fontSize: '9.5px',
                                letterSpacing: '0.03em',
                                color: '#38bdf8',
                                fontWeight: 700,
                                marginTop: '2px',
                                textTransform: 'none',
                              }}
                            >
                              {months}-Month EMI Plan
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'block',
                                fontSize: '9.5px',
                                letterSpacing: '0.03em',
                                color: isBestValue ? '#C9A84C' : '#a3e635',
                                fontWeight: 600,
                                marginTop: '2px',
                                textTransform: 'none',
                              }}
                            >
                              Full Upfront Payment
                            </span>
                          );
                        })()}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Basic Rate */}
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                  <td style={{ padding: '6px 12px', color: '#334155', fontWeight: 600 }}>
                    Basic Rate / Sq. Yd.
                  </td>
                  {tierCalculations.map((t, idx) => (
                    <td
                      key={t.id || idx}
                      style={{
                        padding: '6px 12px',
                        textAlign: 'right',
                        borderLeft: '1px solid #f1f5f9',
                        fontWeight: 600,
                      }}
                    >
                      {formatINR(t.basicRate)}
                    </td>
                  ))}
                </tr>

                {/* Basic Cost */}
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <td style={{ padding: '6px 12px', color: '#334155', fontWeight: 600 }}>
                    Basic Land Cost{' '}
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                      ({areaSqYds} Yds × Rate)
                    </span>
                  </td>
                  {tierCalculations.map((t, idx) => (
                    <td
                      key={t.id || idx}
                      style={{
                        padding: '6px 12px',
                        textAlign: 'right',
                        borderLeft: '1px solid #f1f5f9',
                        fontWeight: 600,
                      }}
                    >
                      {formatINR(t.basicPrice)}
                    </td>
                  ))}
                </tr>

                {/* EDC Amount */}
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                  <td style={{ padding: '6px 12px', color: '#334155' }}>
                    EDC Amount{' '}
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                      (Govt. Dev. Charges)
                    </span>
                  </td>
                  {tierCalculations.map((t, idx) => (
                    <td
                      key={t.id || idx}
                      style={{
                        padding: '6px 12px',
                        textAlign: 'right',
                        borderLeft: '1px solid #f1f5f9',
                        color: '#475569',
                      }}
                    >
                      {formatINR(t.edcAmount)}
                      {t.edcRate > 0 && (
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                          {' '}
                          (₹{t.edcRate}/yd)
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* PLC Amount */}
                <tr style={{ borderBottom: '1.5px solid #cbd5e1', background: '#f8fafc' }}>
                  <td style={{ padding: '6px 12px', color: '#334155' }}>
                    PLC Amount{' '}
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                      (Location Preference)
                    </span>
                  </td>
                  {tierCalculations.map((t, idx) => (
                    <td
                      key={t.id || idx}
                      style={{
                        padding: '6px 12px',
                        textAlign: 'right',
                        borderLeft: '1px solid #f1f5f9',
                        color: '#475569',
                      }}
                    >
                      {formatINR(t.plcAmount)}
                      {t.plcPercent > 0 && (
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                          {' '}
                          ({t.plcPercent}%)
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>

              {/* Grand Total Row */}
              <tfoot>
                <tr style={{ background: '#0a1628', color: '#ffffff' }}>
                  <td
                    style={{
                      padding: '8px 12px',
                      fontWeight: 800,
                      fontSize: '12px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Grand Total
                  </td>
                  {tierCalculations.map((t, idx) => (
                    <td
                      key={t.id || idx}
                      style={{
                        padding: '8px 12px',
                        textAlign: 'right',
                        fontWeight: 800,
                        fontSize: '15px',
                        color: '#F5D68A',
                        borderLeft: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      {formatINR(t.grandTotal)}
                    </td>
                  ))}
                </tr>

                {/* Effective Rate Row */}
                <tr
                  style={{
                    background: '#fbf7ec',
                    color: '#854d0e',
                    borderTop: '1px solid #eddca8',
                  }}
                >
                  <td style={{ padding: '6px 12px', fontWeight: 700, fontSize: '11px' }}>
                    Effective Land Rate
                  </td>
                  {tierCalculations.map((t, idx) => (
                    <td
                      key={t.id || idx}
                      style={{
                        padding: '6px 12px',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontSize: '11.5px',
                        borderLeft: '1px solid #eddca8',
                      }}
                    >
                      {formatINR(t.effectiveRate)} / yd
                    </td>
                  ))}
                </tr>

                {/* Approx Monthly Outflow Helper */}
                <tr
                  style={{
                    background: '#f8fafc',
                    color: '#334155',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <td
                    style={{
                      padding: '6px 12px',
                      fontWeight: 600,
                      fontSize: '11px',
                      color: '#64748b',
                    }}
                  >
                    Approx. Installment Outflow
                  </td>
                  {tierCalculations.map((t, idx) => {
                    const months = t.paymentMonths ? parseInt(t.paymentMonths, 10) : 1;
                    return (
                      <td
                        key={t.id || idx}
                        style={{
                          padding: '6px 12px',
                          textAlign: 'right',
                          fontWeight: 600,
                          fontSize: '11px',
                          color: months > 1 ? '#0369a1' : '#15803d',
                          borderLeft: '1px solid #e2e8f0',
                        }}
                      >
                        {getMonthlyEstimate(t.grandTotal, months)}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>

            {/* Amount in Words Executive Cards */}
            <div
              style={{
                marginTop: 8,
                display: 'grid',
                gridTemplateColumns: `repeat(${tierCalculations.length}, 1fr)`,
                gap: 8,
              }}
            >
              {tierCalculations.map((t, idx) => (
                <div
                  key={t.id || idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderTop: '2px solid #C9A84C',
                    borderRadius: '6px',
                    padding: '6px 10px',
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
                        fontSize: '10px',
                        fontWeight: 800,
                        color: '#0a1628',
                        textTransform: 'uppercase',
                      }}
                    >
                      {t.label || `Option ${idx + 1}`}
                    </span>
                    <strong style={{ fontSize: '12px', color: '#0a1628' }}>
                      {formatINR(t.grandTotal)}
                    </strong>
                  </div>
                  <p
                    style={{
                      margin: '2px 0 0',
                      color: '#475569',
                      fontSize: '10.5px',
                      lineHeight: '1.3',
                      fontStyle: 'italic',
                    }}
                  >
                    {numberToIndianWords(t.grandTotal)}
                  </p>
                  {t.paymentMonths && parseInt(t.paymentMonths, 10) > 1 && (
                    <p
                      style={{
                        margin: '4px 0 0',
                        padding: '3px 6px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        color: '#15803d',
                      }}
                    >
                      {t.paymentMonths}-Month Plan: ≈{' '}
                      {formatINR(Math.ceil(t.grandTotal / parseInt(t.paymentMonths, 10)))} / month
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Single Option Pricing Breakdown */
          <div style={{ marginBottom: 10 }}>
            <h3
              style={{
                margin: '0 0 6px',
                fontSize: '11.5px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0a1628',
              }}
            >
              Price Breakdown &amp; Calculation
            </h3>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <thead>
                <tr style={{ background: '#0a1628', color: '#fff' }}>
                  <th
                    style={{
                      padding: '7px 12px',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Particular
                  </th>
                  <th
                    style={{
                      padding: '7px 12px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Calculation Formula
                  </th>
                  <th
                    style={{
                      padding: '7px 12px',
                      textAlign: 'right',
                      fontWeight: 700,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Amount (INR)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
                  <td style={{ padding: '6px 12px', fontWeight: 600, color: '#334155' }}>
                    Basic Land Cost
                  </td>
                  <td
                    style={{
                      padding: '6px 12px',
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '11.5px',
                    }}
                  >
                    {areaSqYds.toLocaleString('en-IN')} Sq. Yds. ×{' '}
                    {formatINR(calculation.basicRate)}/yd
                  </td>
                  <td
                    style={{
                      padding: '6px 12px',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: '#0f172a',
                      fontSize: '12.5px',
                    }}
                  >
                    {formatINR(calculation.basicPrice)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <td style={{ padding: '6px 12px', fontWeight: 600, color: '#334155' }}>
                    External Development Charges (EDC)
                  </td>
                  <td
                    style={{
                      padding: '6px 12px',
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '11.5px',
                    }}
                  >
                    {areaSqYds.toLocaleString('en-IN')} Sq. Yds. × {formatINR(calculation.edcRate)}
                    /yd
                  </td>
                  <td
                    style={{
                      padding: '6px 12px',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: '#334155',
                      fontSize: '12px',
                    }}
                  >
                    {formatINR(calculation.edcAmount)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1.5px solid #cbd5e1', background: '#fff' }}>
                  <td style={{ padding: '6px 12px', fontWeight: 600, color: '#334155' }}>
                    Preferential Location Charges (PLC @ {calculation.plcPercent}%)
                  </td>
                  <td
                    style={{
                      padding: '6px 12px',
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '11.5px',
                    }}
                  >
                    {calculation.plcPercent}% on Basic Cost ({formatINR(calculation.basicPrice)})
                  </td>
                  <td
                    style={{
                      padding: '6px 12px',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: '#334155',
                      fontSize: '12px',
                    }}
                  >
                    {formatINR(calculation.plcAmount)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ background: '#0a1628', color: '#fff' }}>
                  <td
                    colSpan={2}
                    style={{
                      padding: '8px 12px',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Grand Total
                  </td>
                  <td
                    style={{
                      padding: '8px 12px',
                      textAlign: 'right',
                      fontWeight: 800,
                      fontSize: '17px',
                      color: '#F5D68A',
                    }}
                  >
                    {formatINR(calculation.grandTotal)}
                  </td>
                </tr>
                <tr
                  style={{
                    background: '#fbf7ec',
                    color: '#854d0e',
                    borderTop: '1px solid #eddca8',
                  }}
                >
                  <td
                    colSpan={2}
                    style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 700 }}
                  >
                    Effective Rate per Sq. Yd. (All Inclusive)
                  </td>
                  <td
                    style={{
                      padding: '5px 12px',
                      textAlign: 'right',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    {formatINR(calculation.effectiveRate)} / Sq. Yd.
                  </td>
                </tr>
              </tfoot>
            </table>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #C9A84C',
                borderRadius: '6px',
                padding: '6px 12px',
                marginTop: '6px',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#0a1628',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Amount in Words
              </span>
              <p
                style={{
                  margin: '1px 0 0',
                  fontWeight: 600,
                  color: '#334155',
                  fontSize: '12px',
                  fontStyle: 'italic',
                }}
              >
                {amountInWords}
              </p>
            </div>
            {/* Monthly Installment Table — shown only when paymentMonths is set */}
            {formData.paymentMonths &&
              parseInt(formData.paymentMonths, 10) > 1 &&
              (() => {
                const months = parseInt(formData.paymentMonths, 10);
                const monthly = Math.ceil(calculation.grandTotal / months);
                return (
                  <div style={{ marginTop: 10 }}>
                    <div
                      style={{
                        background: '#0a1628',
                        color: '#fff',
                        padding: '8px 14px',
                        borderRadius: '6px 6px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {months}-Month Installment Plan
                      </span>
                      <span style={{ fontSize: '10px', color: '#F5D68A', fontWeight: 700 }}>
                        ≈ {formatINR(monthly)} / month
                      </span>
                    </div>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '11px',
                        border: '1px solid #e2e8f0',
                        borderTop: 'none',
                      }}
                    >
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th
                            style={{
                              padding: '7px 12px',
                              textAlign: 'left',
                              fontWeight: 700,
                              color: '#334155',
                              fontSize: '10px',
                              textTransform: 'uppercase',
                              borderBottom: '1px solid #e2e8f0',
                              width: '20%',
                            }}
                          >
                            Installment
                          </th>
                          <th
                            style={{
                              padding: '7px 12px',
                              textAlign: 'left',
                              fontWeight: 700,
                              color: '#334155',
                              fontSize: '10px',
                              textTransform: 'uppercase',
                              borderBottom: '1px solid #e2e8f0',
                              borderLeft: '1px solid #e2e8f0',
                            }}
                          >
                            Period
                          </th>
                          <th
                            style={{
                              padding: '7px 12px',
                              textAlign: 'right',
                              fontWeight: 700,
                              color: '#334155',
                              fontSize: '10px',
                              textTransform: 'uppercase',
                              borderBottom: '1px solid #e2e8f0',
                              borderLeft: '1px solid #e2e8f0',
                            }}
                          >
                            Amount (₹)
                          </th>
                          <th
                            style={{
                              padding: '7px 12px',
                              textAlign: 'right',
                              fontWeight: 700,
                              color: '#334155',
                              fontSize: '10px',
                              textTransform: 'uppercase',
                              borderBottom: '1px solid #e2e8f0',
                              borderLeft: '1px solid #e2e8f0',
                            }}
                          >
                            Cumulative
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: months }, (_, i) => {
                          const isLast = i === months - 1;
                          const amt = isLast
                            ? calculation.grandTotal - monthly * (months - 1)
                            : monthly;
                          const cumulative = isLast ? calculation.grandTotal : monthly * (i + 1);
                          return (
                            <tr
                              key={i}
                              style={{
                                background: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                                borderBottom: '1px solid #f1f5f9',
                              }}
                            >
                              <td
                                style={{ padding: '7px 12px', fontWeight: 700, color: '#0a1628' }}
                              >
                                #{i + 1}
                              </td>
                              <td
                                style={{
                                  padding: '7px 12px',
                                  color: '#64748b',
                                  borderLeft: '1px solid #f1f5f9',
                                }}
                              >
                                Month {i + 1}
                              </td>
                              <td
                                style={{
                                  padding: '7px 12px',
                                  textAlign: 'right',
                                  fontWeight: 700,
                                  color: '#0a1628',
                                  borderLeft: '1px solid #f1f5f9',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {formatINR(amt)}
                              </td>
                              <td
                                style={{
                                  padding: '7px 12px',
                                  textAlign: 'right',
                                  color: '#64748b',
                                  borderLeft: '1px solid #f1f5f9',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {formatINR(cumulative)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: '#f0fdf4', borderTop: '2px solid #16a34a' }}>
                          <td
                            colSpan={2}
                            style={{
                              padding: '8px 12px',
                              fontWeight: 800,
                              color: '#15803d',
                              fontSize: '11px',
                            }}
                          >
                            Total Payable ({months} Installments)
                          </td>
                          <td
                            colSpan={2}
                            style={{
                              padding: '8px 12px',
                              textAlign: 'right',
                              fontWeight: 800,
                              color: '#15803d',
                              fontSize: '12px',
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatINR(calculation.grandTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })()}
          </div>
        )}

        {/* ── HIGH-CONVERTING VALUE ADDS (AMENITIES + BANKING + PROCESS) ─ */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10, marginBottom: 8 }}
        >
          {/* Left Box: Official Bank Details for Booking Token */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C9A84C"
                strokeWidth="2.5"
              >
                <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2 2 7h20L12 2z" />
              </svg>
              <h4
                style={{
                  margin: 0,
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#0a1628',
                }}
              >
                Official Bank Account for Booking
              </h4>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '3px 8px',
                fontSize: '11px',
              }}
            >
              <div>
                <span style={{ color: '#64748b', fontSize: '10.5px' }}>Account Name:</span>
                <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                  {companyInfo.bank_account_name || 'SVI INFRA SOLUTIONS PVT. LTD.'}
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '10.5px' }}>Bank Name:</span>
                <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                  {companyInfo.bank_name || 'IDBI Bank Ltd.'}
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '10.5px' }}>A/C Number:</span>
                <p
                  style={{ margin: 0, fontWeight: 700, fontFamily: 'monospace', color: '#0a1628' }}
                >
                  {companyInfo.bank_account_no || '0894102000013837'}
                </p>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '10.5px' }}>IFSC Code:</span>
                <p
                  style={{ margin: 0, fontWeight: 700, fontFamily: 'monospace', color: '#0a1628' }}
                >
                  {companyInfo.bank_ifsc || 'IBKL0000894'}
                </p>
              </div>
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '10px',
                color: '#64748b',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '3px',
              }}
            >
              * UPI / Cheque / RTGS / NEFT in favor of{' '}
              <strong>SVI INFRA SOLUTIONS PVT. LTD.</strong> (UPI: 1000221207001410.7300007643@idbi)
            </p>
          </div>

          {/* Right Box: Key Project Highlights / Trust Badges */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0a1628"
                strokeWidth="2.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h4
                style={{
                  margin: 0,
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#0a1628',
                }}
              >
                Project Highlights &amp; Assurance
              </h4>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px 6px',
                fontSize: '10.5px',
                color: '#334155',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Gated &amp; Secured Society</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>30 &amp; 40 Ft. Wide Roads</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Electricity &amp; Water Lines</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Clear Title &amp; Immediate Registry</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TRANSPARENT BOOKING PROCESS BAR ───────────────────────────── */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '5px 12px',
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '10.5px',
          }}
        >
          <span
            style={{
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#0a1628',
              fontSize: '10px',
              letterSpacing: '0.05em',
            }}
          >
            4-Step Booking:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
            <span style={{ fontWeight: 600 }}>1. Plan Selection</span>
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span style={{ fontWeight: 600 }}>2. KYC &amp; Token (10%)</span>
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span style={{ fontWeight: 600 }}>3. Allotment Letter</span>
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span style={{ fontWeight: 600, color: '#0a1628' }}>4. Registry / Possession</span>
          </div>
        </div>

        {/* ── NOTES & TERMS SECTION ─────────────────────────────────────── */}
        <div style={{ marginBottom: 8 }}>
          {showCustomNotes && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderLeft: '3px solid #0a1628',
                borderRadius: '6px',
                padding: '6px 10px',
                marginBottom: 6,
                fontSize: '11px',
                color: '#334155',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
              }}
            >
              <strong
                style={{
                  fontSize: '10.5px',
                  color: '#0a1628',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '2px',
                }}
              >
                Special Remarks / Notes:
              </strong>
              {formData.notes}
            </div>
          )}

          <div style={{ fontSize: '10.5px', color: '#64748b', lineHeight: '1.45' }}>
            <p style={{ margin: '0 0 1px' }}>
              • <strong>Quotation Validity:</strong> Rates are valid until the specified date.
              Allotments are subject to unit availability.
            </p>
            <p style={{ margin: '0 0 1px' }}>
              • <strong>Statutory Charges:</strong> Government stamp duty, registration charges, and
              legal document fees are payable at the time of registry as per applicable state norms.
            </p>
            <p style={{ margin: 0 }}>
              • <strong>Agreement:</strong> Final terms and possession milestones are governed by
              the Builder-Buyer Agreement (BBA).
            </p>
          </div>
        </div>
        {/* ── SIGNATURE & FOOTER ────────────────────────────────────────── */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ fontSize: '10px', color: '#94a3b8', maxWidth: '360px' }}>
            <p style={{ margin: '0 0 1px', fontWeight: 600, color: '#64748b' }}>
              This is a verified computer-generated quotation document.
            </p>
            <p style={{ margin: 0 }}>
              For verification, contact support at {companyInfo.company_phone || '+91 9216014579'}.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1.5px solid #0a1628', width: 180, marginBottom: 3 }} />
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#0a1628', margin: 0 }}>
              For {companyInfo.company_name || 'SVI Infra Solutions Pvt. Ltd.'}
            </p>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '1px 0 0' }}>
              Authorized Signatory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
