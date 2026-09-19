const ExcelJS = require('exceljs');

async function parse() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('SVI Payment Details.xlsx');
  
  wb.eachSheet((ws, sheetId) => {
    console.log(`\n================ Sheet: ${ws.name} (ID: ${sheetId}) ================`);
    ws.eachRow((row, rowNumber) => {
      const vals = row.values;
      // print row values
      console.log(`Row ${rowNumber}:`, JSON.stringify(vals));
    });
  });
}
parse().catch(console.error);
