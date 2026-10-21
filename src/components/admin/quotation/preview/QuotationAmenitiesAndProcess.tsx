import React from 'react';
import type { CompanyInfo } from '../../../../lib/quotation/types';

interface QuotationAmenitiesAndProcessProps {
  companyInfo: CompanyInfo;
}

export function QuotationAmenitiesAndProcess({ companyInfo }: QuotationAmenitiesAndProcessProps) {
  return (
    <>
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
            <span style={{ fontWeight: 600 }}>1. Draw / Selection</span>
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
            <span style={{ fontWeight: 600, color: '#b45309' }}>
              2. 10% Token (2–3 Days Post-Draw)
            </span>
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
            <span style={{ fontWeight: 600, color: '#b45309' }}>3. 20% Allotment (15–30 Days)</span>
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
            <span style={{ fontWeight: 600, color: '#15803d' }}>4. 70% Balance (No-Cost EMI)</span>
          </div>
      </div>
    </>
  );
}
