const ExcelJS = require('exceljs');

async function updateExcel() {
  const wb = new ExcelJS.Workbook();
  // Read from the clean backup
  await wb.xlsx.readFile('SVI Payment Details_BACKUP.xlsx');
  const ws = wb.worksheets[0];

  const defaultTextStyle = JSON.parse(JSON.stringify(ws.getCell('D2').style));
  const dateStyle = JSON.parse(JSON.stringify(ws.getCell('R3').style));
  const numStyle = JSON.parse(JSON.stringify(ws.getCell('S8').style));

  console.log('=== UPDATING SVI Payment Details.xlsx SAFELY ===\n');

  // 1. Manish (Plot 50, Row 5): PL2050
  console.log('1. Setting Cell D5 (Plot 50 - Manish) -> "PL2050"');
  const d5 = ws.getCell('D5');
  d5.value = 'PL2050';
  d5.style = defaultTextStyle;

  // 2. Ashok Kumar (Plot 65, Row 7): PL2065
  console.log('2. Setting Cell D7 (Plot 65 - Ashok Kumar) -> "PL2065"');
  const d7 = ws.getCell('D7');
  d7.value = 'PL2065';
  d7.style = defaultTextStyle;

  // 3. Reena Nagar (Plot 81, Row 10): PL2081
  console.log('3. Setting Cell D10 (Plot 81 - Reena Nagar) -> "PL2081"');
  const d10 = ws.getCell('D10');
  d10.value = 'PL2081';
  d10.style = defaultTextStyle;

  // 4. Sunil Bhatnagar (Plot 6, Row 12): PL2082
  console.log('4. Setting Cell D12 (Plot 6 - Sunil Bhatnagar) -> "PL2082"');
  const d12 = ws.getCell('D12');
  d12.value = 'PL2082';
  d12.style = defaultTextStyle;

  // 5. Shyam Mohan Sharma (Plot A-221 and A-222, Row 14): PL2221
  console.log('5. Setting Cell D14 (Plot A-221 and A-222 - Shyam Mohan Sharma) -> "PL2221"');
  const d14 = ws.getCell('D14');
  d14.value = 'PL2221';
  d14.style = defaultTextStyle;

  // 6. Shiv Bhagwan (Plot 149, Row 16): EMI 1 Date & Amount
  console.log('6. Setting Cell R16 (Plot 149 - Shiv Bhagwan Date) -> 2026-09-22');
  const r16 = ws.getCell('R16');
  r16.value = new Date('2026-09-22T00:00:00.000Z');
  r16.style = dateStyle;

  console.log('   Setting Cell S16 (Plot 149 - Shiv Bhagwan Amount) -> 49473');
  const s16 = ws.getCell('S16');
  s16.value = 49473;
  s16.style = numStyle;

  await wb.xlsx.writeFile('SVI Payment Details.xlsx');
  console.log('\n✓ SVI Payment Details.xlsx updated successfully with clean styles!');
}

updateExcel().catch(console.error);
