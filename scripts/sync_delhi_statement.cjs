const ExcelJS = require('exceljs');
const fs = require('fs');

function cleanStr(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (val.result !== undefined) return String(val.result).trim();
    if (val.richText) return val.richText.map(t => t.text).join('').trim();
    if (val.text !== undefined) return String(val.text).trim();
  }
  return String(val).trim();
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const d = val.getDate();
    const m = val.getMonth() + 1;
    const y = val.getFullYear();
    return `${d}.${m}.${y % 100}`;
  }
  const str = cleanStr(val);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [y, m, d] = str.split('T')[0].split('-');
    return `${parseInt(d)}.${parseInt(m)}.${parseInt(y) % 100}`;
  }
  return str;
}

async function updateDelhiStatement() {
  const backupFile = 'DELHI OFFICE STATEMENT (1)_UPDATED_BACKUP.xlsx';
  const targetNewFile = 'DELHI OFFICE STATEMENT (1)_UPDATED_NEW.xlsx';
  const originalFile = 'DELHI OFFICE STATEMENT (1)_UPDATED.xlsx';

  console.log('1. Loading SVI Payment Details.xlsx...');
  const wbSvi = new ExcelJS.Workbook();
  await wbSvi.xlsx.readFile('SVI Payment Details.xlsx');
  const wsSvi = wbSvi.getWorksheet(1);

  console.log('2. Loading from backup: ' + backupFile + '...');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(backupFile);

  // Helper to expand 8th EMI into row 11 and make row 12 total
  function expandTo8thEmi(ws, emiDate, emiAmt, agentName, totalSum, balanceAmt) {
    ws.unMergeCells('H2:H11');

    const r11 = ws.getRow(11);
    const r10 = ws.getRow(10);
    const r11Style6 = { ...r11.getCell(6).style };
    const r11Style7 = { ...r11.getCell(7).style };
    const r11Style8 = { ...r11.getCell(8).style };

    // Set row 11 as 8th EMI
    r11.getCell(6).value = emiDate;
    r11.getCell(7).value = emiAmt;
    r11.getCell(8).value = agentName;
    r11.getCell(6).style = { ...r10.getCell(6).style };
    r11.getCell(7).style = { ...r10.getCell(7).style };
    r11.getCell(8).style = { ...r10.getCell(8).style };

    // Set row 12 as Total
    const r12 = ws.getRow(12);
    r12.getCell(6).value = 'TOTAL AMT. REC.';
    r12.getCell(7).value = { formula: 'SUM(G2:G11)', result: totalSum };
    r12.getCell(8).value = agentName;
    r12.getCell(6).style = r11Style6;
    r12.getCell(7).style = r11Style7;
    r12.getCell(8).style = r11Style8;

    // Re-merge H2:H12
    ws.mergeCells('H2:H12');

    // Update E3 and E4
    ws.getRow(3).getCell(5).value = { formula: 'G12', result: totalSum };
    ws.getRow(4).getCell(5).value = { formula: 'E2-E3', result: balanceAmt };
  }

  // --- Financial & EMI Updates ---
  // Sheet P.NO. 31 (Kundan Kumar)
  const ws31 = wb.getWorksheet('P.NO. 31');
  if (ws31) {
    ws31.getRow(2).getCell(6).value = '27.11.25 (10%)';
    expandTo8thEmi(ws31, '23.8.26 (8TH EMI)', 14292, 'DHIRAJ,KHUSHI', 261336, 228664);
  }

  // Sheet P.NO. 128,129 (Sarita & Shantanu Joshi)
  const ws128 = wb.getWorksheet('P.NO. 128,129');
  if (ws128) {
    ws128.getRow(2).getCell(6).value = '29.11.25 (10%)';
    ws128.getRow(3).getCell(6).value = '27.12.25 (20%)';
    const r10 = ws128.getRow(10);
    r10.getCell(6).value = '26.7.26 (7TH EMI)';
    r10.getCell(7).value = 48125;
    expandTo8thEmi(ws128, '1.9.26 (8TH EMI)', 48125, 'ARYAN, JAVED, MANISH', 880000, 620000);
  }

  // Sheet P.NO. 32 (Akshat Pardeshi)
  const ws32 = wb.getWorksheet('P.NO. 32');
  if (ws32) {
    expandTo8thEmi(ws32, '1.9.26 (8TH EMI)', 13125, 'ARYAN, RAGHUVENDRM, MANISH', 240000, 210000);
  }

  // Sheet P.NO. 35 (Piyush Sharma)
  const ws35 = wb.getWorksheet('P.NO. 35');
  if (ws35) {
    const r6 = ws35.getRow(6);
    r6.getCell(6).value = '4.9.26 (3RD EMI)';
    r6.getCell(7).value = 16042;
    r6.getCell(8).value = 'LUV KUMAR';
    ws35.getRow(11).getCell(7).value = { formula: 'SUM(G2:G10)', result: 268126 };
    ws35.getRow(3).getCell(5).value = { formula: 'G11', result: 268126 };
    ws35.getRow(4).getCell(5).value = { formula: 'E2-E3', result: 281874 };
  }

  // Sheet P.NO. 149 (Shiv Bhagwan)
  const ws149 = wb.getWorksheet('P.NO. 149');
  if (ws149) {
    ws149.getRow(2).getCell(1).value = 'SHIV BHAGWAN';
    ws149.getRow(2).getCell(3).value = 111.06;
    ws149.getRow(2).getCell(4).value = 5100;
    ws149.getRow(2).getCell(5).value = { formula: 'C2*D2', result: 566406 };
    ws149.getRow(3).getCell(6).value = '7.4.26 (20%)';
    ws149.getRow(3).getCell(7).value = 118945;
    ws149.getRow(11).getCell(7).value = { formula: 'SUM(G2:G10)', result: 178345 };
    ws149.getRow(3).getCell(5).value = { formula: 'G11', result: 178345 };
    ws149.getRow(4).getCell(5).value = { formula: 'E2-E3', result: 388061 };
  }

  // Sheet P.NO. 6 (Sunil Bhatnagar)
  const ws6 = wb.getWorksheet('P.NO. 6');
  if (ws6) {
    ws6.getRow(2).getCell(3).value = 105.38;
    ws6.getRow(2).getCell(4).value = 4900;
    ws6.getRow(2).getCell(5).value = { formula: 'C2*D2', result: 516362 };
    ws6.getRow(3).getCell(5).value = { formula: 'G11', result: 154908 };
    ws6.getRow(4).getCell(5).value = { formula: 'E2-E3', result: 361454 };
  }

  // Sheet P.NO. 126,127 (Nandini Kapoor)
  const ws126 = wb.getWorksheet('P.NO. 126,127');
  if (ws126) {
    ws126.getRow(2).getCell(3).value = 100;
    ws126.getRow(2).getCell(4).value = 5000;
    ws126.getRow(2).getCell(5).value = { formula: 'C2*D2', result: 500000 };
    ws126.getRow(3).getCell(5).value = { formula: 'G11', result: 50000 };
    ws126.getRow(4).getCell(5).value = { formula: 'E2-E3', result: 450000 };
  }

  // Sheet P.NO. 1 (Abhilasha Varma)
  const ws1 = wb.getWorksheet('P.NO. 1');
  if (ws1) {
    ws1.getRow(2).getCell(1).value = 'ABHILASHA VARMA';
  }

  // --- Add Complete Client Metadata (Ref ID, Contact, Mode, Address) from SVI Excel ---
  console.log('3. Enriching sheets with Ref ID, Mode, Phone, Email, Address from SVI Excel...');
  const SHEET_MAPPING = {
    '31': 'P.NO. 31',
    'old 134,135 New 128,129': 'P.NO. 128,129',
    '32': 'P.NO. 32',
    '50': 'P.NO. 50',
    '66': 'P.NO. 66',
    '65': 'P.NO. 65',
    '126': 'P.NO. 126',
    '33': 'P.NO. 33',
    '81': 'P.NO. 81',
    '5': 'P.NO. 5',
    '6': 'P.NO. 6',
    '126+127+': 'P.NO. 126,127',
    'A-221 and A-222': 'P.NO. 121,122',
    '30': 'P.NO. 30',
    '149': 'P.NO. 149',
    'A-181 and 182': 'P.NO. 181,182',
    '35': 'P.NO. 35',
    '36': 'P.NO. 36',
    '1': 'P.NO. 1',
  };

  for (let r = 2; r <= 20; r++) {
    const sRow = wsSvi.getRow(r);
    const plotRaw = cleanStr(sRow.getCell(3).value);
    if (!plotRaw) continue;

    const sheetName = SHEET_MAPPING[plotRaw];
    const ws = wb.getWorksheet(sheetName);
    if (!ws) continue;

    const clientName = cleanStr(sRow.getCell(7).value).replace(/\s+A$/, '').trim();
    const ticketId = cleanStr(sRow.getCell(4).value);
    const phone = cleanStr(sRow.getCell(9).value);
    const email = cleanStr(sRow.getCell(8).value);
    const address = cleanStr(sRow.getCell(10).value);
    const drawDateRaw = cleanStr(sRow.getCell(11).value);
    const isDirectSell = drawDateRaw.toLowerCase().includes('direct');
    const saleModeStr = isDirectSell
      ? 'Direct Sell'
      : `Draw Allotment (${formatDate(sRow.getCell(11).value) || drawDateRaw})`;

    // Update Client Name & Plot No in Row 2
    ws.getRow(2).getCell(1).value = clientName.toUpperCase();
    ws.getRow(2).getCell(2).value = plotRaw;

    // Contact info in rows A:E
    const isRefund = sheetName === 'P.NO. 50' || sheetName === 'P.NO. 81';
    const startR = isRefund ? 7 : 5;

    // Ensure cell directly above metadata card in Col A has medium bottom border for seamless connection
    const aboveCell = ws.getRow(startR - 1).getCell(1);
    aboveCell.style = { border: { left: { style: 'medium' }, bottom: { style: 'medium' } } };

    const cleanPhone = (phone && phone !== 'null' && phone !== 'undefined' && phone.trim() !== '') ? phone.trim() : '';
    const cleanEmail = (email && email !== 'null' && email !== 'undefined' && email.trim() !== '') ? email.trim() : '';
    const cleanAddress = (address && address !== '0' && address !== 'null' && address !== 'undefined' && address.trim() !== '') ? address.trim() : '';
    const cleanTicket = (ticketId && ticketId !== 'null' && ticketId !== 'undefined' && ticketId.trim() !== '') ? ticketId.trim() : '';

    const details = [
      {
        label: 'REF / TICKET ID',
        val: cleanTicket ? cleanTicket : 'Missing',
        type: 'ref',
        isMissing: !cleanTicket
      },
      {
        label: 'ALLOTMENT MODE',
        val: saleModeStr,
        type: 'mode',
        isMissing: false
      },
      {
        label: 'PHONE NO.',
        val: cleanPhone ? cleanPhone : 'Missing',
        type: 'phone',
        isMissing: !cleanPhone
      },
      {
        label: 'EMAIL',
        val: cleanEmail ? cleanEmail : 'Missing',
        type: 'email',
        isMissing: !cleanEmail
      },
      {
        label: 'ADDRESS',
        val: cleanAddress ? cleanAddress : 'Missing',
        type: 'addr',
        isMissing: !cleanAddress
      },
    ];

    details.forEach((item, idx) => {
      const rowIdx = startR + idx;
      const row = ws.getRow(rowIdx);
      const isFirst = idx === 0;
      const isLast = idx === details.length - 1;

      // Dynamic row height
      if (item.type === 'addr') {
        const lineCount = (item.val.split('\n').length);
        const len = item.val.length;
        let addrHeight = 22;
        if (lineCount >= 3 || len > 70) addrHeight = 42;
        else if (lineCount === 2 || len > 35) addrHeight = 30;
        row.height = addrHeight;
      } else {
        row.height = 20;
      }

      // 1. Column A (Label)
      const lblCell = row.getCell(1);
      lblCell.value = item.label;
      lblCell.style = {
        font: { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF111827' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } },
        alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
        border: {
          left: { style: 'medium' },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          top: isFirst ? { style: 'medium' } : { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: isLast ? { style: 'medium' } : { style: 'thin', color: { argb: 'FFD1D5DB' } }
        }
      };

      // 2. Columns B:E (Merged Value)
      ws.mergeCells(`B${rowIdx}:E${rowIdx}`);
      const valCell = row.getCell(2);
      valCell.value = item.val;

      let valFont;
      if (item.isMissing) {
        valFont = { name: 'Calibri', size: 10, bold: true, italic: true, color: { argb: 'FFDC2626' } };
      } else if (item.type === 'ref') {
        valFont = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF0F2942' } };
      } else if (item.type === 'mode') {
        valFont = { name: 'Calibri', size: 10, bold: true, color: { argb: isDirectSell ? 'FF4338CA' : 'FF92400E' } };
      } else if (item.type === 'phone') {
        valFont = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF111827' } };
      } else if (item.type === 'email') {
        valFont = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1D4ED8' } };
      } else {
        valFont = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF1F2937' } };
      }

      // Complete style for each cell in B:E
      for (let c = 2; c <= 5; c++) {
        const cell = row.getCell(c);
        cell.style = {
          font: valFont,
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
          alignment: { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 },
          border: {
            left: c === 2 ? { style: 'thin', color: { argb: 'FFD1D5DB' } } : undefined,
            right: c === 5 ? { style: 'medium' } : undefined,
            top: isFirst ? { style: 'medium' } : { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: isLast ? { style: 'medium' } : { style: 'thin', color: { argb: 'FFD1D5DB' } }
          }
        };
      }
    });
  }

  console.log('4. Saving updated workbook to ' + targetNewFile + '...');
  await wb.xlsx.writeFile(targetNewFile);
  console.log(`   Successfully saved ${targetNewFile}!`);

  console.log('5. Saving updated workbook to ' + originalFile + '...');
  await wb.xlsx.writeFile(originalFile);
  console.log(`   Successfully saved ${originalFile}!`);
}

updateDelhiStatement().catch(console.error);
