import type { jsPDF } from 'jspdf';
import type { ExecutiveDashboardData } from '@/app/api/admin/dashboard/executive/route';

export async function generateExecutiveDossierPdf(data: ExecutiveDashboardData): Promise<jsPDF> {
  // Heavy PDF generation library is dynamically imported to avoid bundling in the initial page payload.
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(212, 175, 55); // Brand Gold (#d4af37)
  doc.text('SHRINATHJI VEDIC INDIA', 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text('Executive Management Daily Dossier', 14, 28);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 34);

  // Gold horizontal divider
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);

  // Section 1: Operational Key Performance Indicators
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text('1. Operational Key Performance Indicators', 14, 48);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `• Total Collections: Rs. ${(data.kpis.totalCollections / 100000).toFixed(2)} Lakhs`,
    18,
    56
  );
  doc.text(
    `• Active Sales Pipeline: ${data.kpis.activeLeads} Leads (${data.kpis.hotLeadsCount} Hot)`,
    18,
    62
  );
  doc.text(
    `• Plot Inventory: ${data.kpis.bookedPlots} / ${data.kpis.totalPlots} Units Allotted`,
    18,
    68
  );
  doc.text(
    `• Workforce Attendance: ${data.kpis.onDutyStaff} / ${data.kpis.totalStaff} On-Duty (${data.kpis.attendanceRate}%)`,
    18,
    74
  );

  // Section 2: Monthly Revenue Target & Run-Rate
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text('2. Monthly Revenue Target & Run-Rate', 14, 88);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `• Target: Rs. ${(data.target.monthlyTarget / 100000).toFixed(1)} Lakhs | Achieved: ${data.target.percentage}%`,
    18,
    96
  );
  doc.text(`• Pacing Status: ${data.target.status.toUpperCase()}`, 18, 102);

  // Section 3: Operational Attention & Triage Summary
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text('3. Operational Attention & Triage Summary', 14, 116);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `• Pending Unverified Receipts: ${data.urgentActions.unverifiedReceipts.length} item(s)`,
    18,
    124
  );
  doc.text(
    `• Hot Leads Awaiting Triage: ${data.urgentActions.hotLeadsPending.length} lead(s)`,
    18,
    130
  );
  doc.text(
    `• Pending Leave Requests: ${data.urgentActions.pendingLeaves.length} request(s)`,
    18,
    136
  );

  return doc;
}

export async function exportExecutiveDossier(data: ExecutiveDashboardData): Promise<void> {
  const doc = await generateExecutiveDossierPdf(data);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`SVI_Executive_Dossier_${dateStr}.pdf`);
}
