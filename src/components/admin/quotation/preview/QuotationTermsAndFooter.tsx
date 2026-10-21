import type { CompanyInfo, QuotationFormData } from '../../../../lib/quotation/types';

interface QuotationTermsAndFooterProps {
  formData: QuotationFormData;
  companyInfo: CompanyInfo;
  showCustomNotes: boolean;
}

export function QuotationTermsAndFooter({
  formData,
  companyInfo,
  showCustomNotes,
}: QuotationTermsAndFooterProps) {
  return (
    <>
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
          <p style={{ margin: '0 0 2px' }}>
            • <strong>Payment Schedule (10%):</strong> 10% of total payment should be payable within
            2–3 days after draw.
          </p>
          <p style={{ margin: '0 0 2px' }}>
            • <strong>Allotment Milestone (20%):</strong> Next 20% of payment should be payable
            within 15–30 days.
          </p>
          <p style={{ margin: '0 0 2px' }}>
            • <strong>Remaining Balance (70%):</strong> Next remaining amount will be counted on
            agreed EMI plan as per its rate/square yard.
          </p>
          <p style={{ margin: '0 0 2px' }}>
            • <strong>No-Cost EMI Guarantee:</strong> EMI will be 100% No-Cost EMI (0% interest,
            zero hidden finance charges).
          </p>
          <p style={{ margin: '0 0 2px' }}>
            • <strong>Quotation Validity:</strong> Rates are valid until the specified date.
            Allotments are subject to unit availability.
          </p>
          <p style={{ margin: 0 }}>
            • <strong>Statutory Charges &amp; Agreement:</strong> Government stamp duty,
            registration charges, and legal document fees are payable at the time of registry as per
            applicable state norms. Final terms governed by Builder-Buyer Agreement (BBA).
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
    </>
  );
}
