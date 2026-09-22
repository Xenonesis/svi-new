const ExcelJS = require('exceljs');

async function verify() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = wb.worksheets[0];

  console.log('=== VERIFYING SVI Payment Details.xlsx ===\n');

  const checks = [
    { cell: 'D5', expected: 'PL2050', label: 'Plot 50 (Manish) PL ID' },
    { cell: 'D7', expected: 'PL2065', label: 'Plot 65 (Ashok Kumar) PL ID' },
    { cell: 'D10', expected: 'PL2081', label: 'Plot 81 (Reena Nagar) PL ID' },
    { cell: 'D12', expected: 'PL2082', label: 'Plot 6 (Sunil Bhatnagar) PL ID' },
    { cell: 'D14', expected: 'PL2221', label: 'Plot A-221 and A-222 (Shyam Mohan Sharma) PL ID' },
    { cell: 'R16', expectedDate: '2026-09-22', label: 'Plot 149 (Shiv Bhagwan) EMI 1 Date' },
    { cell: 'S16', expected: 49473, label: 'Plot 149 (Shiv Bhagwan) EMI 1 Amount' },
  ];

  let allOk = true;
  for (const c of checks) {
    const val = ws.getCell(c.cell).value;
    if (c.expectedDate) {
      const dStr = val instanceof Date ? val.toISOString().split('T')[0] : String(val);
      if (dStr === c.expectedDate) {
        console.log(`✓ ${c.label} [${c.cell}]: ${dStr} (Matches expected: ${c.expectedDate})`);
      } else {
        console.log(`❌ ${c.label} [${c.cell}]: ${dStr} (Expected: ${c.expectedDate})`);
        allOk = false;
      }
    } else {
      if (val === c.expected) {
        console.log(`✓ ${c.label} [${c.cell}]: ${val} (Matches expected: ${c.expected})`);
      } else {
        console.log(`❌ ${c.label} [${c.cell}]: ${val} (Expected: ${c.expected})`);
        allOk = false;
      }
    }
  }

  // Print all 19 rows summary
  console.log('\n--- ALL 19 ROWS PL ID SUMMARY ---');
  for (let r = 2; r <= 20; r++) {
    const row = ws.getRow(r);
    console.log(`Row ${r}: Plot ${row.getCell(3).value} | Name: ${row.getCell(7).value} | PL ID: ${row.getCell(4).value}`);
  }

  if (allOk) {
    console.log('\n✅ ALL VERIFICATION CHECKS PASSED!');
  } else {
    console.log('\n❌ SOME CHECKS FAILED!');
  }
}

verify().catch(console.error);
