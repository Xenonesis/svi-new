import type {
  PricingTierCalculation,
  QuotationCalculationResult,
  QuotationFormData,
  QuotationMilestones,
} from '../../../../lib/quotation/types';
import { formatINR, formatDateDisplay } from '../../../../lib/quotation/format';
import { numberToIndianWords } from '../../../../lib/quotation/numberToIndianWords';

/** Calculate approx monthly installment for standard plans */
function getMonthlyEstimate(grandTotal: number, months: number): string {
  if (months <= 1) return 'Full Upfront (Zero Interest)';
  const emi = Math.round(grandTotal / months);
  return `≈ ${formatINR(emi)} / month`;
}
interface QuotationPricingTableProps {
  hasMultipleTiers: boolean;
  tierCalculations: PricingTierCalculation[];
  calculation: QuotationCalculationResult;
  formData: QuotationFormData;
  areaSqYds: number;
  amountInWords: string;
  milestones: QuotationMilestones;
}

export function QuotationPricingTable({
  hasMultipleTiers,
  tierCalculations,
  calculation,
  formData,
  areaSqYds,
  amountInWords,
  milestones,
}: QuotationPricingTableProps) {
  return (
    <>
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
                      {t.paymentMonths}-Month No-Cost EMI (70% Bal.): ≈{' '}
                      {formatINR(Math.ceil((t.grandTotal * 0.7) / parseInt(t.paymentMonths, 10)))} /
                      month
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
                const emiBalance = milestones.remainingAmount;
                const monthly = Math.ceil(emiBalance / months);
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
                        {months}-Month No-Cost Installment Plan (Remaining 70% Balance)
                      </span>
                      <span style={{ fontSize: '10px', color: '#F5D68A', fontWeight: 700 }}>
                        ≈ {formatINR(monthly)} / month (0% Interest)
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
                          const amt = isLast ? emiBalance - monthly * (months - 1) : monthly;
                          const cumulative = isLast ? emiBalance : monthly * (i + 1);
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
                            Total Remaining EMI Balance ({months} Installments)
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
                            {formatINR(emiBalance)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })()}
          </div>
      )}
    </>
  );
}
