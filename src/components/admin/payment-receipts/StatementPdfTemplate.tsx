'use client';

import React from 'react';
import Image from 'next/image';
import { CustomerLedgerDetail } from '@/src/lib/receipt/receiptLedger';

interface StatementPdfTemplateProps {
  id: string;
  ledger: CustomerLedgerDetail;
  advisorName?: string;
  plotArea?: number | string | null;
  ratePerSqYd?: number | string | null;
}

export function StatementPdfTemplate({
  id,
  ledger,
  advisorName = 'Direct / SVI Official',
  plotArea,
  ratePerSqYd,
}: StatementPdfTemplateProps) {
  const plotSizeNum =
    parseFloat(String(plotArea || ledger.plotSize || '0').replace(/[^\d.]/g, '')) || 0;
  const rateNum =
    parseFloat(String(ratePerSqYd || ledger.ratePerSqYd || '0').replace(/[^\d.]/g, '')) || 0;
  const agreedDealValue =
    ledger.agreedDealValue > 0
      ? ledger.agreedDealValue
      : plotSizeNum > 0 && rateNum > 0
        ? Math.round(plotSizeNum * rateNum)
        : 0;

  const calcBalance = Math.max(0, agreedDealValue - ledger.totalPaid);

  const receiptsList = [...ledger.receipts].sort((a, b) => {
    const dateA = new Date(a.form_data?.date || a.created_at).getTime();
    const dateB = new Date(b.form_data?.date || b.created_at).getTime();
    return dateA - dateB;
  });

  const tableDataRowCount = Math.max(3, receiptsList.length);

  const formatDate = (raw?: string) => {
    if (!raw) return '—';
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = String(d.getFullYear()).slice(-2);
        return `${day}.${month}.${year}`;
      }
    } catch {
      // Ignore
    }
    return raw;
  };

  const formatINR = (val: number) =>
    val.toLocaleString('en-IN', {
      maximumFractionDigits: val % 1 === 0 ? 0 : 2,
    });

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      id={id}
      data-pdf-page="true"
      style={{
        width: '1000px',
        minHeight: '680px',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Calibri, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        padding: '36px 40px',
        boxSizing: 'border-box',
        position: 'absolute',
        left: '-9999px',
        top: 0,
      }}
    >
      {/* Top Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #D4AF37',
          paddingBottom: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <img
            src="/logo.png"
            alt="SVI Logo"
            style={{ width: '130px', height: '48px', objectFit: 'contain' }}
          />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 900,
                color: '#0F2942',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              SHREE VENKATESHWARA INFRASTRUCTURE PVT. LTD.
            </h1>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '12px',
                fontWeight: 700,
                color: '#C59A45',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Customer Payment Statement & Ledger
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '10.5px', color: '#666666' }}>
              Corporate Office: Block E-220, 2nd Floor, Sector 63, Noida, Uttar Pradesh 201309 •
              www.sviinfrasolutions.com
            </p>
          </div>
        </div>

        <div
          style={{
            textAlign: 'right',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '8px 14px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>REFERENCE ID</div>
          <div
            style={{
              fontSize: '13px',
              fontFamily: 'monospace',
              fontWeight: 800,
              color: '#0F2942',
            }}
          >
            {ledger.displayRefId}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
            Date: {todayStr}
          </div>
        </div>
      </div>

      {/* Main Statement Table matching Abhilasha's Delhi Office format */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '11.5px',
          textAlign: 'center',
          marginBottom: '24px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#F2F4F7' }}>
            <th
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                width: '19%',
                fontWeight: 800,
                fontSize: '11px',
              }}
            >
              NAME OF CLIENT
            </th>
            <th
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                width: '10%',
                fontWeight: 800,
                fontSize: '11px',
              }}
            >
              PLOT NO.
            </th>
            <th
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                width: '10%',
                fontWeight: 800,
                fontSize: '11px',
              }}
            >
              PLOT SIZE
            </th>
            <th
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                width: '9%',
                fontWeight: 800,
                fontSize: '11px',
              }}
            >
              RATE
            </th>
            <th
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                width: '13%',
                fontWeight: 800,
                fontSize: '11px',
              }}
            >
              PLOT AMT.
            </th>
            <th
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                width: '14%',
                fontWeight: 800,
                fontSize: '11px',
              }}
            >
              DRAW DATE
            </th>
            <th
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                width: '12%',
                fontWeight: 800,
                fontSize: '11px',
              }}
            >
              AMOUNT
            </th>
            <th
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                width: '13%',
                fontWeight: 800,
                fontSize: '11px',
              }}
            >
              ADVISOR
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Row 1: Client Name, Plot Details, First Receipt, Advisor Start */}
          <tr>
            <td
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'uppercase',
              }}
            >
              {ledger.clientName}
            </td>
            <td
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                fontWeight: 800,
                fontSize: '12px',
              }}
            >
              {ledger.plotNo || '—'}
            </td>
            <td
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                fontWeight: 800,
                fontSize: '12px',
              }}
            >
              {plotSizeNum > 0 ? plotSizeNum : ledger.plotSize || '—'}
            </td>
            <td
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                fontWeight: 800,
                fontSize: '12px',
              }}
            >
              {rateNum > 0 ? rateNum : '—'}
            </td>
            <td
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                fontWeight: 800,
                fontSize: '12px',
              }}
            >
              {agreedDealValue > 0 ? formatINR(agreedDealValue) : '—'}
            </td>
            <td
              style={{
                borderLeft: '2px solid #000000',
                borderRight: '2px solid #000000',
                borderTop: '1px solid #000000',
                borderBottom: '1px solid #000000',
                padding: '8px 6px',
                fontWeight: 700,
              }}
            >
              {receiptsList[0]
                ? formatDate(receiptsList[0].form_data?.date || receiptsList[0].created_at)
                : '—'}
            </td>
            <td
              style={{
                borderRight: '2px solid #000000',
                borderTop: '1px solid #000000',
                borderBottom: '1px solid #000000',
                padding: '8px 6px',
                fontWeight: 700,
              }}
            >
              {receiptsList[0]
                ? formatINR(parseFloat(receiptsList[0].form_data?.amount || '0') || 0)
                : '—'}
            </td>
            {/* Merged Advisor Column spanning all rows down to the total summary row */}
            <td
              rowSpan={tableDataRowCount + 1}
              style={{
                border: '2px solid #000000',
                padding: '12px 6px',
                fontWeight: 800,
                fontSize: '12px',
                verticalAlign: 'middle',
                backgroundColor: '#FAFAFA',
              }}
            >
              {advisorName}
            </td>
          </tr>

          {/* Row 2: TOTAL REC. AMOUNT */}
          <tr>
            <td style={{ borderLeft: '2px solid #000000', padding: '6px' }} />
            <td
              colSpan={3}
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                fontWeight: 800,
                fontSize: '12px',
                letterSpacing: '0.5px',
              }}
            >
              TOTAL REC. AMOUNT
            </td>
            <td
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                fontWeight: 800,
                fontSize: '12px',
              }}
            >
              {formatINR(ledger.totalPaid)}
            </td>
            <td
              style={{
                borderLeft: '2px solid #000000',
                borderRight: '2px solid #000000',
                borderTop: '1px solid #000000',
                borderBottom: '1px solid #000000',
                padding: '8px 6px',
                fontWeight: 700,
              }}
            >
              {receiptsList[1]
                ? formatDate(receiptsList[1].form_data?.date || receiptsList[1].created_at)
                : ''}
            </td>
            <td
              style={{
                borderRight: '2px solid #000000',
                borderTop: '1px solid #000000',
                borderBottom: '1px solid #000000',
                padding: '8px 6px',
                fontWeight: 700,
              }}
            >
              {receiptsList[1]
                ? formatINR(parseFloat(receiptsList[1].form_data?.amount || '0') || 0)
                : ''}
            </td>
          </tr>

          {/* Row 3: BALANCE */}
          <tr>
            <td style={{ borderLeft: '2px solid #000000', padding: '6px' }} />
            <td
              colSpan={3}
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                fontWeight: 800,
                fontSize: '12px',
                letterSpacing: '0.5px',
              }}
            >
              BALANCE
            </td>
            <td
              style={{
                border: '2px solid #000000',
                padding: '8px 6px',
                fontWeight: 800,
                fontSize: '12px',
              }}
            >
              {formatINR(calcBalance)}
            </td>
            <td
              style={{
                borderLeft: '2px solid #000000',
                borderRight: '2px solid #000000',
                borderTop: '1px solid #000000',
                borderBottom: '1px solid #000000',
                padding: '8px 6px',
                fontWeight: 700,
              }}
            >
              {receiptsList[2]
                ? formatDate(receiptsList[2].form_data?.date || receiptsList[2].created_at)
                : ''}
            </td>
            <td
              style={{
                borderRight: '2px solid #000000',
                borderTop: '1px solid #000000',
                borderBottom: '1px solid #000000',
                padding: '8px 6px',
                fontWeight: 700,
              }}
            >
              {receiptsList[2]
                ? formatINR(parseFloat(receiptsList[2].form_data?.amount || '0') || 0)
                : ''}
            </td>
          </tr>

          {/* Subsequent rows if more receipts exist */}
          {receiptsList.slice(3).map((r, i) => (
            <tr key={r.id || i}>
              <td style={{ borderLeft: '2px solid #000000', padding: '6px' }} />
              <td colSpan={3} />
              <td />
              <td
                style={{
                  borderLeft: '2px solid #000000',
                  borderRight: '2px solid #000000',
                  borderTop: '1px solid #000000',
                  borderBottom: '1px solid #000000',
                  padding: '8px 6px',
                  fontWeight: 700,
                }}
              >
                {formatDate(r.form_data?.date || r.created_at)}
              </td>
              <td
                style={{
                  borderRight: '2px solid #000000',
                  borderTop: '1px solid #000000',
                  borderBottom: '1px solid #000000',
                  padding: '8px 6px',
                  fontWeight: 700,
                }}
              >
                {formatINR(parseFloat(r.form_data?.amount || '0') || 0)}
              </td>
            </tr>
          ))}

          {/* Summary Row: TOTAL AMT. REC. */}
          <tr>
            <td style={{ borderLeft: '2px solid #000000', padding: '6px' }} />
            <td colSpan={3} />
            <td />
            <td
              style={{
                border: '2px solid #000000',
                padding: '9px 6px',
                fontWeight: 900,
                fontSize: '12.5px',
                backgroundColor: '#F8FAFC',
              }}
            >
              TOTAL AMT. REC.
            </td>
            <td
              style={{
                border: '2px solid #000000',
                padding: '9px 6px',
                fontWeight: 900,
                fontSize: '12.5px',
                backgroundColor: '#F8FAFC',
              }}
            >
              {formatINR(ledger.totalPaid)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer Notes & Signatures */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginTop: '36px',
          borderTop: '1px solid #E2E8F0',
          paddingTop: '20px',
        }}
      >
        <div style={{ maxWidth: '60%' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#0F2942',
              textTransform: 'uppercase',
            }}
          >
            Terms & Verification Notice:
          </div>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '10px',
              lineHeight: 1.5,
              color: '#64748B',
            }}
          >
            This statement reflects all reconciled payment credits and agreed allotment valuation as
            per SVI Infra Solutions accounts records. Subject to terms in the Builder Buyer
            Agreement (BBA) and Allotment Letter.
          </p>
        </div>

        <div style={{ textAlign: 'center', width: '200px' }}>
          <div
            style={{
              borderBottom: '1px solid #000000',
              width: '160px',
              margin: '0 auto 6px',
              height: '35px',
            }}
          />
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F2942' }}>
            Authorized Signatory
          </div>
          <div style={{ fontSize: '9.5px', color: '#64748B' }}>SVI Infra Solutions Pvt. Ltd.</div>
        </div>
      </div>
    </div>
  );
}
