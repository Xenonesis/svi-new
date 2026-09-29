import type { AllotmentRecord } from './types';

export function exportAllotmentsToCSV(
  selectedAllotments: AllotmentRecord[],
  getAllotmentFinancials: (a: AllotmentRecord) => {
    ticketId: string;
    dealValue: number;
    totalPaid: number;
    balanceDue: number;
  }
) {
  if (selectedAllotments.length === 0) return;
  const rows = [
    [
      'Ref ID',
      'Unit Number',
      'Property',
      'Client Name',
      'Email',
      'Phone',
      'Deal Value',
      'Total Paid',
      'Balance Due',
    ],
    ...selectedAllotments.map((a) => {
      const fin = getAllotmentFinancials(a);
      return [
        fin.ticketId,
        a.unit_no || a.unit_number || '',
        a.properties?.name || '',
        a.profiles?.full_name || '',
        a.profiles?.email || '',
        a.profiles?.phone || '',
        fin.dealValue.toString(),
        fin.totalPaid.toString(),
        fin.balanceDue.toString(),
      ];
    }),
  ];
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `allotments_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
