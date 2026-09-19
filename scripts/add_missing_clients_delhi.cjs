const ExcelJS = require('exceljs');
const fs = require('fs');

async function addMissingClientsToDelhi() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('DELHI OFFICE STATEMENT (1).xlsx');

  console.log('Current worksheets in Delhi file:', wb.worksheets.map(w => w.name));

  const borderMedium = {
    top: { style: 'medium' },
    left: { style: 'medium' },
    bottom: { style: 'medium' },
    right: { style: 'medium' }
  };

  const borderThin = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  const borderRedMedium = {
    top: { style: 'medium', color: { argb: 'FFFF0000' } },
    left: { style: 'medium', color: { argb: 'FFFF0000' } },
    bottom: { style: 'medium', color: { argb: 'FFFF0000' } },
    right: { style: 'medium', color: { argb: 'FFFF0000' } }
  };

  function createClientSheet(config) {
    // Remove if sheet already exists to avoid duplicate
    const existing = wb.getWorksheet(config.sheetName);
    if (existing) {
      wb.removeWorksheet(existing.id);
    }

    const ws = wb.addWorksheet(config.sheetName);

    if (config.isRefund) {
      ws.properties.tabColor = { argb: 'FFFF0000' }; // Bright red tab
    }

    // Set column widths
    ws.getColumn(1).width = 23;
    ws.getColumn(2).width = 13;
    ws.getColumn(3).width = 13;
    ws.getColumn(4).width = 9;
    ws.getColumn(5).width = 15;
    ws.getColumn(6).width = 23;
    ws.getColumn(7).width = 15;
    ws.getColumn(8).width = 16;

    // Row 1: Headers
    const headers = ['NAME OF CLIENT', 'PLOT NO.', 'PLOT SIZE', 'RATE', 'PLOT AMT.', 'DRAW DATE', 'AMOUNT', 'AGENT'];
    const r1 = ws.getRow(1);
    r1.height = 28;
    for (let c = 1; c <= 8; c++) {
      const cell = r1.getCell(c);
      cell.value = headers[c - 1];
      cell.font = { name: 'Calibri', size: 12, bold: true };
      cell.border = borderMedium;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: config.isRefund ? 'FFFFEAEA' : 'FFF0F4F8' }
      };
    }

    // Row 2: Client Info & 1st Payment
    const r2 = ws.getRow(2);
    r2.height = 24;
    
    // Client Name
    r2.getCell(1).value = config.clientName;
    r2.getCell(1).font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: config.isRefund ? 'FFCC0000' : 'FF000000' }
    };
    r2.getCell(1).border = borderMedium;
    r2.getCell(1).alignment = { vertical: 'middle' };

    // Plot No
    r2.getCell(2).value = config.plotNo;
    r2.getCell(2).font = { name: 'Calibri', size: 11, bold: true };
    r2.getCell(2).border = borderMedium;
    r2.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

    // Plot Size
    r2.getCell(3).value = config.plotSize;
    r2.getCell(3).font = { name: 'Calibri', size: 11, bold: true };
    r2.getCell(3).border = borderMedium;
    r2.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };

    // Rate
    r2.getCell(4).value = config.rate;
    r2.getCell(4).font = { name: 'Calibri', size: 11, bold: true };
    r2.getCell(4).border = borderMedium;
    r2.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };

    // Plot Amt
    r2.getCell(5).value = { formula: 'C2*D2', result: config.plotAmt };
    r2.getCell(5).font = { name: 'Calibri', size: 11, bold: true };
    r2.getCell(5).border = borderMedium;
    r2.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };

    // Draw Date / 1st Payment
    r2.getCell(6).value = config.receipts[0] ? config.receipts[0].date : '';
    r2.getCell(6).font = { name: 'Calibri', size: 11, bold: true };
    r2.getCell(6).border = borderMedium;
    r2.getCell(6).alignment = { vertical: 'middle' };

    r2.getCell(7).value = config.receipts[0] ? config.receipts[0].amount : 0;
    r2.getCell(7).font = { name: 'Calibri', size: 11, bold: true };
    r2.getCell(7).border = borderMedium;
    r2.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };

    // Agent (will be merged H2:H11)
    r2.getCell(8).value = config.agent;
    r2.getCell(8).font = { name: 'Calibri', size: 11, bold: true };
    r2.getCell(8).border = borderMedium;
    r2.getCell(8).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    // Row 3: Total Rec. Amount (Merged B3:D3) & 2nd Payment
    const r3 = ws.getRow(3);
    r3.height = 24;
    ws.mergeCells('B3:D3');
    const b3 = r3.getCell(2);
    b3.value = 'TOTAL REC. AMOUNT';
    b3.font = { name: 'Calibri', size: 11, bold: true };
    b3.border = borderMedium;
    b3.alignment = { horizontal: 'center', vertical: 'middle' };

    // Also set borders on merged cells C3, D3
    r3.getCell(3).border = borderMedium;
    r3.getCell(4).border = borderMedium;

    r3.getCell(5).value = { formula: 'G11', result: config.totalRec };
    r3.getCell(5).font = { name: 'Calibri', size: 11, bold: true };
    r3.getCell(5).border = borderMedium;
    r3.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };

    r3.getCell(6).value = config.receipts[1] ? config.receipts[1].date : '';
    r3.getCell(6).font = { name: 'Calibri', size: 11, bold: true };
    r3.getCell(6).border = borderMedium;
    r3.getCell(6).alignment = { vertical: 'middle' };

    r3.getCell(7).value = config.receipts[1] ? config.receipts[1].amount : null;
    r3.getCell(7).font = { name: 'Calibri', size: 11, bold: true };
    r3.getCell(7).border = borderMedium;
    r3.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };

    // Row 4: Balance (Merged B4:D4) & 3rd Payment
    const r4 = ws.getRow(4);
    r4.height = 24;
    ws.mergeCells('B4:D4');
    const b4 = r4.getCell(2);
    b4.value = 'BALANCE';
    b4.font = { name: 'Calibri', size: 11, bold: true };
    b4.border = borderMedium;
    b4.alignment = { horizontal: 'center', vertical: 'middle' };

    r4.getCell(3).border = borderMedium;
    r4.getCell(4).border = borderMedium;

    r4.getCell(5).value = { formula: 'E2-E3', result: config.balance };
    r4.getCell(5).font = { name: 'Calibri', size: 11, bold: true };
    r4.getCell(5).border = borderMedium;
    r4.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };

    r4.getCell(6).value = config.receipts[2] ? config.receipts[2].date : (config.emiLabels ? config.emiLabels[0] : '');
    r4.getCell(6).font = { name: 'Calibri', size: 11, bold: true };
    r4.getCell(6).border = borderMedium;
    r4.getCell(6).alignment = { vertical: 'middle' };

    r4.getCell(7).value = config.receipts[2] ? config.receipts[2].amount : null;
    r4.getCell(7).font = { name: 'Calibri', size: 11, bold: true };
    r4.getCell(7).border = borderMedium;
    r4.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };

    // Rows 5 to 10 (Receipts / EMIs)
    for (let rowIdx = 5; rowIdx <= 10; rowIdx++) {
      const recIdx = rowIdx - 2; // Row 5 is receipt 4 (index 3)
      const r = ws.getRow(rowIdx);
      r.height = 22;
      const rec = config.receipts[recIdx];
      const emiLabel = config.emiLabels && config.emiLabels[recIdx - 2] ? config.emiLabels[recIdx - 2] : '';

      r.getCell(6).value = rec ? rec.date : emiLabel;
      r.getCell(6).font = { name: 'Calibri', size: 11, bold: true };
      r.getCell(6).border = borderMedium;
      r.getCell(6).alignment = { vertical: 'middle' };

      r.getCell(7).value = rec ? rec.amount : null;
      r.getCell(7).font = { name: 'Calibri', size: 11, bold: true };
      r.getCell(7).border = borderMedium;
      r.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
    }

    // Row 11: Total Amount Received
    const r11 = ws.getRow(11);
    r11.height = 26;
    r11.getCell(6).value = 'TOTAL AMT. REC.';
    r11.getCell(6).font = { name: 'Calibri', size: 13, bold: true };
    r11.getCell(6).border = borderMedium;
    r11.getCell(6).alignment = { vertical: 'middle' };

    r11.getCell(7).value = { formula: 'SUM(G2:G10)', result: config.totalRec };
    r11.getCell(7).font = { name: 'Calibri', size: 13, bold: true };
    r11.getCell(7).border = borderMedium;
    r11.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };

    // Merge Agent column H2:H11
    ws.mergeCells('H2:H11');
    for (let r = 2; r <= 11; r++) {
      ws.getRow(r).getCell(8).border = borderMedium;
    }

    // If REFUND DONE: Add prominent Red Status Banner in Row 5 (A5:E5)
    if (config.isRefund) {
      ws.mergeCells('A5:E5');
      const refundCell = ws.getRow(5).getCell(1);
      refundCell.value = '⚠ REFUND DONE';
      refundCell.font = {
        name: 'Calibri',
        size: 14,
        bold: true,
        color: { argb: 'FFFF0000' } // RED TEXT
      };
      refundCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE0E0' } // LIGHT RED BACKGROUND
      };
      refundCell.border = borderRedMedium;
      refundCell.alignment = { horizontal: 'center', vertical: 'middle' };

      for (let c = 1; c <= 5; c++) {
        ws.getRow(5).getCell(c).border = borderRedMedium;
      }

      // Also add a note banner in Row 6 (A6:E6)
      ws.mergeCells('A6:E6');
      const refundNoteCell = ws.getRow(6).getCell(1);
      refundNoteCell.value = 'STATUS: FULL REFUND PROCESSED';
      refundNoteCell.font = {
        name: 'Calibri',
        size: 10,
        bold: true,
        color: { argb: 'FFCC0000' }
      };
      refundNoteCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFEFEF' }
      };
      refundNoteCell.border = borderRedMedium;
      refundNoteCell.alignment = { horizontal: 'center', vertical: 'middle' };
      for (let c = 1; c <= 5; c++) {
        ws.getRow(6).getCell(c).border = borderRedMedium;
      }
    }
  }

  // 1. P.NO. 36: RISHU MISHRA (Active)
  createClientSheet({
    sheetName: 'P.NO. 36',
    clientName: 'RISHU MISHRA',
    plotNo: 36,
    plotSize: 100,
    rate: 5500,
    plotAmt: 550000,
    agent: 'LUV KUMAR',
    totalRec: 153126,
    balance: 396874,
    isRefund: false,
    receipts: [
      { date: '22.3.26 (10%)', amount: 55000 },
      { date: '1.4.26 (20%)', amount: 50000 },
      { date: '2.6.26 (1ST EMI)', amount: 16042 },
      { date: '9.7.26 (2ND EMI)', amount: 16042 },
      { date: '4.9.26 (3RD EMI)', amount: 16042 },
    ],
    emiLabels: ['(4TH EMI)', '(5TH EMI)', '(6TH EMI)', '(7TH EMI)']
  });
  console.log('Added Sheet: P.NO. 36 (RISHU MISHRA)');

  // 2. P.NO. 50: MANISH (Refund Done - In RED)
  createClientSheet({
    sheetName: 'P.NO. 50',
    clientName: 'MANISH (REFUND DONE)',
    plotNo: 50,
    plotSize: 131.64,
    rate: 5000,
    plotAmt: 658200,
    agent: 'ALOK, PRATEEK',
    totalRec: 195360,
    balance: 462840,
    isRefund: true, // RED STYLING
    receipts: [
      { date: '2.1.26 (10%)', amount: 65820 },
      { date: '29.12.26 (20%)', amount: 129540 }
    ],
    emiLabels: ['Refund Done', 'Refund Done', 'Refund Done', 'Refund Done', 'Refund Done']
  });
  console.log('Added Sheet: P.NO. 50 (MANISH - REFUND DONE IN RED)');

  // 3. P.NO. 81: REENA NAGAR (Refund Done - In RED)
  createClientSheet({
    sheetName: 'P.NO. 81',
    clientName: 'REENA NAGAR (REFUND DONE)',
    plotNo: 81,
    plotSize: 127.92,
    rate: 4900,
    plotAmt: 626808,
    agent: 'PIYUSH KUMAR',
    totalRec: 62000,
    balance: 564808,
    isRefund: true, // RED STYLING
    receipts: [
      { date: '15.1.26 (10%)', amount: 62000 }
    ],
    emiLabels: ['Refund Done', 'Refund Done', 'Refund Done', 'Refund Done', 'Refund Done']
  });
  console.log('Added Sheet: P.NO. 81 (REENA NAGAR - REFUND DONE IN RED)');

  // Save changes
  try {
    await wb.xlsx.writeFile('DELHI OFFICE STATEMENT (1).xlsx');
    console.log('Successfully updated DELHI OFFICE STATEMENT (1).xlsx directly!');
  } catch (err) {
    console.log('Main file locked by Excel (' + err.code + '). Writing to DELHI OFFICE STATEMENT (1)_UPDATED.xlsx');
    await wb.xlsx.writeFile('DELHI OFFICE STATEMENT (1)_UPDATED.xlsx');
    console.log('Saved updated file as DELHI OFFICE STATEMENT (1)_UPDATED.xlsx');
  }
}

addMissingClientsToDelhi().catch(console.error);
