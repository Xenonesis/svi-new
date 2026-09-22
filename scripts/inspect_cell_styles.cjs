const ExcelJS = require('exceljs');

async function inspectStyles() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = wb.worksheets[0];

  console.log('Sample cell styling in SVI Payment Details.xlsx:');
  const checkCells = ['D2', 'D4', 'D6', 'R2', 'S2', 'R8', 'S8', 'R16', 'S16'];
  for (const addr of checkCells) {
    const cell = ws.getCell(addr);
    console.log(`Cell ${addr}:`, {
      value: cell.value,
      type: cell.type,
      font: cell.font,
      alignment: cell.alignment,
      border: cell.border,
      fill: cell.fill,
      numFmt: cell.numFmt
    });
  }
}

inspectStyles().catch(console.error);
