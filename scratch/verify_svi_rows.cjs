const ExcelJS = require('exceljs');

function parseCellMath(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'object') {
    if (val.result !== undefined) return parseFloat(val.result) || 0;
    if (val.richText) val = val.richText.map(t => t.text).join('').trim();
    else val = JSON.stringify(val);
  }
  let str = String(val).trim();
  if (str.includes('=')) {
    const parts = str.split('=');
    const afterEq = parts[parts.length - 1].trim().replace(/,/g, '');
    const num = parseFloat(afterEq);
    if (!isNaN(num)) return num;
  }
  str = str.replace(/,/g, '').replace(/[^0-9+-.]/g, '');
  try {
    const tokens = str.match(/([+-]?\d+(\.\d+)?)/g);
    if (tokens) return tokens.reduce((sum, t) => sum + parseFloat(t), 0);
  } catch (e) {}
  return parseFloat(str) || 0;
}

function clean(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    if (v.richText) return v.richText.map(t => t.text).join('').trim();
    if (v.result !== undefined) return String(v.result).trim();
  }
  return String(v).trim();
}

async function verify() {
  const wb2 = new ExcelJS.Workbook();
  await wb2.xlsx.readFile('SVI Payment Details.xlsx');
  const ws2 = wb2.getWorksheet(1);

  const sviRows = [];
  for (let r = 2; r <= 19; r++) {
    const row = ws2.getRow(r);
    const p10 = parseCellMath(row.getCell(14).value);
    const p20 = parseCellMath(row.getCell(16).value);
    let emiSum = 0;
    const emis = [];
    for (let c = 18; c <= 40; c += 2) {
      const amt = parseCellMath(row.getCell(c + 1).value);
      if (amt > 0) {
        emiSum += amt;
        emis.push({ emiNum: (c - 16) / 2, amt });
      }
    }
    const tot = p10 + p20 + emiSum;
    sviRows.push({
      row: r,
      name: clean(row.getCell(7).value),
      plot: clean(row.getCell(3).value),
      plId: clean(row.getCell(4).value),
      size: clean(row.getCell(2).value),
      bsp: parseCellMath(row.getCell(5).value),
      phone: clean(row.getCell(9).value),
      advisor: clean(row.getCell(12).value),
      p10, p20, emiSum, tot, emis
    });
  }

  console.log('--- SVI PAYMENT DETAILS ROWS (18 Rows) ---');
  sviRows.forEach(s => {
    console.log(`Row ${s.row}: Plot ${s.plot} | PL: ${s.plId || 'NONE'} | "${s.name}" | Size: ${s.size} | BSP: ${s.bsp} | 10%: ${s.p10} | 20%: ${s.p20} | EMIs(${s.emis.length}): ${s.emiSum} => TOTAL: ${s.tot} | Advisor: "${s.advisor}"`);
  });
}

verify().catch(console.error);
