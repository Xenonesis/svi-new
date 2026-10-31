import { SavedReceipt } from '@/src/components/admin/payment-receipts/ReceiptTypes';

export type ReceiptPaymentStatus = 'paid' | 'pending' | 'bounced';

export function getReceiptPaymentStatus(r: SavedReceipt): ReceiptPaymentStatus {
  if (r.metadata?.is_trashed) return 'bounced';
  const rawStatus = String(
    r.form_data?.paymentStatus || r.metadata?.payment_status || ''
  ).toLowerCase();
  if (rawStatus === 'bounced') return 'bounced';
  if (rawStatus === 'pending' || rawStatus === 'pending_clearance' || rawStatus === 'unpaid') {
    return 'pending';
  }
  if (r.form_data?.isPaid === false) return 'pending';
  if (r.status === 'draft' && (r.metadata?.pdc || rawStatus.includes('pending'))) {
    return 'pending';
  }
  const ref = (r.form_data?.paymentRef || '').toLowerCase();
  const method = (r.form_data?.paymentMethod || '').toLowerCase();
  if ((ref.includes('pdc') || method.includes('pdc')) && r.status === 'draft') {
    return 'pending';
  }
  return 'paid';
}

export function isReceiptPDC(r: SavedReceipt): boolean {
  if (r.metadata?.pdc) return true;
  const method = String(r.form_data?.paymentMethod || '').toLowerCase();
  const ref = String(r.form_data?.paymentRef || '').toLowerCase();
  const status = String(
    r.form_data?.paymentStatus || r.metadata?.payment_status || ''
  ).toLowerCase();
  return method.includes('pdc') || ref.includes('pdc') || status.includes('pending');
}

export interface CustomerLedgerSummary {
  normalizedRefId: string;
  displayRefId: string;
  clientName: string;
  plotNo: string;
  plotSize: string;
  receiptsCount: number;
  totalPaid: number;
  totalPdcPending?: number;
  agreedDealValue: number;
  balanceDue: number;
  percentCompleted: number;
  lastPaymentDate: string;
  ratePerSqYd?: number;
}

export interface CustomerLedgerDetail {
  normalizedRefId: string;
  displayRefId: string;
  clientName: string;
  plotNo: string;
  plotSize: string;
  receipts: SavedReceipt[];
  totalPaid: number;
  totalPdcPending?: number;
  agreedDealValue: number;
  balanceDue: number;
  percentCompleted: number;
  ratePerSqYd?: number;
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
      totalPdcPending: number;
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
        totalPdcPending: 0,
        lastDate: r.form_data?.date || r.created_at || '',
      };
    }
    const amount = parseFloat(r.form_data?.amount || '0') || 0;
    const status = getReceiptPaymentStatus(r);
    if (status === 'paid') {
      map[norm].totalPaid += amount;
    } else if (status === 'pending') {
      map[norm].totalPdcPending += amount;
    }
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
    const areaNum = parseFloat(String(data.plotSize || '').replace(/[^\d.]/g, '')) || 0;
    const ratePerSqYd =
      areaNum > 0 && dealVal > 0 ? Math.round((dealVal / areaNum) * 100) / 100 : 0;

    return {
      normalizedRefId: norm,
      displayRefId: data.displayRefId,
      clientName: data.clientName,
      plotNo: data.plotNo,
      plotSize: data.plotSize,
      receiptsCount: data.receipts.length,
      totalPaid: data.totalPaid,
      totalPdcPending: data.totalPdcPending,
      agreedDealValue: dealVal,
      balanceDue: balance,
      percentCompleted: Math.round(pct * 100) / 100,
      lastPaymentDate: data.lastDate,
      ratePerSqYd,
    };
  });
}

export function calculateLedgerStatement(
  refId: string,
  receipts: SavedReceipt[],
  agreedDealValue = 0,
  overridePlotArea?: string | number | null
): CustomerLedgerDetail {
  const norm = normalizeRefId(refId);
  const cleanPlot = norm.replace(/^PLOT/, '');
  const matched = receipts
    .filter((r) => {
      const rRef = normalizeRefId(r.form_data?.refId);
      const rPlot = normalizeRefId(r.form_data?.plotNo);
      if (rRef && rRef === norm) return true;
      if (rRef && cleanPlot && (rRef === `PLOT${cleanPlot}` || rRef === cleanPlot)) return true;
      if (cleanPlot && rPlot && (rPlot === cleanPlot || rPlot === `PLOT${cleanPlot}`)) return true;
      return false;
    })
    .sort((a, b) => {
      const dateA = new Date(a.form_data?.date || a.created_at).getTime();
      const dateB = new Date(b.form_data?.date || b.created_at).getTime();
      return dateA - dateB;
    });

  let totalPaid = 0;
  let totalPdcPending = 0;
  matched.forEach((r) => {
    const amt = parseFloat(r.form_data?.amount || '0') || 0;
    const status = getReceiptPaymentStatus(r);
    if (status === 'paid') {
      totalPaid += amt;
    } else if (status === 'pending') {
      totalPdcPending += amt;
    }
  });
  const balance = agreedDealValue > 0 ? Math.max(0, agreedDealValue - totalPaid) : 0;
  const pct = agreedDealValue > 0 ? Math.min(100, (totalPaid / agreedDealValue) * 100) : 0;
  const primary = matched[0];
  const matchedSize = matched.find((r) => r.form_data?.plotSize)?.form_data?.plotSize;
  const finalPlotSize =
    (overridePlotArea ? String(overridePlotArea) : '') ||
    matchedSize ||
    primary?.form_data?.plotSize ||
    '';
  const areaNum = parseFloat(String(finalPlotSize).replace(/[^\d.]/g, '')) || 0;
  const ratePerSqYd =
    areaNum > 0 && agreedDealValue > 0 ? Math.round((agreedDealValue / areaNum) * 100) / 100 : 0;

  return {
    normalizedRefId: norm,
    displayRefId: refId,
    clientName: primary?.form_data?.name || 'N/A',
    plotNo: primary?.form_data?.plotNo || '',
    plotSize: finalPlotSize,
    receipts: matched,
    totalPaid,
    totalPdcPending,
    agreedDealValue,
    balanceDue: balance,
    percentCompleted: Math.round(pct * 100) / 100,
    ratePerSqYd,
  };
}
