import Image from 'next/image';
import type { CompanyInfo } from '@/src/lib/quotation/types';

interface QuotationDocumentHeaderProps {
  companyInfo: CompanyInfo;
}

export function QuotationDocumentHeader({ companyInfo }: QuotationDocumentHeaderProps) {
  return (
    <div>
      <div
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2040 60%, #122b55 100%)',
          color: '#ffffff',
          padding: '16px 26px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              backgroundColor: '#ffffff',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <Image
              src="/logo.png"
              alt={companyInfo.company_name || 'SVI Infra Solutions'}
              width={42}
              height={42}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#ffffff',
                fontFamily: 'Georgia, serif',
              }}
            >
              {companyInfo.company_name}
            </div>
            <div
              style={{
                fontSize: '10.5px',
                color: '#C9A84C',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              Building Trust · Delivering Excellence
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '11.5px' }}>
          <div style={{ color: '#cbd5e1', lineHeight: '1.4' }}>{companyInfo.company_address}</div>
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              marginTop: 4,
              flexWrap: 'wrap',
              fontSize: '11px',
            }}
          >
            {companyInfo.company_phone && (
              <span
                style={{
                  color: '#e2e8f0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {companyInfo.company_phone}
              </span>
            )}
            {companyInfo.company_email && (
              <span
                style={{
                  color: '#e2e8f0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {companyInfo.company_email}
              </span>
            )}
            {companyInfo.company_website && (
              <span
                style={{
                  color: '#C9A84C',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
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
    </div>
  );
}
