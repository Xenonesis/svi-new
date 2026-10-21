import type { CompanyInfo, QuotationFormData } from '../../../../lib/quotation/types';
import { formatDateDisplay } from '../../../../lib/quotation/format';

interface QuotationHeaderProps {
  companyInfo: CompanyInfo;
  formData: QuotationFormData;
}

export function QuotationHeader({ companyInfo, formData }: QuotationHeaderProps) {
  return (
    <>
      {/* ── BRAND LETTERHEAD ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #07111e 0%, #0d1e36 50%, #0a1628 100%)',
          color: '#ffffff',
          padding: '13px 28px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(201, 168, 76, 0.25)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Brand Logo & Company Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              padding: '5px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(201, 168, 76, 0.35)',
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
                borderRadius: '6px',
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
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#d4af37',
                fontWeight: 700,
                marginTop: '3px',
              }}
            >
              Real Estate • Infrastructure • Developers
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
    </>
  );
}
