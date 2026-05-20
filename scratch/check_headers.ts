import * as XLSX from 'xlsx';
import * as path from 'path';

async function main() {
  const excelPath = path.join(__dirname, '..', 'scrap', 'Inventario2025.xlsx');
  console.log('Reading:', excelPath);
  const workbook = XLSX.readFile(excelPath);
  console.log('Sheets:', workbook.SheetNames);
  
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
    if (data.length > 0) {
      console.log(`\nSheet: ${name}`);
      console.log('Headers:', data[0]);
    }
  }
}

main().catch(console.error);
