const ExcelJS = require('exceljs');

function cleanStr(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (val.result !== undefined) return String(val.result).trim();
    if (val.richText) return val.richText.map(t => t.text).join('').trim();
    if (val.text !== undefined) return String(val.text).trim();
  }
  return String(val).trim();
}

async function inspectExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = workbook.worksheets[0];
  console.log(`Sheet name: ${ws.name}, Total rows: ${ws.rowCount}, Total cols: ${ws.columnCount}`);

  // Print all column headers in row 1
  const row1 = ws.getRow(1);
  const headers = [];
  row1.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers.push(`Col ${colNumber} (${cell.address.replace(/\d+/, '')}): "${cleanStr(cell.value)}"`);
  });
  console.log('\n--- COLUMN HEADERS (Row 1) ---');
  console.log(headers.join('\n'));

  console.log('\n--- ALL CLIENT ROWS IN SVI Payment Details.xlsx ---');
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const rowVals = [];
    let hasVal = false;
    for (let c = 1; c <= ws.columnCount; c++) {
      const v = cleanStr(row.getCell(c).value);
      if (v) hasVal = true;
      rowVals.push(v);
    }
    if (hasVal) {
      console.log(`Row ${r}: [Plot: ${rowVals[2] || rowVals[1]}] Name: ${rowVals[6] || rowVals[1]}, Ticket: ${rowVals[19] || rowVals[3] || rowVals[4]}`);
      console.log('   Values:', JSON.stringify(rowVals));
    }
  }
}

inspectExcel().catch(console.error);
