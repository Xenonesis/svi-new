import type { QuotationFormData } from '../../../../lib/quotation/types';

interface QuotationCustomerPropertyCardsProps {
  formData: QuotationFormData;
  areaSqYds: number;
  areaSqFt: number;
}

export function QuotationCustomerPropertyCards({
  formData,
  areaSqYds,
  areaSqFt,
}: QuotationCustomerPropertyCardsProps) {
  return (
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
  );
}
