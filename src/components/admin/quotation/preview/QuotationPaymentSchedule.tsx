import type { QuotationMilestones } from '../../../../lib/quotation/types';
import { formatINR } from '../../../../lib/quotation/format';

interface QuotationPaymentScheduleProps {
  milestones: QuotationMilestones;
  grandTotal: number;
  paymentMonths?: string;
}

export function QuotationPaymentSchedule({
  milestones,
  grandTotal,
  paymentMonths,
}: QuotationPaymentScheduleProps) {
  return (
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            overflow: 'hidden',
            background: '#ffffff',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              background: '#0a1628',
              color: '#ffffff',
              padding: '6px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Payment Milestones &amp; Schedule
            </span>
            <span
              style={{
                background: '#16a34a',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '10px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              ✓ 100% No-Cost EMI (0% Interest)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1.2fr',
              background: '#f8fafc',
            }}
          >
            <div style={{ padding: '8px 12px', borderRight: '1px solid #e2e8f0' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 2,
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
                  Stage 1: 10% Draw Token
                </span>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#b45309' }}>
                  {formatINR(milestones.tokenAmount)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '9.5px', color: '#64748b', lineHeight: 1.35 }}>
                Payable within <strong>2–3 days after draw</strong>.
              </p>
            </div>

            <div style={{ padding: '8px 12px', borderRight: '1px solid #e2e8f0' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 2,
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
                  Stage 2: 20% Confirmation
                </span>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#b45309' }}>
                  {formatINR(milestones.allotmentAmount)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '9.5px', color: '#64748b', lineHeight: 1.35 }}>
                Payable within <strong>15–30 days</strong>.
              </p>
            </div>

            <div style={{ padding: '8px 12px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 2,
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
                  Stage 3: 70% Remaining
                </span>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#15803d' }}>
                  {formatINR(milestones.remainingAmount)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '9.5px', color: '#64748b', lineHeight: 1.35 }}>
                Structured on agreed EMI plan as per rate/sq. yd
                {milestones.monthlyEmiOnRemaining
                  ? ` (≈ ${formatINR(milestones.monthlyEmiOnRemaining)} / mo)`
                  : ' (No-Cost EMI)'}
                .
              </p>
            </div>
          </div>
        </div>

  );
}
