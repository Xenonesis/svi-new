import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

export interface CustomerLedgerSummary {
  normalizedRefId: string;
  displayRefId: string;
  clientName: string;
  plotNo: string;
  plotSize: string;
  receiptsCount: number;
  totalPaid: number;
  agreedDealValue: number;
  balanceDue: number;
  percentCompleted: number;
  lastPaymentDate: string;
}

export interface CustomerLedgerDetail {
  normalizedRefId: string;
  displayRefId: string;
  clientName: string;
  plotNo: string;
  plotSize: string;
  receipts: SavedReceipt[];
  totalPaid: number;
  agreedDealValue: number;
  balanceDue: number;
  percentCompleted: number;
}

export function normalizeRefId(refId?: string): string {
  if (!refId) return '';
  return refId.replace(/[\s\-_]/g, '').toUpperCase();
}

export function groupReceiptsByRefId(
  receipts: SavedReceipt[],
  dealValuesMap: Record<string, number> = {}
): CustomerLedgerSummary[] {
  const map: Record<
    string,
    {
      displayRefId: string;
      clientName: string;
      plotNo: string;
      plotSize: string;
      receipts: SavedReceipt[];
      totalPaid: number;
      lastDate: string;
    }
  > = {};

  receipts.forEach((r) => {
    const rawRef = (r.form_data?.refId || '').trim();
    if (!rawRef) return;
    const norm = normalizeRefId(rawRef);
    if (!map[norm]) {
      map[norm] = {
        displayRefId: rawRef,
        clientName: r.form_data?.name || 'N/A',
        plotNo: r.form_data?.plotNo || '',
        plotSize: r.form_data?.plotSize || '',
        receipts: [],
        totalPaid: 0,
        lastDate: r.form_data?.date || r.created_at || '',
      };
    }
    const amount = parseFloat(r.form_data?.amount || '0') || 0;
    map[norm].totalPaid += amount;
    map[norm].receipts.push(r);
    const currDate = r.form_data?.date || r.created_at || '';
    if (currDate > map[norm].lastDate) {
      map[norm].lastDate = currDate;
    }
  });

  return Object.entries(map).map(([norm, data]) => {
    const dealVal = dealValuesMap[norm] || 0;
    const balance = dealVal > 0 ? Math.max(0, dealVal - data.totalPaid) : 0;
    const pct = dealVal > 0 ? Math.min(100, (data.totalPaid / dealVal) * 100) : 0;

    return {
      normalizedRefId: norm,
      displayRefId: data.displayRefId,
      clientName: data.clientName,
      plotNo: data.plotNo,
      plotSize: data.plotSize,
      receiptsCount: data.receipts.length,
      totalPaid: data.totalPaid,
      agreedDealValue: dealVal,
      balanceDue: balance,
      percentCompleted: Math.round(pct * 100) / 100,
      lastPaymentDate: data.lastDate,
    };
  });
}

export function calculateLedgerStatement(
  refId: string,
  receipts: SavedReceipt[],
  agreedDealValue = 0
): CustomerLedgerDetail {
  const norm = normalizeRefId(refId);
  const matched = receipts
    .filter((r) => normalizeRefId(r.form_data?.refId) === norm)
    .sort((a, b) => {
      const dateA = new Date(a.form_data?.date || a.created_at).getTime();
      const dateB = new Date(b.form_data?.date || b.created_at).getTime();
      return dateA - dateB; // chronological order
    });

  const totalPaid = matched.reduce(
    (sum, r) => sum + (parseFloat(r.form_data?.amount || '0') || 0),
    0
  );
  const balance = agreedDealValue > 0 ? Math.max(0, agreedDealValue - totalPaid) : 0;
  const pct = agreedDealValue > 0 ? Math.min(100, (totalPaid / agreedDealValue) * 100) : 0;
  const primary = matched[0];

  return {
    normalizedRefId: norm,
    displayRefId: refId,
    clientName: primary?.form_data?.name || 'N/A',
    plotNo: primary?.form_data?.plotNo || '',
    plotSize: primary?.form_data?.plotSize || '',
    receipts: matched,
    totalPaid,
    agreedDealValue,
    balanceDue: balance,
    percentCompleted: Math.round(pct * 100) / 100,
  };
}
